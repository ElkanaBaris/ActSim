import { Button } from '@/components/ui/button';

interface OutcomeDisplayProps {
  isVisible: boolean;
  success: boolean;
  title: string;
  description: string;
  completionTime: string;
  decisionsCount: number;
  efficiency: number;
  casualties?: number;
  exposureLevel?: string;
  objectivesCompleted?: number;
  totalObjectives?: number;
  onStartNewMission: () => void;
  onReviewReplay: () => void;
}

export default function OutcomeDisplay({
  isVisible,
  success,
  title,
  description,
  completionTime,
  decisionsCount,
  efficiency,
  casualties,
  exposureLevel,
  objectivesCompleted,
  totalObjectives,
  onStartNewMission,
  onReviewReplay
}: OutcomeDisplayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      <div className="relative flex items-center justify-center min-h-screen p-8">
        <div className="tactical-glass rounded-2xl p-12 max-w-2xl w-full text-center">
          
          {/* Outcome Icon */}
          <div className={`w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center border-4 ${
            success 
              ? 'bg-tactical-green/20 border-tactical-green' 
              : 'bg-red-500/20 border-red-500'
          }`}>
            <i className={`fas text-4xl ${
              success 
                ? 'fa-trophy text-tactical-green' 
                : 'fa-exclamation-triangle text-red-500'
            }`}></i>
          </div>

          {/* Outcome Title */}
          <h2 className={`text-4xl font-bold mb-4 ${
            success ? 'text-tactical-green' : 'text-red-500'
          }`}>
            {title}
          </h2>

          {/* Outcome Description */}
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            {description}
          </p>

          {/* Mission Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-tactical-green">{completionTime}</div>
              <div className="text-sm text-gray-300">Mission Time</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-mono font-bold ${(casualties || 0) === 0 ? 'text-tactical-green' : 'text-red-400'}`}>
                {casualties || 0}
              </div>
              <div className="text-sm text-gray-300">Casualties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-blue-400">
                {objectivesCompleted || 3}/{totalObjectives || 3}
              </div>
              <div className="text-sm text-gray-300">Objectives</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-mono font-bold ${
                exposureLevel === 'MINIMAL' ? 'text-green-400' :
                exposureLevel === 'LOW' ? 'text-blue-400' :
                exposureLevel === 'MODERATE' ? 'text-yellow-400' :
                exposureLevel === 'HIGH' ? 'text-orange-400' :
                exposureLevel === 'CRITICAL' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {exposureLevel || 'MINIMAL'}
              </div>
              <div className="text-sm text-gray-300">Exposure Level</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onStartNewMission}
              className="px-8 py-4 bg-tactical-green text-black font-semibold rounded-xl hover:bg-green-400 transition-colors duration-200"
            >
              <i className="fas fa-redo mr-2"></i>
              Start New Mission
            </Button>
            <Button 
              variant="outline"
              onClick={onReviewReplay}
              className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors duration-200"
            >
              <i className="fas fa-play mr-2"></i>
              Review Replay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
