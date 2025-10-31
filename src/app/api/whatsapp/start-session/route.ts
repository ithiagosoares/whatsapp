import { NextRequest, NextResponse } from 'next/server';
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode';

// This is a simple in-memory store for client sessions.
// For a production app, you'd want to use a more robust solution like Redis or a database.
const sessions = new Map<string, Client>();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  // If a session already exists and is ready, we might not need to do anything.
  if (sessions.has(userId)) {
      try {
        const existingClient = sessions.get(userId)!;
        const state = await existingClient.getState();
        if (state === 'CONNECTED') {
             return NextResponse.json({ message: 'Session already connected.' });
        }
        // If not connected, destroy and recreate
        await existingClient.destroy();
        sessions.delete(userId);
    } catch (e) {
        console.log("Error with existing client, creating new session for", userId);
        sessions.delete(userId);
    }
  }


  console.log(`[${userId}] Creating new WhatsApp session...`);
  
  const client = new Client({
    authStrategy: new LocalAuth({ clientId: userId }),
    puppeteer: {
      headless: true,
      executablePath: '/usr/bin/google-chrome-stable', // Path to the installed Chrome browser
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
        sessions.delete(userId);
        client.destroy().catch(e => console.error("Error destroying client on timeout", e));
        resolve(NextResponse.json({ error: 'QR code generation timed out.' }, { status: 500 }));
    }, 60000); // 60-second timeout

    client.on('qr', async (qr) => {
      console.log(`[${userId}] QR Code received.`);
      clearTimeout(timeout);
      try {
        const qrCodeBase64 = await qrcode.toDataURL(qr);
        
        const responsePayload = {
            qrCode: qrCodeBase64,
            sessionId: userId,
        };
        
        // Asynchronously send to n8n without blocking the response to the frontend
        // This is a "fire and forget" call.
        fetch('https://vitallink.app.n8n.cloud/webhook-test/start-whatsapp-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(responsePayload),
        }).catch(err => console.error(`[${userId}] Failed to send QR to n8n:`, err));

        resolve(NextResponse.json(responsePayload));
      } catch (err) {
        console.error(`[${userId}] Error generating QR code base64:`, err);
        resolve(NextResponse.json({ error: 'Failed to generate QR code.' }, { status: 500 }));
      }
    });

    client.on('ready', () => {
      console.log(`[${userId}] WhatsApp client is ready!`);
      clearTimeout(timeout);
    });

    client.on('auth_failure', (msg) => {
      console.error(`[${userId}] Authentication failure:`, msg);
      clearTimeout(timeout);
      sessions.delete(userId);
      client.destroy().catch(e => console.error("Error destroying client on auth failure", e));
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
