import { Button } from '@/components/ui/button';

interface ReplayControlsProps {
  isVisible: boolean;
  isPlaying: boolean;
  currentTime: string;
  totalTime: string;
  onPrevious: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onSpeedChange: (speed: number) => void;
}

export default function ReplayControls({
  isVisible,
  isPlaying,
  currentTime,
  totalTime,
  onPrevious,
  onTogglePlay,
  onNext,
  onSpeedChange
}: ReplayControlsProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
      <div className="tactical-glass rounded-full px-8 py-4">
        <div className="flex items-center space-x-6">
          
          {/* Previous Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrevious}
            className="w-10 h-10 rounded-full bg-tactical-green/20 border border-tactical-green/40 flex items-center justify-center text-tactical-green hover:bg-tactical-green hover:text-black transition-all duration-200"
          >
            <i className="fas fa-step-backward"></i>
          </Button>

          {/* Play/Pause Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onTogglePlay}
            className="w-12 h-12 rounded-full bg-tactical-green/20 border border-tactical-green/40 flex items-center justify-center text-tactical-green hover:bg-tactical-green hover:text-black transition-all duration-200"
          >
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
          </Button>

          {/* Next Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onNext}
            className="w-10 h-10 rounded-full bg-tactical-green/20 border border-tactical-green/40 flex items-center justify-center text-tactical-green hover:bg-tactical-green hover:text-black transition-all duration-200"
          >
            <i className="fas fa-step-forward"></i>
          </Button>

          {/* Time Display */}
          <div className="text-gray-300 font-mono text-sm min-w-24 text-center">
            {currentTime} / {totalTime}
          </div>

          {/* Speed Control */}
          <select 
            className="bg-black/50 border border-white/20 rounded px-3 py-1 text-gray-300 font-mono text-sm"
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            defaultValue="1"
          >
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
      </div>
    </div>
  );
}
