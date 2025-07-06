import React from 'react';
import { Position } from '../types/chess';
import { Lightbulb, ArrowRight } from 'lucide-react';

interface MoveSuggestionsProps {
  isVisible: boolean;
  suggestions: Array<{ from: Position; to: Position; notation: string }>;
  onClose: () => void;
  onSelectMove: (from: Position, to: Position) => void;
}

export const MoveSuggestions: React.FC<MoveSuggestionsProps> = ({
  isVisible,
  suggestions,
  onClose,
  onSelectMove,
}) => {
  if (!isVisible || suggestions.length === 0) return null;

  const getSquareNotation = (pos: Position) => {
    const files = 'abcdefgh';
    const ranks = '87654321';
    return files[pos.col] + ranks[pos.row];
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Suggestions Panel */}
      <div className="relative pointer-events-auto transform transition-all duration-300 ease-out">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl shadow-2xl border-2 border-blue-400/30 p-6 mx-4 max-w-md w-full backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Lightbulb className="w-6 h-6 text-yellow-400 mr-2" />
              <h3 className="text-xl font-bold text-white">
                Suggested Moves
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-blue-200 hover:text-white transition-colors duration-200 text-sm px-3 py-1 rounded-lg hover:bg-blue-700/50"
            >
              Close
            </button>
          </div>
          
          <p className="text-blue-100 text-sm mb-4">
            These moves can help get your king out of check:
          </p>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {suggestions.slice(0, 5).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSelectMove(suggestion.from, suggestion.to)}
                className="w-full p-3 bg-blue-800/50 hover:bg-blue-700/70 rounded-lg transition-all duration-200 text-left border border-blue-600/30 hover:border-blue-400/50 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-blue-200 text-sm font-mono">
                      {getSquareNotation(suggestion.from)}
                    </span>
                    <ArrowRight className="w-4 h-4 text-blue-300 mx-2 group-hover:translate-x-1 transition-transform duration-200" />
                    <span className="text-blue-200 text-sm font-mono">
                      {getSquareNotation(suggestion.to)}
                    </span>
                  </div>
                  <span className="text-white font-medium">
                    {suggestion.notation}
                  </span>
                </div>
              </button>
            ))}
          </div>
          
          {suggestions.length > 5 && (
            <p className="text-blue-300 text-xs mt-2 text-center">
              Showing top 5 moves of {suggestions.length} available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};