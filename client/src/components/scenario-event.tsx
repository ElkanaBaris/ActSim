import { useState } from 'react';

interface ScenarioEventProps {
  isVisible: boolean;
  title: string;
  description: string;
  onAcknowledge: () => void;
}

export default function ScenarioEvent({ 
  isVisible, 
  title, 
  description, 
  onAcknowledge 
}: ScenarioEventProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-800 border border-amber-500/50 rounded-lg p-8 max-w-2xl mx-4 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/20 rounded-full mb-4">
            <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold text-amber-400 mb-4 font-mono">
            {title}
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            {description}
          </p>
        </div>
        
        <button
          onClick={onAcknowledge}
          className="bg-amber-600 hover:bg-amber-500 text-black font-bold px-8 py-3 rounded-lg transition-colors font-mono text-lg"
        >
          ACKNOWLEDGE
        </button>
      </div>
    </div>
  );
}