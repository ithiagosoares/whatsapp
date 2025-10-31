const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const sessions = {};

console.log('Starting server...');

app.post('/start-session', (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ success: false, error: 'userId is required' });
    }

    console.log(`Starting session for userId: ${userId}`);
    const sessionId = `session-${userId}`;

    const client = new Client({
        authStrategy: new LocalAuth({ clientId: sessionId }),
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
                '--single-process',
                '--disable-gpu'
            ]
        }
    });

    client.on('qr', async (qr) => {
        console.log(`QR code generated for ${userId}`);
        try {
            const qrCodeBase64 = await qrcode.toDataURL(qr);
            // This endpoint is long-lived, so we can't send the response here.
            // In a real-world scenario, you'd use WebSockets or another mechanism
            // to push this to the client. For now, we will just log it.
            // A simple short-term solution is to store it and have the client poll for it.
            sessions[sessionId] = { ...sessions[sessionId], qr: qrCodeBase64 };
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
    });

    client.on('disconnected', (reason) => {
        console.log(`Client for ${userId} was logged out:`, reason);
        delete sessions[sessionId];
        client.destroy();
    });

    sessions[sessionId] = { client, ready: false, qr: null };
    client.initialize().catch(err => console.error(`Failed to initialize client for ${userId}:`, err));

    // Polling mechanism for the frontend to get the QR code
    let attempts = 0;
    const interval = setInterval(() => {
        if (sessions[sessionId] && sessions[sessionId].qr) {
            clearInterval(interval);
            res.json({ success: true, qrCode: sessions[sessionId].qr });
        } else if (sessions[sessionId] && sessions[sessionId].ready) {
            clearInterval(interval);
            res.json({ success: true, message: "Client is already ready." });
        } else if (attempts > 30) { // 30-second timeout
            clearInterval(interval);
            res.status(500).json({ success: false, error: 'QR code generation timed out.' });
        }
        attempts++;
    }, 1000);
});

app.post('/send-message', async (req, res) => {
    const { userId, number, message } = req.body;
    if (!userId || !number || !message) {
        return res.status(400).json({ error: 'userId, number, and message are required' });
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
