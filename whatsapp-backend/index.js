
import express from 'express';
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode';
import fs from 'fs';

const app = express();
app.use(express.json());

// Gerencia múltiplas sessões de clientes
const sessions = {};
const MAX_SESSIONS = 10; // Limite para evitar abuso de memória

const PUPPETEER_ARGS = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu'
];

// Função para criar e inicializar uma sessão
const createSession = (sessionId) => {
    console.log(`[${sessionId}] Criando nova sessão...`);
    
    const client = new Client({
        authStrategy: new LocalAuth({ clientId: sessionId }),
        puppeteer: {
            headless: true,
            args: PUPPETEER_ARGS,
            executablePath: process.env.CHROME_BIN || undefined,
        }
    });

    client.on('qr', (qr) => {
        console.log(`[${sessionId}] QR Code recebido. Gerando base64...`);
        qrcode.toDataURL(qr, (err, url) => {
            if (err) {
                console.error(`[${sessionId}] Erro ao gerar QR Code:`, err);
                sessions[sessionId].qr = null;
                sessions[sessionId].error = 'Falha ao gerar QR Code.';
                return;
            }
            sessions[sessionId].qr = url;
            sessions[sessionId].status = 'QR_CODE_READY';
        });
    });

    client.on('ready', () => {
        console.log(`[${sessionId}] Cliente está pronto!`);
        sessions[sessionId].status = 'CONNECTED';
        sessions[sessionId].qr = null; // QR não é mais necessário
    });

    client.on('auth_failure', (msg) => {
        console.error(`[${sessionId}] Falha na autenticação:`, msg);
        sessions[sessionId].status = 'AUTH_FAILURE';
        sessions[sessionId].error = 'Falha na autenticação. Por favor, tente novamente.';
        // Aqui você pode remover a sessão para forçar uma nova tentativa
        setTimeout(() => removeSession(sessionId), 5000);
    });
    
    client.on('disconnected', (reason) => {
        console.log(`[${sessionId}] Cliente foi desconectado!`, reason);
        removeSession(sessionId);
    });

    client.initialize().catch(err => {
        console.error(`[${sessionId}] Falha ao inicializar: `, err);
        sessions[sessionId].status = 'ERROR';
        sessions[sessionId].error = 'Falha ao inicializar o cliente WhatsApp.';
    });

    sessions[sessionId] = {
        client,
        status: 'INITIALIZING',
        qr: null,
        error: null,
    };
};

// Função para remover uma sessão
const removeSession = (sessionId) => {
    if (sessions[sessionId]) {
        sessions[sessionId].client.destroy();
        delete sessions[sessionId];
        console.log(`[${sessionId}] Sessão removida.`);
    }
};

/**
 * ROTA: /start-session
 * Inicia uma nova sessão de WhatsApp e retorna o QR Code.
 */
app.post('/start-session', (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ success: false, error: 'userId é obrigatório.' });
    }

    const sessionId = `session-${userId}`;

    if (Object.keys(sessions).length >= MAX_SESSIONS && !sessions[sessionId]) {
         return res.status(503).json({ success: false, error: 'Serviço temporariamente sobrecarregado. Tente mais tarde.' });
    }
    
    if (!sessions[sessionId]) {
        createSession(sessionId);
    }

    const session = sessions[sessionId];
    
    // Tenta retornar o QR Code. Espera até 30 segundos.
    let attempts = 0;
    const interval = setInterval(() => {
        const currentSession = sessions[sessionId];

        if (currentSession?.status === 'QR_CODE_READY' && currentSession.qr) {
            clearInterval(interval);
            return res.json({ success: true, qrCode: currentSession.qr, sessionId });
        }
        
        if (currentSession?.status === 'CONNECTED') {
             clearInterval(interval);
             return res.json({ success: true, message: 'Sessão já está conectada.' });
        }

        if (currentSession?.error) {
            clearInterval(interval);
            return res.status(500).json({ success: false, error: currentSession.error });
        }

        if (attempts++ > 30) {
            clearInterval(interval);
            removeSession(sessionId);
            return res.status(500).json({ success: false, error: 'Timeout: QR Code não foi gerado a tempo.' });
        }
    }, 1000);
});

/**
 * ROTA: /send-message
 * Envia uma mensagem usando uma sessão ativa.
 */
app.post('/send-message', async (req, res) => {
    const { sessionId, number, message } = req.body;

    if (!sessionId || !number || !message) {
        return res.status(400).json({ success: false, error: 'sessionId, number e message são obrigatórios.' });
    }

    const session = sessions[sessionId];
    if (!session || session.status !== 'CONNECTED') {
        return res.status(404).json({ success: false, error: 'Sessão não encontrada ou não conectada.' });
    }

    try {
        const sanitized_number = number.replace(/[-+()\s]/g, ''); // Remove caracteres especiais
        const final_number = `55${sanitized_number}@c.us`; // Adiciona DDI do Brasil

        const msg = await session.client.sendMessage(final_number, message);
        console.log(`[${sessionId}] Mensagem enviada para ${final_number}`);
        res.json({ success: true, messageId: msg.id._serialized });
    } catch (err) {
        console.error(`[${sessionId}] Erro ao enviar mensagem:`, err);
        res.status(500).json({ success: false, error: 'Falha ao enviar mensagem.' });
    }
});


/**
 * ROTA: /status
 * Retorna o status de todas as sessões ativas (para debug).
 */
app.get('/status', (req, res) => {
    const activeSessions = Object.keys(sessions).map(sessionId => ({
        sessionId,
        status: sessions[sessionId].status,
        hasQr: !!sessions[sessionId].qr,
    }));
    res.json({ activeSessions });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Backend WhatsApp rodando na porta ${PORT}`);
});
