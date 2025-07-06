import React, { useState } from 'react';
import { Lightbulb, Zap } from 'lucide-react';

interface SuggestionBulbProps {
  onRequestSuggestions: () => void;
  hasUsedFreeSuggestion: boolean;
  isVisible: boolean;
}

export const SuggestionBulb: React.FC<SuggestionBulbProps> = ({
  onRequestSuggestions,
  hasUsedFreeSuggestion,
  isVisible,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="absolute -right-16 top-1/2 transform -translate-y-1/2">
      <button
        onClick={onRequestSuggestions}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative p-4 rounded-full shadow-2xl transition-all duration-300 transform
          ${hasUsedFreeSuggestion 
            ? 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500' 
            : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500'
          }
          ${isHovered ? 'scale-110 shadow-3xl' : 'scale-100'}
          hover:shadow-blue-500/25 border-2 border-white/20
        `}
        title={hasUsedFreeSuggestion ? "Watch ad for move suggestions" : "Get move suggestions (Free)"}
      >
        {hasUsedFreeSuggestion ? (
          <Zap className="w-8 h-8 text-white animate-pulse" />
        ) : (
          <Lightbulb className="w-8 h-8 text-white" />
        )}
        
        {/* Glow effect */}
        <div className={`
          absolute inset-0 rounded-full transition-opacity duration-300
          ${hasUsedFreeSuggestion 
            ? 'bg-gradient-to-br from-amber-400/30 to-orange-500/30' 
            : 'bg-gradient-to-br from-blue-400/30 to-blue-500/30'
          }
          ${isHovered ? 'opacity-100 animate-pulse' : 'opacity-0'}
        `} />
        
        {/* Free indicator */}
        {!hasUsedFreeSuggestion && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white">
            FREE
          </div>
        )}
        
        {/* Ad indicator */}
        {hasUsedFreeSuggestion && (
          <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white">
            AD
          </div>
        )}
      </button>
      
      {/* Tooltip */}
      {isHovered && (
        <div className={`
          absolute left-1/2 transform -translate-x-1/2 -translate-y-full -top-2
          px-3 py-2 rounded-lg text-sm font-medium text-white whitespace-nowrap
          ${hasUsedFreeSuggestion 
            ? 'bg-amber-600' 
            : 'bg-blue-600'
          }
          shadow-lg border border-white/20
        `}>
          {hasUsedFreeSuggestion ? "Watch ad for hints" : "Free move hints"}
          <div className={`
            absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0
            border-l-4 border-r-4 border-transparent
            ${hasUsedFreeSuggestion ? 'border-t-amber-600' : 'border-t-blue-600'}
          `} />
        </div>
      )}
    </div>
  );
};