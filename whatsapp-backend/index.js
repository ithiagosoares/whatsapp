const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const cors = require('cors');

const app = express();
app.use(cors()); // Permite requisições de outras origens (seu frontend)
app.use(express.json());

const sessions = {};

const createWhatsappSession = (sessionId) => {
  console.log(`Criando sessão: ${sessionId}`);
  
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
        '--single-process', // <- this one doesn't works in Windows
        '--disable-gpu'
      ],
    },
  });

  client.on('qr', async (qr) => {
    console.log(`[${sessionId}] QR Code recebido, gerando base64...`);
    const qrImage = await qrcode.toDataURL(qr);
    sessions[sessionId] = { ...sessions[sessionId], qr: qrImage, status: 'QR_PENDING' };
  });

  client.on('ready', () => {
    console.log(`[${sessionId}] WhatsApp está pronto!`);
    sessions[sessionId].status = 'READY';
  });

  client.on('authenticated', () => {
    console.log(`[${sessionId}] Autenticado com sucesso!`);
    sessions[sessionId].status = 'AUTHENTICATED';
  });
  
  client.on('auth_failure', (msg) => {
    console.error(`[${sessionId}] Falha na autenticação:`, msg);
    // Encerra e remove a sessão com falha
    delete sessions[sessionId];
    client.destroy();
  });

  client.initialize().catch(err => console.error(`[${sessionId}] Falha ao inicializar o cliente: `, err));

  sessions[sessionId] = { client, status: 'INITIALIZING' };
  return client;
};

// Rota para iniciar a sessão e obter o QR Code
app.post('/start-session', async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ success: false, error: 'sessionId é obrigatório.' });
  }

  if (sessions[sessionId] && (sessions[sessionId].status === 'READY' || sessions[sessionId].status === 'AUTHENTICATED')) {
     return res.json({ success: true, message: 'Sessão já está ativa.' });
  }

  // Cria uma nova sessão se não existir
  createWhatsappSession(sessionId);

  // Espera pelo QR code ser gerado
  let attempts = 0;
  const interval = setInterval(() => {
    if (sessions[sessionId] && sessions[sessionId].qr) {
      clearInterval(interval);
      return res.json({ success: true, qrCode: sessions[sessionId].qr });
    }
    if (attempts++ > 30) { // Timeout de 30 segundos
      clearInterval(interval);
      delete sessions[sessionId]; // Limpa a sessão falha
      return res.status(500).json({ success: false, error: 'Timeout ao gerar QR Code.' });
    }
  }, 1000);
});

// Rota para enviar mensagem
app.post('/send-message', async (req, res) => {
  const { sessionId, number, message } = req.body;
  if (!sessionId || !number || !message) {
    return res.status(400).json({ success: false, error: 'sessionId, number e message são obrigatórios.' });
  }

  const session = sessions[sessionId];
  if (!session || session.status !== 'READY') {
    return res.status(400).json({ success: false, error: 'Sessão não está pronta ou não existe.' });
  }
  
  try {
    // Formata o número para o padrão do WhatsApp (ex: 5511999998888@c.us)
    const sanitized_number = number.replace(/[-+ ()]/g, '');
    const final_number = `55${sanitized_number}@c.us`;
    
    await session.client.sendMessage(final_number, message);
    res.json({ success: true, message: 'Mensagem enviada com sucesso!' });
  } catch (err) {
    console.error(`[${sessionId}] Erro ao enviar mensagem:`, err);
    res.status(500).json({ success: false, error: 'Falha ao enviar mensagem.' });
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor WhatsApp rodando na porta ${PORT}`);
});
