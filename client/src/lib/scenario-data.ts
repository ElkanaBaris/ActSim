export interface ScenarioStep {
  id: string;
  title: string;
  description: string;
  cameraPosition: { x: number; y: number; z: number };
  cameraTarget: { x: number; y: number; z: number };
  options: DecisionOption[];
}

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  risk: string;
  time: string;
  outcome: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  tags: string[];
  steps: ScenarioStep[];
  stats: {
    timesPlayed: number;
    avgDuration: number;
    successRate: number;
  };
}

export interface MissionOutcome {
  success: boolean;
  type: string;
  casualties: number;
  timeAdded: number;
  exposureLevel: string;
  objectivesCompleted: number;
  totalObjectives: number;
}

export const getOutcomeType = (path: string[]): MissionOutcome => {
  const pathString = path.join('-');
  let casualties = 0;
  let timeAdded = 0;
  let exposureLevel = 'MINIMAL';
  let objectivesCompleted = 3; // Base objectives always completed
  const totalObjectives = 3;
  
  // Calculate consequences based on decision path
  if (pathString.includes('stealth') || pathString.includes('silent-entry')) {
    casualties = 0;
    timeAdded = 120; // Stealth takes longer
    exposureLevel = 'MINIMAL';
    objectivesCompleted = 3;
  } else if (pathString.includes('direct') || pathString.includes('explosive-breach')) {
    casualties = Math.floor(Math.random() * 2) + 1; // 1-2 casualties
    timeAdded = 30;
    exposureLevel = 'HIGH';
    objectivesCompleted = 2; // Some objectives compromised
  } else if (pathString.includes('flanking') || pathString.includes('coordinated-breach')) {
    casualties = Math.floor(Math.random() * 2); // 0-1 casualties
    timeAdded = 60;
    exposureLevel = 'MODERATE';
    objectivesCompleted = 3;
  }

  // Mission completion outcomes
  if (pathString.includes('mission-clean')) {
    return {
      success: true,
      type: 'COVERT SUCCESS',
      casualties: 0,
      timeAdded: 180,
      exposureLevel: 'MINIMAL',
      objectivesCompleted: 4, // Bonus objective achieved
      totalObjectives: 4
    };
  } else if (pathString.includes('mission-surgical')) {
    return {
      success: true,
      type: 'SURGICAL STRIKE',
      casualties: 0,
      timeAdded: 90,
      exposureLevel: 'LOW',
      objectivesCompleted: 3,
      totalObjectives: 3
    };
  } else if (pathString.includes('mission-aggressive')) {
    return {
      success: true,
      type: 'AGGRESSIVE ASSAULT',
      casualties: Math.floor(Math.random() * 3) + 1,
      timeAdded: 45,
      exposureLevel: 'CRITICAL',
      objectivesCompleted: 2,
      totalObjectives: 3
    };
  } else if (pathString.includes('mission-standard')) {
    return {
      success: true,
      type: 'STANDARD OPERATION',
      casualties: Math.floor(Math.random() * 2),
      timeAdded: 75,
      exposureLevel: 'MODERATE',
      objectivesCompleted: 3,
      totalObjectives: 3
    };
  }

  // Default successful outcome
  return {
    success: true,
    type: 'MISSION COMPLETED',
    casualties,
    timeAdded,
    exposureLevel,
    objectivesCompleted,
    totalObjectives
  };
};

export const calculateScore = (decisions: any[], duration: number, success: boolean): number => {
  if (!success) return Math.floor(Math.random() * 40 + 20);
  
  const baseScore = 100;
  const timeBonus = Math.max(0, 300000 - duration) / 10000; // Bonus for completing under 5 minutes
  const decisionPenalty = Math.max(0, decisions.length - 3) * 5; // Penalty for too many decisions
  
  return Math.max(60, Math.min(100, Math.floor(baseScore + timeBonus - decisionPenalty)));
};
