import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { getOutcomeType, type MissionOutcome, type ScenarioStep, type DecisionOption, type Scenario } from '@/lib/scenario-data';
import ThreeScene from '@/components/three-scene';
import HUD from '@/components/hud';
import DecisionPanel from '@/components/decision-panel';
import OutcomeDisplay from '@/components/outcome-display';
import DecisionTreeReplay from '@/components/decision-tree-replay';
import ReplayControls from '@/components/replay-controls';
import ScenarioEvent from '@/components/scenario-event';

interface GameState {
  currentStep: number;
  decisions: Array<{ stepId: string; optionId: string; timestamp: number }>;
  sessionId: string | null;
  startTime: number;
  isLoading: boolean;
  showDecisionPanel: boolean;
  showOutcome: boolean;
  showReplay: boolean;
  showTreeReplay: boolean;
  replayIndex: number;
  isReplayPlaying: boolean;
  showScenarioEvent: boolean;
  scenarioEvent: {
    title: string;
    description: string;
  } | null;
  outcome: {
    success: boolean;
    title: string;
    description: string;
    completionTime: string;
    efficiency: number;
    casualties?: number;
    exposureLevel?: string;
    objectivesCompleted?: number;
    totalObjectives?: number;
  } | null;
}

export default function TacticalSimulator() {
  const queryClient = useQueryClient();
  const [gameState, setGameState] = useState<GameState>({
    currentStep: 0,
    decisions: [],
    sessionId: null,
    startTime: Date.now(),
    isLoading: true,
    showDecisionPanel: true,
    showOutcome: false,
    showReplay: false,
    showTreeReplay: false,
    replayIndex: 0,
    isReplayPlaying: false,
    showScenarioEvent: false,
    scenarioEvent: null,
    outcome: null,
  });

  const { data: scenario, isLoading: scenarioLoading } = useQuery<Scenario>({
    queryKey: ['/api/scenarios/urban-raid-001'],
  });

  const createSessionMutation = useMutation({
    mutationFn: (data: { scenarioId: string; userId: string }) => 
      apiClient.createSession(data),
    onSuccess: (session) => {
      setGameState(prev => ({
        ...prev,
        sessionId: session.id,
        isLoading: false,
      }));
    },
  });

  const recordDecisionMutation = useMutation({
    mutationFn: ({ sessionId, decision }: { 
      sessionId: string; 
      decision: { stepId: string; optionId: string; timestamp: number } 
    }) => apiClient.recordDecision(sessionId, decision),
  });

  const completeSessionMutation = useMutation({
    mutationFn: ({ sessionId, outcome, duration }: {
      sessionId: string;
      outcome: { success: boolean; type: string; duration?: number; score?: number };
      duration: number;
    }) => apiClient.completeSession(sessionId, outcome, duration),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
    },
  });

  useEffect(() => {
    if (scenario && !gameState.sessionId) {
      createSessionMutation.mutate({
        scenarioId: scenario.id,
        userId: 'user-001',
      });
    }
  }, [scenario, gameState.sessionId]);

  const handleSelectOption = (option: DecisionOption) => {
    if (!gameState.sessionId || !scenario) return;

    const decision = {
      stepId: scenario.steps[gameState.currentStep].id,
      optionId: option.id,
      timestamp: Date.now(),
    };

    const newDecisions = [...gameState.decisions, decision];
    
    recordDecisionMutation.mutate({
      sessionId: gameState.sessionId,
      decision,
    });

    setGameState(prev => ({
      ...prev,
      decisions: newDecisions,
      showDecisionPanel: false,
    }));

    const isLastStep = gameState.currentStep >= scenario.steps?.length - 1;
    
    if (isLastStep) {
      const decisionPath = newDecisions.map(d => d.optionId);
      const missionOutcome: MissionOutcome = getOutcomeType(decisionPath);
      const duration = Date.now() - gameState.startTime;
      
      const outcomeData = {
        success: missionOutcome.success,
        title: missionOutcome.success ? "Mission Accomplished" : "Mission Failed",
        description: getOutcomeDescription(missionOutcome),
        completionTime: formatTime(duration),
        efficiency: Math.round((1 - duration / 1200000) * 100),
        casualties: missionOutcome.casualties,
        exposureLevel: missionOutcome.exposureLevel,
        objectivesCompleted: missionOutcome.objectivesCompleted,
        totalObjectives: missionOutcome.totalObjectives,
      };

      setGameState(prev => ({
        ...prev,
        outcome: outcomeData,
        showOutcome: true,
      }));

      if (gameState.sessionId) {
        completeSessionMutation.mutate({
          sessionId: gameState.sessionId,
          outcome: {
            success: missionOutcome.success,
            type: missionOutcome.type,
            duration,
          },
          duration,
        });
      }
    } else {
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          currentStep: prev.currentStep + 1,
          showDecisionPanel: true,
        }));
      }, 2000);
    }
  };

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getOutcomeDescription = (outcome: MissionOutcome) => {
    const descriptions = {
      'stealth_success': 'Mission completed with minimal detection. All objectives secured.',
      'aggressive_success': 'Direct assault successful. High efficiency with acceptable casualties.',
      'stealth_failure': 'Stealth approach compromised. Mission objectives not achieved.',
      'aggressive_failure': 'Assault failed with heavy casualties. Tactical reconsideration required.',
      'balanced_success': 'Balanced approach yielded optimal results with moderate risk.',
      'balanced_failure': 'Flanking maneuver unsuccessful. Enemy countermeasures effective.',
    };
    return descriptions[outcome.type as keyof typeof descriptions] || 'Mission outcome undetermined.';
  };

  const handleStartNewMission = () => {
    setGameState({
      currentStep: 0,
      decisions: [],
      sessionId: null,
      startTime: Date.now(),
      isLoading: false,
      showDecisionPanel: true,
      showOutcome: false,
      showReplay: false,
      showTreeReplay: false,
    replayIndex: 0,
    isReplayPlaying: false,
    showScenarioEvent: false,
    scenarioEvent: null,
    outcome: null,
  });

    if (scenario) {
      createSessionMutation.mutate({
        scenarioId: scenario.id,
        userId: 'user-001',
      });
    }
  };

  const handleReviewReplay = () => {
    setGameState(prev => ({
      ...prev,
      showOutcome: false,
      showTreeReplay: true,
    }));
  };

  const handleCloseTreeReplay = () => {
    setGameState(prev => ({
      ...prev,
      showTreeReplay: false,
    }));
  };

  const handleNodeSelect = (nodeId: string) => {
    console.log('Selected node:', nodeId);
  };

  const currentStep = scenario?.steps[gameState.currentStep];
  const cameraPosition = currentStep?.cameraPosition;
  const cameraTarget = currentStep?.cameraTarget;

  if (scenarioLoading || !scenario) {
    return (
      <div className="fixed inset-0 bg-tactical-dark flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-tactical-green rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold mb-2 text-tactical-green">APEX MINDS</h2>
          <p className="text-gray-400 text-sm">
            <span className="loading-dots">Loading Tactical Environment</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-tactical-dark flex flex-col overflow-hidden">
      {/* Loading Screen */}
      {gameState.isLoading && (
        <div className="fixed inset-0 bg-tactical-dark z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-tactical-green border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-2 border-tactical-green border-r-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
            </div>
            <h2 className="text-2xl font-semibold text-tactical-green mb-4">APEX MINDS</h2>
            <p className="text-lg text-gray-300 font-mono">
              <span className="loading-dots">Initializing Tactical Environment</span>
            </p>
            <div className="w-64 h-1 bg-gray-700 rounded-full mx-auto mt-6 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-tactical-green to-green-400 rounded-full animate-scan"></div>
            </div>
          </div>
        </div>
      )}

      {/* 90% POV Viewport - True first-person immersive view */}
      <div className="relative bg-black" style={{ height: '90%' }}>
        <ThreeScene 
          cameraPosition={cameraPosition || { x: 0, y: 1.7, z: 0 }}
          cameraTarget={cameraTarget || { x: 0, y: 1.7, z: -10 }}
        />
        
        {/* Restart button - top right */}
        <button 
          onClick={() => window.location.reload()}
          className="absolute top-4 right-4 bg-red-600/90 hover:bg-red-500 text-white px-3 py-1 rounded text-sm font-mono border border-red-400"
        >
          RESTART
        </button>

        {/* Minimal tactical overlay - bottom left */}
        <div className="absolute bottom-4 left-4 bg-black/90 backdrop-blur-sm rounded p-2 text-xs border border-green-500/50">
          <div className="text-green-400 font-mono">DRAG TO LOOK • SCROLL TO ZOOM</div>
        </div>
      </div>

      {/* 10% Control Interface - Minimal decision panel */}
      <div className="bg-slate-900 border-t border-green-500/50" style={{ height: '10%' }}>
        <div className="flex h-full items-center justify-between px-6">
          {/* Current step info */}
          <div className="text-sm">
            <span className="text-green-400 font-mono">
              {currentStep?.title || "Tactical Simulator"}
            </span>
            <span className="text-gray-400 ml-4">
              Step {gameState.currentStep + 1}/5
            </span>
          </div>

          {/* Decision options - horizontal layout */}
          {gameState.showDecisionPanel && currentStep && (
            <div className="flex gap-4">
              {currentStep.options.map((option: DecisionOption) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option)}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded text-sm border border-gray-500 transition-colors"
                >
                  {option.title}
                </button>
              ))}
            </div>
          )}
          
          {!gameState.showDecisionPanel && (
            <div className="text-gray-400 text-sm font-mono">
              AWAITING DECISION
            </div>
          )}
        </div>
      </div>

      {/* Overlay Components for Modal States */}
      {gameState.outcome && (
        <OutcomeDisplay
          isVisible={gameState.showOutcome}
          success={gameState.outcome.success}
          title={gameState.outcome.title}
          description={gameState.outcome.description}
          completionTime={gameState.outcome.completionTime}
          decisionsCount={gameState.decisions.length}
          efficiency={gameState.outcome.efficiency}
          casualties={gameState.outcome.casualties}
          exposureLevel={gameState.outcome.exposureLevel}
          objectivesCompleted={gameState.outcome.objectivesCompleted}
          totalObjectives={gameState.outcome.totalObjectives}
          onStartNewMission={handleStartNewMission}
          onReviewReplay={handleReviewReplay}
        />
      )}

      {gameState.showTreeReplay && (
        <DecisionTreeReplay
          isVisible={gameState.showTreeReplay}
          decisions={gameState.decisions}
          scenario={scenario}
          onClose={handleCloseTreeReplay}
          onNodeSelect={handleNodeSelect}
        />
      )}

      {gameState.showReplay && (
        <ReplayControls
          isVisible={gameState.showReplay}
          isPlaying={gameState.isReplayPlaying}
          currentTime="1:23"
          totalTime={gameState.outcome?.completionTime || "0:00"}
          onPrevious={() => {
            setGameState(prev => ({
              ...prev,
              replayIndex: Math.max(0, prev.replayIndex - 1)
            }));
          }}
          onTogglePlay={() => {
            setGameState(prev => ({
              ...prev,
              isReplayPlaying: !prev.isReplayPlaying
            }));
          }}
          onNext={() => {
            setGameState(prev => ({
              ...prev,
              replayIndex: Math.min(prev.decisions.length - 1, prev.replayIndex + 1)
            }));
          }}
          onSpeedChange={(speed) => {
            console.log('Replay speed changed to:', speed);
          }}
        />
      )}
    </div>
  );
}