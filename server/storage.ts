// @ts-nocheck
import { scenarios, sessions, type Scenario, type Session, type InsertScenario, type InsertSession, type Decision, type Outcome } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Scenarios
  getScenarios(): Promise<Scenario[]>;
  getScenario(id: string): Promise<Scenario | undefined>;
  createScenario(scenario: InsertScenario): Promise<Scenario>;
  
  // Sessions
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined>;
  recordDecision(sessionId: string, decision: Decision): Promise<boolean>;
  completeSession(sessionId: string, outcome: Outcome, duration: number): Promise<Session | undefined>;
  
  // Statistics
  getUserStats(userId: string): Promise<any>;
  getLeaderboard(scenarioId?: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultScenarios();
  }

  private async initializeDefaultScenarios() {
    try {
      const existingScenarios = await db.select().from(scenarios);
      if (existingScenarios.length === 0) {
        const urbanRaidScenario = {
          id: "urban-raid-001",
          name: "Urban Compound Raid",
          description: "Multi-phase tactical infiltration of fortified Middle Eastern compound",
          difficulty: "Advanced",
          estimatedTime: "15-20 minutes",
          tags: ["urban", "stealth", "tactical"],
          steps: [
            {
              id: "approach",
              title: "Initial Approach",
              description: "You are positioned at overwatch. The compound is ahead with multiple entry points visible.",
              cameraPosition: { x: 0, y: 8, z: 80 },
              cameraTarget: { x: 0, y: 10, z: 0 },
              options: [
                {
                  id: "stealth",
                  title: "Stealth Approach",
                  description: "Move quietly through shadows, avoid detection"
                },
                {
                  id: "direct",
                  title: "Direct Assault", 
                  description: "Fast approach with suppression fire"
                },
                {
                  id: "flanking",
                  title: "Flanking Maneuver",
                  description: "Circle around to secondary entry point"
                }
              ]
            },
            {
              id: "entry",
              title: "Building Entry",
              description: "Target building reached. Multiple entry options available.",
              cameraPosition: { x: 0, y: 6, z: 25 },
              cameraTarget: { x: 0, y: 8, z: 0 },
              options: [
                {
                  id: "breach_door",
                  title: "Breach Door",
                  description: "Explosive breach through main entrance"
                },
                {
                  id: "window",
                  title: "Window Entry",
                  description: "Silent entry through ground floor window"
                },
                {
                  id: "wall",
                  title: "Wall Breach",
                  description: "Demolition charge on side wall"
                }
              ]
            },
            {
              id: "navigation",
              title: "Building Navigation", 
              description: "Inside the building. Multiple routes to objective.",
              cameraPosition: { x: 0, y: 4, z: 10 },
              cameraTarget: { x: 0, y: 4, z: -5 },
              options: [
                {
                  id: "stairs",
                  title: "Main Staircase",
                  description: "Direct route up main stairs"
                },
                {
                  id: "kitchen",
                  title: "Kitchen Route", 
                  description: "Through kitchen and service stairs"
                },
                {
                  id: "corridor",
                  title: "Side Corridor",
                  description: "Flanking route through east corridor"
                }
              ]
            },
            {
              id: "contact",
              title: "Enemy Contact",
              description: "You hear gunshots from the upper floor. Multiple hostile contacts confirmed.",
              cameraPosition: { x: 0, y: 8, z: 0 },
              cameraTarget: { x: 0, y: 12, z: -10 },
              options: [
                {
                  id: "retreat_blow",
                  title: "Retreat and Blow Up",
                  description: "Fall back and demolish the building"
                },
                {
                  id: "run_contact",
                  title: "Run Towards Contact",
                  description: "Aggressive advance to engage hostiles"
                },
                {
                  id: "clear_secure",
                  title: "Clear and Secure",
                  description: "Methodical room-by-room clearing"
                }
              ]
            },
            {
              id: "support",
              title: "Air Support", 
              description: "A friendly chopper approaches. Request assistance type.",
              cameraPosition: { x: 0, y: 15, z: 0 },
              cameraTarget: { x: 20, y: 20, z: -20 },
              options: [
                {
                  id: "support_fire",
                  title: "Support Fire",
                  description: "Request covering fire on enemy positions"
                },
                {
                  id: "direct_fire",
                  title: "Direct Fire",
                  description: "Request targeted strikes on building"
                },
                {
                  id: "intelligence",
                  title: "Intelligence",
                  description: "Request thermal imaging and reconnaissance"
                }
              ]
            }
          ],
          stats: {
            timesPlayed: 0,
            avgDuration: 0,
            successRate: 0
          }
        };

        await db.insert(scenarios).values(urbanRaidScenario);
      }
    } catch (error) {
      console.error('Error initializing scenarios:', error);
    }
  }

  async getScenarios(): Promise<Scenario[]> {
    const result = await db.select().from(scenarios);
    return result;
  }

  async getScenario(id: string): Promise<Scenario | undefined> {
    const [scenario] = await db.select().from(scenarios).where(eq(scenarios.id, id));
    return scenario || undefined;
  }

  async createScenario(scenario: InsertScenario): Promise<Scenario> {
    const id = `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const [newScenario] = await db
      .insert(scenarios)
      .values({ ...scenario, id })
      .returning();
    return newScenario;
  }

  async createSession(session: InsertSession): Promise<Session> {
    const id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const [newSession] = await db
      .insert(sessions)
      .values({
        ...session,
        id,
        startTime: new Date(),
        status: 'active',
        decisions: [],
      })
      .returning();
    return newSession;
  }

  async getSession(id: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session || undefined;
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined> {
    const [updatedSession] = await db
      .update(sessions)
      .set(updates)
      .where(eq(sessions.id, id))
      .returning();
    return updatedSession || undefined;
  }

  async recordDecision(sessionId: string, decision: Decision): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) return false;
    
    const currentDecisions = Array.isArray(session.decisions) ? session.decisions : [];
    const newDecisions = [...currentDecisions, decision];
    
    await db
      .update(sessions)
      .set({ decisions: newDecisions })
      .where(eq(sessions.id, sessionId));
    
    return true;
  }

  async completeSession(sessionId: string, outcome: Outcome, duration: number): Promise<Session | undefined> {
    const [updatedSession] = await db
      .update(sessions)
      .set({
        status: 'completed',
        endTime: new Date(),
        outcome: outcome,
        duration: duration
      })
      .where(eq(sessions.id, sessionId))
      .returning();
    
    return updatedSession || undefined;
  }

  async getUserStats(userId: string): Promise<any> {
    const userSessions = await db.select().from(sessions).where(eq(sessions.userId, userId));
    
    const completedSessions = userSessions.filter(s => s.status === 'completed');
    const successfulSessions = completedSessions.filter(s => 
      s.outcome && typeof s.outcome === 'object' && 'success' in s.outcome && s.outcome.success
    );
    
    return {
      totalSessions: userSessions.length,
      completedSessions: completedSessions.length,
      successRate: completedSessions.length > 0 
        ? Math.round((successfulSessions.length / completedSessions.length) * 100)
        : 0,
      totalPlayTime: completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0),
      scenariosPlayed: [...new Set(userSessions.map(s => s.scenarioId))].length
    };
  }

  async getLeaderboard(scenarioId?: string): Promise<any[]> {
    const completedSessions = await db.select().from(sessions).where(eq(sessions.status, 'completed'));
    const relevantSessions = scenarioId 
      ? completedSessions.filter(s => s.scenarioId === scenarioId)
      : completedSessions;
    
    const userScores: { [key: string]: any } = {};
    
    relevantSessions.forEach((session: any) => {
      if (!userScores[session.userId]) {
        userScores[session.userId] = {
          userId: session.userId,
          bestTime: Infinity,
          successCount: 0,
          attempts: 0
        };
      }
      
      userScores[session.userId].attempts++;
      
      if (session.outcome && typeof session.outcome === 'object' && 'success' in session.outcome && 
          session.outcome.success && session.duration) {
        userScores[session.userId].successCount++;
        if (session.duration < userScores[session.userId].bestTime) {
          userScores[session.userId].bestTime = session.duration;
        }
      }
    });
    
    return Object.values(userScores)
      .filter(score => score.bestTime !== Infinity)
      .sort((a, b) => a.bestTime - b.bestTime)
      .slice(0, 20);
  }
}

export class MemStorage implements IStorage {
  private scenarios: Map<string, Scenario>;
  private sessions: Map<string, Session>;

  constructor() {
    this.scenarios = new Map();
    this.sessions = new Map();
    this.initializeDefaultScenarios();
  }

  private initializeDefaultScenarios() {
    const urbanRaidScenario: Scenario = {
      id: 'urban-raid-001',
      name: 'Operation Silent Strike',
      description: 'Urban raid on suspected insurgent hideout',
      difficulty: 'medium',
      estimatedTime: '5-10 minutes',
      tags: ['urban', 'raid', 'cqb', 'night'],
      steps: [
        {
          id: 'approach',
          title: 'Initial Approach',
          description: 'Your 6-man team is positioned 200m from the target compound. Intel confirms 4-6 hostiles with light weapons. Choose your approach vector.',
          cameraPosition: { x: 80, y: 40, z: 80 },
          cameraTarget: { x: 0, y: 0, z: 0 },
          options: [
            {
              id: 'stealth',
              title: 'Stealth Infiltration',
              description: 'Move through shadows using cover. Zero detection risk but slower advance. Preserves element of surprise.',
              risk: 'Low',
              time: '+45s',
              outcome: 'perimeter-secure'
            },
            {
              id: 'direct',
              title: 'Direct Advance',
              description: 'Fast approach via main street. High exposure risk but rapid positioning. May trigger early detection.',
              risk: 'High', 
              time: '+15s',
              outcome: 'perimeter-exposed'
            },
            {
              id: 'flanking',
              title: 'Multi-Vector Approach',
              description: 'Split team into fire teams. Coordinate simultaneous approach from multiple angles.',
              risk: 'Medium',
              time: '+30s',
              outcome: 'perimeter-surrounded'
            }
          ]
        },
        {
          id: 'perimeter-secure',
          title: 'Breach Planning',
          description: 'Team positioned at compound walls. No enemy alerts. Multiple entry points identified. Plan your breach.',
          cameraPosition: { x: 25, y: 12, z: 25 },
          cameraTarget: { x: 0, y: 8, z: 0 },
          options: [
            {
              id: 'silent-entry',
              title: 'Silent Breach',
              description: 'Pick locks and disable security. Maintains stealth advantage but takes time.',
              risk: 'Low',
              time: '+90s',
              outcome: 'inside-undetected'
            },
            {
              id: 'coordinated-breach',
              title: 'Synchronized Entry',
              description: 'Multiple simultaneous breach points. Fast clearing but higher exposure.',
              risk: 'Medium',
              time: '+20s',
              outcome: 'inside-tactical'
            }
          ]
        },
        {
          id: 'perimeter-exposed',
          title: 'Compromise Response',
          description: 'Enemy spotted your approach. Hostiles taking defensive positions. Immediate action required.',
          cameraPosition: { x: 40, y: 15, z: 30 },
          cameraTarget: { x: 0, y: 8, z: -10 },
          options: [
            {
              id: 'explosive-breach',
              title: 'Explosive Entry',
              description: 'C4 breach with flashbangs. Maximum shock effect but collateral damage risk.',
              risk: 'High',
              time: '+10s',
              outcome: 'inside-aggressive'
            },
            {
              id: 'suppression-advance',
              title: 'Fire and Movement',
              description: 'Suppressive fire while advancing. Controlled but casualties possible.',
              risk: 'Medium',
              time: '+45s',
              outcome: 'inside-contested'
            }
          ]
        },
        {
          id: 'perimeter-surrounded',
          title: 'Tactical Coordination',
          description: 'Teams positioned at all compound sides. Perfect coordination opportunity. Execute synchronized operation.',
          cameraPosition: { x: 60, y: 30, z: 45 },
          cameraTarget: { x: 0, y: 0, z: 0 },
          options: [
            {
              id: 'simultaneous-breach',
              title: 'All-Vector Assault',
              description: 'Breach all sides simultaneously. Maximum confusion for enemy but complex coordination.',
              risk: 'Medium',
              time: '+15s',
              outcome: 'inside-overwhelming'
            },
            {
              id: 'sequential-clear',
              title: 'Methodical Clearing',
              description: 'Room-by-room systematic clearing. Slower but minimizes casualties.',
              risk: 'Low',
              time: '+120s',
              outcome: 'inside-methodical'
            }
          ]
        },
        {
          id: 'inside-undetected',
          title: 'Silent Operations',
          description: 'Inside compound undetected. 4 hostiles identified in main building. 2 on patrol, 2 in communications room.',
          cameraPosition: { x: 12, y: 8, z: 15 },
          cameraTarget: { x: 0, y: 5, z: 0 },
          options: [
            {
              id: 'non-lethal',
              title: 'Non-Lethal Takedowns',
              description: 'Subdue targets silently. Preserves intel value but higher risk if detected.',
              risk: 'Medium',
              time: '+180s',
              outcome: 'mission-clean'
            },
            {
              id: 'precise-elimination',
              title: 'Precision Neutralization',
              description: 'Coordinated silent eliminations. Quick but lethal approach.',
              risk: 'Low',
              time: '+60s',
              outcome: 'mission-surgical'
            }
          ]
        },
        {
          id: 'inside-tactical',
          title: 'Tactical Clearing',
          description: 'Multiple breach points secured. Enemy partially alerted. 3 hostiles moving to defensive positions.',
          cameraPosition: { x: 8, y: 10, z: 12 },
          cameraTarget: { x: 0, y: 5, z: -5 },
          options: [
            {
              id: 'room-clearing',
              title: 'Systematic Room Clearing',
              description: 'Standard CQB procedures. Methodical but safe approach.',
              risk: 'Low',
              time: '+90s',
              outcome: 'mission-standard'
            },
            {
              id: 'dynamic-entry',
              title: 'Dynamic Clearing',
              description: 'Fast aggressive clearing. Higher casualty risk but rapid resolution.',
              risk: 'High',
              time: '+30s',
              outcome: 'mission-aggressive'
            }
          ]
        }
      ],
      stats: {
        timesPlayed: 0,
        avgDuration: 0,
        successRate: 0
      }
    };

    this.scenarios.set(urbanRaidScenario.id, urbanRaidScenario);
  }

  async getScenarios(): Promise<Scenario[]> {
    return Array.from(this.scenarios.values());
  }

  async getScenario(id: string): Promise<Scenario | undefined> {
    return this.scenarios.get(id);
  }

  async createScenario(scenario: InsertScenario): Promise<Scenario> {
    const id = `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newScenario: Scenario = {
      ...scenario,
      id
    };
    this.scenarios.set(id, newScenario);
    return newScenario;
  }

  async createSession(session: InsertSession): Promise<Session> {
    const id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newSession: Session = {
      ...session,
      id,
      startTime: new Date(),
      endTime: null,
      status: 'active',
      decisions: [],
      outcome: null,
      duration: null
    };
    this.sessions.set(id, newSession);
    
    // Update scenario stats
    const scenario = this.scenarios.get(session.scenarioId);
    if (scenario) {
      scenario.stats = {
        ...scenario.stats,
        timesPlayed: (scenario.stats.timesPlayed || 0) + 1
      };
    }
    
    return newSession;
  }

  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async recordDecision(sessionId: string, decision: Decision): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    
    session.decisions = [...(session.decisions as Decision[]), decision];
    return true;
  }

  async completeSession(sessionId: string, outcome: Outcome, duration: number): Promise<Session | undefined> {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    
    session.status = 'completed';
    session.endTime = new Date();
    session.outcome = outcome;
    session.duration = duration;
    
    // Update scenario stats
    const scenario = this.scenarios.get(session.scenarioId);
    if (scenario) {
      const completedSessions = Array.from(this.sessions.values())
        .filter(s => s.scenarioId === session.scenarioId && s.status === 'completed');
      
      const totalDuration = completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
      const successfulSessions = completedSessions.filter(s => s.outcome?.success);
      
      scenario.stats = {
        ...scenario.stats,
        avgDuration: Math.round(totalDuration / completedSessions.length),
        successRate: Math.round((successfulSessions.length / completedSessions.length) * 100)
      };
    }
    
    return session;
  }

  async getUserStats(userId: string): Promise<any> {
    const userSessions = Array.from(this.sessions.values())
      .filter(s => s.userId === userId);
    
    const completedSessions = userSessions.filter(s => s.status === 'completed');
    const successfulSessions = completedSessions.filter(s => s.outcome?.success);
    
    return {
      totalSessions: userSessions.length,
      completedSessions: completedSessions.length,
      successRate: completedSessions.length > 0 
        ? Math.round((successfulSessions.length / completedSessions.length) * 100)
        : 0,
      totalPlayTime: completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0),
      scenariosPlayed: [...new Set(userSessions.map(s => s.scenarioId))].length
    };
  }

  async getLeaderboard(scenarioId?: string): Promise<any[]> {
    let relevantSessions = Array.from(this.sessions.values())
      .filter(s => s.status === 'completed');
    
    if (scenarioId) {
      relevantSessions = relevantSessions.filter(s => s.scenarioId === scenarioId);
    }
    
    const userScores: { [key: string]: any } = {};
    
    relevantSessions.forEach(session => {
      if (!userScores[session.userId]) {
        userScores[session.userId] = {
          userId: session.userId,
          bestTime: Infinity,
          successCount: 0,
          attempts: 0
        };
      }
      
      userScores[session.userId].attempts++;
      
      if (session.outcome?.success && session.duration) {
        userScores[session.userId].successCount++;
        if (session.duration < userScores[session.userId].bestTime) {
          userScores[session.userId].bestTime = session.duration;
        }
      }
    });
    
    return Object.values(userScores)
      .filter(score => score.bestTime !== Infinity)
      .sort((a, b) => a.bestTime - b.bestTime)
      .slice(0, 20);
  }
}

export const storage = new DatabaseStorage();
