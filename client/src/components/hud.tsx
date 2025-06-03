import { useEffect, useState } from 'react';

interface HUDProps {
  missionName: string;
  missionDescription: string;
  startTime: number;
  decisionsCount: number;
  currentStep: number;
  totalSteps: number;
}

export default function HUD({ 
  missionName, 
  missionDescription, 
  startTime, 
  decisionsCount,
  currentStep,
  totalSteps 
}: HUDProps) {
  const [elapsed, setElapsed] = useState('00:00');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = now - startTime;
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setElapsed(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
      <div className="flex justify-between items-start">
        {/* Mission Information */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-tactical-green/20 rounded-lg flex items-center justify-center border border-tactical-green/40">
            <i className="fas fa-crosshairs text-tactical-green text-xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{missionName}</h1>
            <p className="text-gray-300 text-sm font-medium">{missionDescription}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-mono rounded border border-orange-500/40">
                CLASSIFIED
              </span>
              <span className="px-2 py-1 bg-tactical-green/20 text-tactical-green text-xs font-mono rounded border border-tactical-green/40">
                MEDIUM
              </span>
            </div>
          </div>
        </div>

        {/* Status Panel */}
        <div className="text-right">
          {/* Mission Timer */}
          <div className="text-3xl font-mono font-semibold text-tactical-green mb-2">
            {elapsed}
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center space-x-3 justify-end">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-tactical-green rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300 font-mono">ONLINE</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-satellite-dish text-tactical-green"></i>
              <span className="text-sm text-gray-300 font-mono">COMMS</span>
            </div>
            <div className="text-sm text-gray-300 font-mono">
              DECISIONS: {decisionsCount}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 w-full bg-gray-800 rounded-full h-2">
        <div 
          className="bg-tactical-green h-2 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
