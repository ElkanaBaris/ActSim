import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSessionSchema, decisionSchema, outcomeSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy",
      timestamp: new Date().toISOString()
    });
  });

  // Get all scenarios
  app.get("/api/scenarios", async (req, res) => {
    try {
      const scenarios = await storage.getScenarios();
      res.json(scenarios);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scenarios" });
    }
  });

  // Get specific scenario
  app.get("/api/scenarios/:id", async (req, res) => {
    try {
      const scenario = await storage.getScenario(req.params.id);
      if (!scenario) {
        return res.status(404).json({ error: "Scenario not found" });
      }
      res.json(scenario);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scenario" });
    }
  });

  // Create new session
  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid session data" });
    }
  });

  // Get session
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  // Record decision
  app.post("/api/sessions/:id/decisions", async (req, res) => {
    try {
      const decision = decisionSchema.parse(req.body);
      const success = await storage.recordDecision(req.params.id, decision);
      if (!success) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json({ success: true, decision });
    } catch (error) {
      res.status(400).json({ error: "Invalid decision data" });
    }
  });

  // Complete session
  app.post("/api/sessions/:id/complete", async (req, res) => {
    try {
      const { outcome, duration } = req.body;
      const parsedOutcome = outcomeSchema.parse(outcome);
      
      const session = await storage.completeSession(req.params.id, parsedOutcome, duration);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.json({ success: true, session });
    } catch (error) {
      res.status(400).json({ error: "Invalid completion data" });
    }
  });

  // Get session replay data
  app.get("/api/sessions/:id/replay", async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.json({
        session,
        replayData: {
          decisions: session.decisions,
          duration: session.duration,
          outcome: session.outcome
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch replay data" });
    }
  });

  // Get user statistics
  app.get("/api/users/:id/stats", async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.params.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const scenarioId = req.query.scenarioId as string;
      const leaderboard = await storage.getLeaderboard(scenarioId);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
