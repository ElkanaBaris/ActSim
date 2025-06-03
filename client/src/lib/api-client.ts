import { apiRequest } from "./queryClient";

export interface SessionData {
  scenarioId: string;
  userId: string;
}

export interface DecisionData {
  stepId: string;
  optionId: string;
  timestamp: number;
}

export interface OutcomeData {
  success: boolean;
  type: string;
  duration?: number;
  score?: number;
}

export const apiClient = {
  // Scenarios
  async getScenarios() {
    const response = await apiRequest("GET", "/api/scenarios");
    return response.json();
  },

  async getScenario(id: string) {
    const response = await apiRequest("GET", `/api/scenarios/${id}`);
    return response.json();
  },

  // Sessions
  async createSession(data: SessionData) {
    const response = await apiRequest("POST", "/api/sessions", data);
    return response.json();
  },

  async getSession(id: string) {
    const response = await apiRequest("GET", `/api/sessions/${id}`);
    return response.json();
  },

  async recordDecision(sessionId: string, decision: DecisionData) {
    const response = await apiRequest("POST", `/api/sessions/${sessionId}/decisions`, decision);
    return response.json();
  },

  async completeSession(sessionId: string, outcome: OutcomeData, duration: number) {
    const response = await apiRequest("POST", `/api/sessions/${sessionId}/complete`, {
      outcome,
      duration
    });
    return response.json();
  },

  async getReplayData(sessionId: string) {
    const response = await apiRequest("GET", `/api/sessions/${sessionId}/replay`);
    return response.json();
  },

  // Statistics
  async getUserStats(userId: string) {
    const response = await apiRequest("GET", `/api/users/${userId}/stats`);
    return response.json();
  },

  async getLeaderboard(scenarioId?: string) {
    const url = scenarioId ? `/api/leaderboard?scenarioId=${scenarioId}` : "/api/leaderboard";
    const response = await apiRequest("GET", url);
    return response.json();
  }
};
