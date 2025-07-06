import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, Lightbulb } from 'lucide-react';

interface CheckNotificationProps {
  isVisible: boolean;
  playerInCheck: 'white' | 'black' | null;
  onClose: () => void;
  onShowSuggestions?: () => void;
}

export const CheckNotification: React.FC<CheckNotificationProps> = ({
  isVisible,
  playerInCheck,
  onClose,
  onShowSuggestions,
}) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 6000); // Auto-close after 6 seconds (increased to allow time for suggestions)

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!shouldRender) return null;

  const playerColor = playerInCheck === 'white' ? 'White' : 'Black';
  const bgColor = playerInCheck === 'white' ? 'from-red-500 to-red-600' : 'from-red-600 to-red-700';
  const iconColor = playerInCheck === 'white' ? 'text-red-100' : 'text-red-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className={`
          absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
      />
      
      {/* Notification */}
      <div 
        className={`
          relative pointer-events-auto transform transition-all duration-300 ease-out
          ${isVisible 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
          }
        `}
      >
        <div className={`
          bg-gradient-to-r ${bgColor} rounded-2xl shadow-2xl border-2 border-red-400/30
          p-6 mx-4 max-w-sm w-full backdrop-blur-sm
          animate-pulse-slow
        `}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="relative">
                <AlertTriangle className={`w-8 h-8 ${iconColor} animate-bounce`} />
                <div className="absolute inset-0 w-8 h-8 bg-red-300/30 rounded-full animate-ping" />
              </div>
              <h3 className="text-xl font-bold text-white ml-3">
                Check!
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-red-100 hover:text-white transition-colors duration-200 p-1 rounded-full hover:bg-red-400/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-center mb-4">
            <p className="text-red-50 text-lg font-semibold mb-2">
              {playerColor} King is in Check!
            </p>
            <p className="text-red-100/80 text-sm">
              The {playerColor.toLowerCase()} king must move to safety or block the attack.
            </p>
          </div>

          {/* Suggestions Button */}
          {onShowSuggestions && (
            <div className="flex justify-center">
              <button
                onClick={() => {
                  onShowSuggestions();
                  onClose();
                }}
                className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-white font-medium text-sm"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Show Suggestions
              </button>
            </div>
          )}
          
          {/* Decorative elements */}
          <div className="absolute top-2 right-2 w-2 h-2 bg-red-300/50 rounded-full animate-pulse" />
          <div className="absolute bottom-2 left-2 w-1 h-1 bg-red-300/50 rounded-full animate-pulse delay-75" />
          <div className="absolute top-1/2 left-1 w-1 h-1 bg-red-300/50 rounded-full animate-pulse delay-150" />
        </div>
      </div>
    </div>
  );
};