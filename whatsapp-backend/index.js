const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const app = express();
app.use(express.json());

const clients = {};

// Endpoint para iniciar a sessão e obter o QR code
app.post('/start-session', async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ success: false, error: 'userId is required' });
    }

    console.log(`[${userId}] Iniciando sessão...`);

    const client = new Client({
        authStrategy: new LocalAuth({ clientId: userId }),
        puppeteer: {
            headless: true,
            executablePath: '/usr/bin/google-chrome-stable',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process', // <- this one doesn't works in Windows
                '--disable-gpu'
            ],
        },
    });

    client.on('qr', async (qr) => {
        console.log(`[${userId}] QR Code recebido. Enviando para o frontend.`);
        try {
            const qrCodeBase64 = await qrcode.toDataURL(qr);
            // Este evento pode ser emitido várias vezes, mas só queremos enviar uma resposta.
            if (!res.headersSent) {
                res.json({ success: true, qrCode: qrCodeBase64 });
            }
        } catch (err) {
            console.error(`[${userId}] Erro ao gerar QR Code:`, err);
            if (!res.headersSent) {
                res.status(500).json({ success: false, error: 'Failed to generate QR code' });
            }
        }
    });

    client.on('ready', () => {
        console.log(`[${userId}] WhatsApp conectado e pronto!`);
        clients[userId] = client;
    });

    client.on('auth_failure', (msg) => {
        console.error(`[${userId}] Falha na autenticação:`, msg);
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: 'Authentication failure' });
        }
    });

    client.initialize().catch(err => {
         console.error(`[${userId}] Falha ao inicializar o cliente:`, err);
         if (!res.headersSent) {
            res.status(500).json({ success: false, error: 'Failed to initialize client' });
        }
    });
});

// Endpoint para enviar mensagem
app.post('/send-message', async (req, res) => {
    const { userId, number, message } = req.body;
    if (!userId || !number || !message) {
        return res.status(400).json({ success: false, error: 'userId, number, and message are required' });
    }

    const client = clients[userId];
    if (!client) {
        return res.status(404).json({ success: false, error: 'Session not found for this userId. Please start a session first.' });
    }

    try {
        // Formato do número: 55DDDNUMERO@c.us (ex: 5511999999999@c.us)
        const chatId = `${number}@c.us`;
        await client.sendMessage(chatId, message);
        console.log(`[${userId}] Mensagem enviada para ${number}`);
        res.json({ success: true, message: 'Message sent successfully' });
    } catch (err) {
        console.error(`[${userId}] Erro ao enviar mensagem:`, err);
        res.status(500).json({ success: false, error: 'Failed to send message' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor WhatsApp rodando na porta ${PORT}`);
});
