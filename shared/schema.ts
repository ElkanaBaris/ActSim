import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const scenarios = pgTable("scenarios", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(),
  estimatedTime: text("estimated_time").notNull(),
  tags: text("tags").array(),
  steps: jsonb("steps").notNull(),
  stats: jsonb("stats").notNull()
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  scenarioId: text("scenario_id").notNull(),
  userId: text("user_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  status: text("status").notNull().default("active"),
  decisions: jsonb("decisions").notNull().default([]),
  outcome: jsonb("outcome"),
  duration: integer("duration")
});

export const insertScenarioSchema = createInsertSchema(scenarios).omit({
  id: true
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  startTime: true,
  endTime: true
});

export const decisionSchema = z.object({
  stepId: z.string(),
  optionId: z.string(),
  timestamp: z.number()
});

export const outcomeSchema = z.object({
  success: z.boolean(),
  type: z.string(),
  duration: z.number().optional(),
  score: z.number().optional()
});

export type InsertScenario = z.infer<typeof insertScenarioSchema>;
export type Scenario = typeof scenarios.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
export type Decision = z.infer<typeof decisionSchema>;
export type Outcome = z.infer<typeof outcomeSchema>;
