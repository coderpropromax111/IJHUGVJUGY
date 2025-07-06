import React, { useState } from 'react';
import { Undo, Zap } from 'lucide-react';

interface UndoBulbProps {
  onRequestUndo: () => void;
  hasUsedFreeUndo: boolean;
  isVisible: boolean;
  canUndo: boolean;
}

export const UndoBulb: React.FC<UndoBulbProps> = ({
  onRequestUndo,
  hasUsedFreeUndo,
  isVisible,
  canUndo,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!isVisible || !canUndo) return null;

  return (
    <div className="absolute -left-16 top-1/2 transform -translate-y-1/2">
      <button
        onClick={onRequestUndo}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative p-4 rounded-full shadow-2xl transition-all duration-300 transform
          ${hasUsedFreeUndo 
            ? 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500' 
            : 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500'
          }
          ${isHovered ? 'scale-110 shadow-3xl' : 'scale-100'}
          hover:shadow-purple-500/25 border-2 border-white/20
        `}
        title={hasUsedFreeUndo ? "Watch ad to undo move" : "Undo last move (Free)"}
      >
        {hasUsedFreeUndo ? (
          <Zap className="w-8 h-8 text-white animate-pulse" />
        ) : (
          <Undo className="w-8 h-8 text-white" />
        )}
        
        {/* Glow effect */}
        <div className={`
          absolute inset-0 rounded-full transition-opacity duration-300
          ${hasUsedFreeUndo 
            ? 'bg-gradient-to-br from-purple-400/30 to-purple-500/30' 
            : 'bg-gradient-to-br from-green-400/30 to-green-500/30'
          }
          ${isHovered ? 'opacity-100 animate-pulse' : 'opacity-0'}
        `} />
        
        {/* Free indicator */}
        {!hasUsedFreeUndo && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white">
            FREE
          </div>
        )}
        
        {/* Ad indicator */}
        {hasUsedFreeUndo && (
          <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white">
            AD
          </div>
        )}
      </button>
      
      {/* Tooltip */}
      {isHovered && (
        <div className={`
          absolute right-1/2 transform translate-x-1/2 -translate-y-full -top-2
          px-3 py-2 rounded-lg text-sm font-medium text-white whitespace-nowrap
          ${hasUsedFreeUndo 
            ? 'bg-purple-600' 
            : 'bg-green-600'
          }
          shadow-lg border border-white/20
        `}>
          {hasUsedFreeUndo ? "Watch ad to undo" : "Free undo move"}
          <div className={`
            absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0
            border-l-4 border-r-4 border-transparent
            ${hasUsedFreeUndo ? 'border-t-purple-600' : 'border-t-green-600'}
          `} />
        </div>
      )}
    </div>
  );
};