import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface VolumeControlProps {
  className?: string;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({ className = '' }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Load mute state from localStorage on component mount
  useEffect(() => {
    const savedMuteState = localStorage.getItem('chess-game-muted');
    if (savedMuteState !== null) {
      setIsMuted(JSON.parse(savedMuteState));
    }
  }, []);

  // Save mute state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chess-game-muted', JSON.stringify(isMuted));
    
    // Apply mute state to all audio elements
    const audioElements = document.querySelectorAll('audio, video');
    audioElements.forEach((element) => {
      if (element instanceof HTMLAudioElement || element instanceof HTMLVideoElement) {
        element.muted = isMuted;
      }
    });
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  return (
    <div className={`${className}`}>
      <button
        onClick={toggleMute}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative p-3 rounded-full shadow-lg transition-all duration-300 transform
          ${isMuted 
            ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500' 
            : 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500'
          }
          ${isHovered ? 'scale-110 shadow-xl' : 'scale-100'}
          border-2 border-white/20
        `}
        title={isMuted ? "Unmute sound" : "Mute sound"}
      >
        {isMuted ? (
          <VolumeX className="w-6 h-6 text-white" />
        ) : (
          <Volume2 className="w-6 h-6 text-white" />
        )}
        
        {/* Glow effect */}
        <div className={`
          absolute inset-0 rounded-full transition-opacity duration-300
          ${isMuted 
            ? 'bg-gradient-to-br from-red-400/30 to-red-500/30' 
            : 'bg-gradient-to-br from-green-400/30 to-green-500/30'
          }
          ${isHovered ? 'opacity-100 animate-pulse' : 'opacity-0'}
        `} />
      </button>
      
      {/* Tooltip */}
      {isHovered && (
        <div className={`
          absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2
          px-3 py-2 rounded-lg text-sm font-medium text-white whitespace-nowrap
          ${isMuted ? 'bg-red-600' : 'bg-green-600'}
          shadow-lg border border-white/20
        `}>
          {isMuted ? "Unmute sound" : "Mute sound"}
          <div className={`
            absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0
            border-l-4 border-r-4 border-transparent
            ${isMuted ? 'border-t-red-600' : 'border-t-green-600'}
          `} />
        </div>
      )}
    </div>
  );
};