import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DecisionOption } from '@/lib/scenario-data';

interface DecisionNode {
  id: string;
  title: string;
  description: string;
  options: DecisionOption[];
  selectedOption?: DecisionOption;
  consequences?: {
    casualties: number;
    timeAdded: number;
    exposureLevel: string;
  };
}

interface DecisionTreeReplayProps {
  isVisible: boolean;
  decisions: Array<{ stepId: string; optionId: string; timestamp: number }>;
  scenario: any;
  onClose: () => void;
  onNodeSelect: (nodeId: string) => void;
}

export default function DecisionTreeReplay({
  isVisible,
  decisions,
  scenario,
  onClose,
  onNodeSelect
}: DecisionTreeReplayProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  if (!isVisible || !scenario) return null;

  const buildDecisionTree = (): DecisionNode[] => {
    const nodes: DecisionNode[] = [];
    
    decisions.forEach((decision, index) => {
      const step = scenario.steps.find((s: any) => s.id === decision.stepId);
      if (!step) return;

      const selectedOption = step.options.find((opt: any) => opt.id === decision.optionId);
      
      // Calculate consequences based on decision
      const consequences = calculateConsequences(decision, selectedOption, index);
      
      nodes.push({
        id: step.id,
        title: step.title,
        description: step.description,
        options: step.options,
        selectedOption,
        consequences
      });
    });

    return nodes;
  };

  const calculateConsequences = (decision: any, option: any, stepIndex: number) => {
    const baseTime = stepIndex * 30; // Base time progression
    let casualties = 0;
    let timeAdded = 0;
    let exposureLevel = 'MINIMAL';

    if (option) {
      // Calculate based on risk level and decision type
      switch (option.risk?.toLowerCase()) {
        case 'high':
          casualties = Math.floor(Math.random() * 3);
          timeAdded = 45;
          exposureLevel = 'HIGH';
          break;
        case 'medium':
          casualties = Math.floor(Math.random() * 2);
          timeAdded = 20;
          exposureLevel = 'MODERATE';
          break;
        case 'low':
          casualties = 0;
          timeAdded = 10;
          exposureLevel = 'MINIMAL';
          break;
      }

      // Specific decision consequences
      if (option.id === 'explosive') {
        casualties += 1;
        exposureLevel = 'CRITICAL';
      } else if (option.id === 'stealth') {
        timeAdded += 30;
        exposureLevel = 'MINIMAL';
      }
    }

    return { casualties, timeAdded, exposureLevel };
  };

  const getExposureColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-500';
      case 'HIGH': return 'text-orange-500';
      case 'MODERATE': return 'text-yellow-500';
      case 'MINIMAL': return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'border-red-500 bg-red-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-green-500 bg-green-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const decisionNodes = buildDecisionTree();

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
      <div className="container mx-auto h-full p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-tactical-green">MISSION REPLAY</h1>
            <p className="text-gray-300">Decision Analysis & Tactical Review</p>
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
          >
            <i className="fas fa-times mr-2"></i>
            Close Replay
          </Button>
        </div>

        {/* Decision Tree */}
        <div className="grid grid-cols-1 gap-8 max-h-[calc(100vh-200px)] overflow-y-auto">
          {decisionNodes.map((node, nodeIndex) => (
            <div key={node.id} className="relative">
              
              {/* Connection Line */}
              {nodeIndex > 0 && (
                <div className="absolute -top-4 left-1/2 w-px h-8 bg-tactical-green/50 transform -translate-x-1/2"></div>
              )}

              {/* Decision Step */}
              <div className="tactical-glass rounded-xl p-6 border border-tactical-green/30">
                
                {/* Step Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      STEP {nodeIndex + 1}: {node.title}
                    </h3>
                    <p className="text-gray-300">{node.description}</p>
                  </div>
                  
                  {/* Consequences Panel */}
                  {node.consequences && (
                    <div className="bg-black/50 rounded-lg p-4 border border-white/20">
                      <h4 className="text-sm font-semibold text-gray-300 mb-3">CONSEQUENCES</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Casualties:</span>
                          <span className={node.consequences.casualties > 0 ? 'text-red-400' : 'text-green-400'}>
                            {node.consequences.casualties}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Time Added:</span>
                          <span className="text-yellow-400">+{node.consequences.timeAdded}s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Exposure:</span>
                          <span className={getExposureColor(node.consequences.exposureLevel)}>
                            {node.consequences.exposureLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {node.options.map((option) => {
                    const isSelected = option.id === node.selectedOption?.id;
                    const wasNotTaken = !isSelected;
                    
                    return (
                      <div
                        key={option.id}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          isSelected 
                            ? 'border-tactical-green bg-tactical-green/20 ring-2 ring-tactical-green/50' 
                            : wasNotTaken
                            ? 'border-gray-600 bg-gray-800/50 opacity-60'
                            : getRiskColor(option.risk)
                        }`}
                      >
                        {/* Option Header */}
                        <div className="flex items-center justify-between mb-3">
                          <h4 className={`font-semibold ${isSelected ? 'text-tactical-green' : 'text-white'}`}>
                            {option.title}
                          </h4>
                          {isSelected && (
                            <div className="w-6 h-6 bg-tactical-green rounded-full flex items-center justify-center">
                              <i className="fas fa-check text-black text-xs"></i>
                            </div>
                          )}
                          {wasNotTaken && (
                            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                              <i className="fas fa-times text-gray-400 text-xs"></i>
                            </div>
                          )}
                        </div>

                        {/* Option Description */}
                        <p className={`text-sm mb-3 ${isSelected ? 'text-gray-200' : 'text-gray-400'}`}>
                          {option.description}
                        </p>

                        {/* Option Stats */}
                        <div className="flex items-center space-x-3 text-xs">
                          <span className={`px-2 py-1 rounded ${
                            option.risk?.toLowerCase() === 'high' ? 'bg-red-500/20 text-red-400' :
                            option.risk?.toLowerCase() === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {option.risk?.toUpperCase()}
                          </span>
                          <span className="text-gray-400">{option.time}</span>
                        </div>

                        {/* Alternative Outcome (for not taken options) */}
                        {wasNotTaken && (
                          <div className="mt-3 pt-3 border-t border-gray-600">
                            <p className="text-xs text-gray-500 italic">
                              Alternative path not explored
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-4 gap-4">
          <div className="tactical-glass rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-tactical-green">
              {decisionNodes.reduce((sum, node) => sum + (node.consequences?.casualties || 0), 0)}
            </div>
            <div className="text-sm text-gray-400">Total Casualties</div>
          </div>
          <div className="tactical-glass rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              +{decisionNodes.reduce((sum, node) => sum + (node.consequences?.timeAdded || 0), 0)}s
            </div>
            <div className="text-sm text-gray-400">Time Penalty</div>
          </div>
          <div className="tactical-glass rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {decisionNodes.length}
            </div>
            <div className="text-sm text-gray-400">Decisions Made</div>
          </div>
          <div className="tactical-glass rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {scenario.steps.length - decisionNodes.length}
            </div>
            <div className="text-sm text-gray-400">Paths Not Taken</div>
          </div>
        </div>
      </div>
    </div>
  );
}