import { DecisionOption } from '@/lib/scenario-data';

interface DecisionPanelProps {
  isVisible: boolean;
  title: string;
  description: string;
  options: DecisionOption[];
  onSelectOption: (option: DecisionOption) => void;
  decisionTimer?: number;
}

export default function DecisionPanel({ 
  isVisible, 
  title, 
  description, 
  options, 
  onSelectOption,
  decisionTimer = 30 
}: DecisionPanelProps) {
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-30 transform transition-transform duration-300 ease-out ${
      isVisible ? 'translate-y-0' : 'translate-y-full'
    }`}>
      <div className="bg-gradient-to-t from-black/95 via-black/85 to-transparent backdrop-blur-tactical p-8">
        
        {/* Decision Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center border border-red-500/40">
              <i className="fas fa-exclamation-triangle text-red-400"></i>
            </div>
            <h2 className="text-xl font-bold text-red-400 font-mono">
              {title}
            </h2>
          </div>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            {description}
          </p>
        </div>

        {/* Decision Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {options.map((option) => (
            <div
              key={option.id}
              className="decision-option tactical-glass rounded-xl p-6 cursor-pointer border-2 border-transparent hover:border-green-500"
              onClick={() => onSelectOption(option)}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{option.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {option.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getOptionIcon(optionId: string): string {
  switch (optionId) {
    case 'stealth': return 'fa-user-ninja';
    case 'direct': return 'fa-running';
    case 'flanking': return 'fa-route';
    case 'lockpick': return 'fa-key';
    case 'window': return 'fa-window-maximize';
    case 'explosive': return 'fa-bomb';
    case 'ram': return 'fa-hammer';
    default: return 'fa-crosshairs';
  }
}

function getRiskColor(risk: string): string {
  switch (risk.toLowerCase()) {
    case 'low': return 'bg-blue-500/20 text-blue-400';
    case 'medium': return 'bg-yellow-500/20 text-yellow-400';
    case 'high': return 'bg-red-500/20 text-red-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
}
