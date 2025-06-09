// server/index.ts

import express, { type Request, type Response, type NextFunction } from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// ————————————————————————————————————————————————————————————————
// Body parsing middleware
// ————————————————————————————————————————————————————————————————
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ————————————————————————————————————————————————————————————————
// Simple request logger for /api routes
// ————————————————————————————————————————————————————————————————
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJson: any;

  // Capture the original res.json
  const _json = res.json.bind(res) as (body: any) => Response;

  // Override to grab the body
  res.json = (body: any): Response => {
    capturedJson = body;
    return _json(body);
  };

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      const ms = Date.now() - start;
      let line = `${req.method} ${path} ${res.statusCode} in ${ms}ms`;
      if (capturedJson !== undefined) {
        line += ` :: ${JSON.stringify(capturedJson)}`;
      }
      if (line.length > 80) {
        line = line.slice(0, 79) + "…";
      }
      log(line);
    }
  });

  next();
});

(async () => {
  // ——————————————————————————————————————————————————————
  // Mount API routes and get the underlying HTTP server
  // registerRoutes should call app.use(...) for your routes
  // and then return the new http.Server instance.
  // ——————————————————————————————————————————————————————
  const server: http.Server = await registerRoutes(app);

  // ——————————————————————————————————————————————————————
  // Attach a WebSocket server on the same HTTP server at path /v2
  // ——————————————————————————————————————————————————————
  const wss = new WebSocketServer({ server, path: "/v2" });
  wss.on("connection", (ws) => {
    log("🚀 [WS] client connected to /v2");
    // Send an initial message
    ws.send(JSON.stringify({ type: "welcome", message: "Ready for scenarios" }));

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        log(`📨 [WS] received: ${JSON.stringify(msg)}`);
        // TODO: handle incoming messages here…
      } catch {
        log(`⚠️ [WS] invalid JSON: ${data}`);
      }
    });

    ws.on("close", () => {
      log("🔌 [WS] client disconnected");
    });
  });

  // ——————————————————————————————————————————————————————
  // Error handler (must come after routes)
  // ——————————————————————————————————————————————————————
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    // Rethrow if you want to crash on unhandled exceptions:
    throw err;
  });

  // ——————————————————————————————————————————————————————
  // Vite integration in development, or static serve in prod
  // ——————————————————————————————————————————————————————
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ——————————————————————————————————————————————————————
  // Finally, listen on localhost:5000 for both HTTP and WS
  // ——————————————————————————————————————————————————————
  const PORT = 5000;
  server.listen({ port: PORT, host: "127.0.0.1" }, () => {
    log(`🖥️  HTTP+WS server listening on http://127.0.0.1:${PORT}`);
  });
})();
