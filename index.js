const express = require('express');
const cors = require('cors'); // Importa o CORS
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const app = express();

// Habilita o CORS para todas as origens
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const sessions = {};

console.log('Starting server...');

app.post('/start-session', (req, res) => {
    // Para simplificar, usaremos uma única sessão por enquanto
    const userId = 'default-user'; 
    console.log(`Starting session for userId: ${userId}`);
    const sessionId = `session-${userId}`;

    if (sessions[sessionId] && sessions[sessionId].ready) {
        console.log(`Session for ${userId} is already ready.`);
        return res.json({ success: true, message: "Client is already connected!" });
    }
    
    if (sessions[sessionId] && sessions[sessionId].client) {
         // Se a sessão existe mas não está pronta, o cliente já está inicializando.
         // A lógica de polling abaixo cuidará de retornar o QR code.
         console.log(`Initialization already in progress for ${userId}.`);
    } else {
        const client = new Client({
            authStrategy: new LocalAuth({ clientId: sessionId }),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process', // Isso pode não ser ideal para todos os casos, mas ajuda em ambientes restritos
                    '--disable-gpu'
                ]
            }
        });

        client.on('qr', async (qr) => {
            console.log(`QR code generated for ${userId}`);
            try {
                const qrCodeBase64 = await qrcode.toDataURL(qr);
                if (sessions[sessionId]) {
                    sessions[sessionId].qr = qrCodeBase64;
                }
            } catch (err) {
                console.error('Error generating QR code data URL', err);
            }
        });

        client.on('ready', () => {
            console.log(`WhatsApp client is ready for ${userId}!`);
            if (sessions[sessionId]) {
                sessions[sessionId].ready = true;
                delete sessions[sessionId].qr;
            }
        });

        client.on('auth_failure', msg => {
            console.error(`Authentication failure for ${userId}:`, msg);
            // Limpa a sessão falha para permitir uma nova tentativa
             if (sessions[sessionId]) {
                sessions[sessionId].client.destroy();
                delete sessions[sessionId];
            }
        });

        client.on('disconnected', (reason) => {
            console.log(`Client for ${userId} was logged out:`, reason);
            if (sessions[sessionId]) {
                sessions[sessionId].client.destroy();
                delete sessions[sessionId];
            }
        });
        
        console.log(`Initializing new client for ${userId}`);
        sessions[sessionId] = { client, ready: false, qr: null };
        client.initialize().catch(err => console.error(`Failed to initialize client for ${userId}:`, err));
    }


    // Polling para retornar o QR code ou o status de 'pronto'
    let attempts = 0;
    const interval = setInterval(() => {
        if (sessions[sessionId] && sessions[sessionId].qr) {
            clearInterval(interval);
            console.log(`Sending QR code to client for ${userId}`);
            res.json({ success: true, qr: sessions[sessionId].qr });
        } else if (sessions[sessionId] && sessions[sessionId].ready) {
            clearInterval(interval);
            console.log(`Informing client that session is ready for ${userId}`);
            res.json({ success: true, message: "Client is already connected!" });
        } else if (attempts > 30) { // Timeout de 30 segundos
            clearInterval(interval);
            console.log(`QR code generation timed out for ${userId}`);
            res.status(500).json({ success: false, error: 'QR code generation timed out.' });
             if (sessions[sessionId]) {
                sessions[sessionId].client.destroy();
                delete sessions[sessionId];
            }
        }
        attempts++;
    }, 1000);
});


app.post('/send-message', async (req, res) => {
    const userId = 'default-user';
    const { number, message } = req.body;
    if (!number || !message) {
        return res.status(400).json({ error: 'number and message are required' });
    }

    const sessionId = `session-${userId}`;
    const session = sessions[sessionId];

    if (session && session.ready) {
        try {
            const chatId = `${number}@c.us`;
            await session.client.sendMessage(chatId, message);
            res.json({ success: true, message: 'Message sent successfully.' });
        } catch (error) {
            console.error('Failed to send message:', error);
            res.status(500).json({ success: false, error: 'Failed to send message.' });
        }
    } else {
        res.status(404).json({ success: false, error: 'Session not found or not ready.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
