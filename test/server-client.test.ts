import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { once } from 'node:events';

// Minimal server mirroring key functionality of server/index.ts
function startTestServer() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/v2' });
  wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'welcome', message: 'Ready for scenarios' }));
  });

  return { server, wss };
}

test('server API and WebSocket integration', async (t) => {
  const { server, wss } = startTestServer();

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as any).port;

  t.after(() => {
    wss.close();
    server.close();
  });

  const res = await fetch(`http://127.0.0.1:${port}/api/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'healthy');

  const ws = new (WebSocket as any)(`ws://127.0.0.1:${port}/v2`);
  const [event] = await once(ws, 'message');
  const raw = (event instanceof MessageEvent) ? event.data : event;
  const data = JSON.parse(raw.toString());
  assert.equal(data.type, 'welcome');
  assert.equal(data.message, 'Ready for scenarios');
  ws.close();
});
