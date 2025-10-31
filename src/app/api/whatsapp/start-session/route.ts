import { NextRequest, NextResponse } from 'next/server';
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode';

// This is a simple in-memory store for client sessions.
// For a production app, you'd want to use a more robust solution like Redis or a database.
const sessions = new Map<string, Client>();
const qrStore = new Map<string, string>();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  if (sessions.has(userId)) {
    const client = sessions.get(userId)!;
    // If we have a client, check its status. This is a simplified check.
    // A more robust implementation would properly check the connection status.
     try {
        const state = await client.getState();
        if (state === 'CONNECTED') {
             return NextResponse.json({ message: 'Session already connected.' });
        }
    } catch (e) {
        // Client might be in a weird state, let's remove it and create a new one
        console.log("Client state error, creating new session for", userId)
        sessions.delete(userId);
    }
  }

  console.log(`[${userId}] Creating new WhatsApp session...`);
  
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
        '--disable-gpu'
      ],
    },
  });

  sessions.set(userId, client);

  return new Promise((resolve) => {
    
    const timeout = setTimeout(() => {
        console.error(`[${userId}] QR code generation timed out.`);
        sessions.delete(userId); // Clean up the failed session
        client.destroy();
        resolve(NextResponse.json({ error: 'QR code generation timed out.' }, { status: 500 }));
    }, 60000); // 60-second timeout

    client.on('qr', async (qr) => {
      console.log(`[${userId}] QR Code received.`);
      clearTimeout(timeout);
      try {
        const qrCodeBase64 = await qrcode.toDataURL(qr);
        qrStore.set(userId, qrCodeBase64); // Store QR code
        
        const responsePayload = {
            qrCode: qrCodeBase64,
            sessionId: userId, // Using userId as sessionId for simplicity
        };
        
        // Asynchronously send to n8n without blocking the response to the frontend
        fetch('https://vitallink.app.n8n.cloud/webhook-test/start-whatsapp-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(responsePayload),
        }).catch(err => console.error(`[${userId}] Failed to send QR to n8n:`, err));

        // Immediately resolve and send QR code to the frontend
        resolve(NextResponse.json(responsePayload));
      } catch (err) {
        console.error(`[${userId}] Error generating QR code base64:`, err);
        resolve(NextResponse.json({ error: 'Failed to generate QR code.' }, { status: 500 }));
      }
    });

    client.on('ready', () => {
      console.log(`[${userId}] WhatsApp client is ready!`);
      clearTimeout(timeout); // Clear timeout on successful connection
      qrStore.delete(userId); // QR code is no longer needed
      // In a real app, you might want to notify the frontend that connection is complete.
    });

    client.on('auth_failure', (msg) => {
      console.error(`[${userId}] Authentication failure:`, msg);
      clearTimeout(timeout);
      sessions.delete(userId);
      client.destroy();
      resolve(NextResponse.json({ error: 'Authentication failed.' }, { status: 500 }));
    });
    
    client.initialize().catch(err => {
        console.error(`[${userId}] Client initialization failed:`, err);
        clearTimeout(timeout);
        sessions.delete(userId);
        resolve(NextResponse.json({ error: 'Failed to initialize WhatsApp client.' }, { status: 500 }));
    });
  });
}
