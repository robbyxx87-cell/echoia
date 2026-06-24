import express from 'express';
import cors from 'cors';
import { processMessage } from '../lib/cognitive/cognitivePipeline';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Simple in-memory storage
const conversations = new Map<string, any[]>();

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'EchoIA', 
    version: '0.2.0',
    timestamp: new Date().toISOString() 
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { userId, message, sessionId = 'default' } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }

    const convKey = `${userId}:${sessionId}`;
    if (!conversations.has(convKey)) {
      conversations.set(convKey, []);
    }

    console.log(`[EchoIA] Processing message from ${userId}`);

    const result = await processMessage({
      userId,
      userMessage: message,
      sessionId,
    });

    const history = conversations.get(convKey)!;
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: result.response });

    res.json({
      success: true,
      response: result.response,
      internalState: result.perception?.metaSignal || null,
      soulState: result.soulState,
    });

  } catch (error: any) {
    console.error('[EchoIA] Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

app.get('/api/history/:userId', (req, res) => {
  const { userId } = req.params;
  const sessionId = req.query.sessionId as string || 'default';
  const history = conversations.get(`${userId}:${sessionId}`) || [];
  res.json({ success: true, history });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║         EchoIA Platform Started            ║
╠════════════════════════════════════════════╣
║  Server:     http://localhost:${PORT}       ║
║  Chat UI:    http://localhost:${PORT}       ║
║  Health:     http://localhost:${PORT}/health║
╚════════════════════════════════════════════╝
  `);
});