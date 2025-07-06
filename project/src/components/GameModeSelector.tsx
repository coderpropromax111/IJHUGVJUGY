import React from 'react';
import { GameMode, Difficulty, PieceColor } from '../types/chess';
import { Bot, Users, Crown, Zap, Target } from 'lucide-react';

interface GameModeSelectorProps {
  selectedMode: GameMode;
  selectedDifficulty: Difficulty;
  selectedColor: PieceColor;
  onModeChange: (mode: GameMode) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onColorChange: (color: PieceColor) => void;
  onStartGame: () => void;
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  selectedMode,
  selectedDifficulty,
  selectedColor,
  onModeChange,
  onDifficultyChange,
  onColorChange,
  onStartGame,
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700/50 backdrop-blur-sm">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Crown className="w-12 h-12 text-amber-400 mr-3" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
            Royal Chess
          </h1>
        </div>
        <p className="text-slate-300 text-lg">Choose your battle</p>
      </div>

      {/* Game Mode Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-amber-400" />
          Game Mode
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => onModeChange('human-vs-bot')}
            className={`
              p-6 rounded-xl border-2 transition-all duration-300 text-left
              ${selectedMode === 'human-vs-bot'
                ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/20'
                : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
              }
            `}
          >
            <div className="flex items-center mb-3">
              <Bot className="w-8 h-8 text-amber-400 mr-3" />
              <h4 className="text-lg font-semibold text-white">vs Computer</h4>
            </div>
            <p className="text-slate-300 text-sm">
              Challenge our intelligent AI opponent with multiple difficulty levels
            </p>
          </button>

          <button
            onClick={() => onModeChange('human-vs-human')}
            className={`
              p-6 rounded-xl border-2 transition-all duration-300 text-left
              ${selectedMode === 'human-vs-human'
                ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/20'
                : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
              }
            `}
          >
            <div className="flex items-center mb-3">
              <Users className="w-8 h-8 text-amber-400 mr-3" />
              <h4 className="text-lg font-semibold text-white">Local Multiplayer</h4>
            </div>
            <p className="text-slate-300 text-sm">
              Play against a friend on the same device, taking turns
            </p>
          </button>
        </div>
      </div>

      {/* AI Settings */}
      {selectedMode === 'human-vs-bot' && (
        <>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-amber-400" />
              Difficulty Level
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => onDifficultyChange(difficulty)}
                  className={`
                    py-3 px-4 rounded-lg font-medium transition-all duration-200 capitalize
                    ${selectedDifficulty === difficulty
                      ? 'bg-amber-400 text-slate-900 shadow-lg'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                    }
                  `}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Your Color</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onColorChange('white')}
                className={`
                  py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center
                  ${selectedColor === 'white'
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                  }
                `}
              >
                <span className="text-2xl mr-2">♔</span>
                White
              </button>
              <button
                onClick={() => onColorChange('black')}
                className={`
                  py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center
                  ${selectedColor === 'black'
                    ? 'bg-slate-900 text-white border-2 border-white shadow-lg'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                  }
                `}
              >
                <span className="text-2xl mr-2">♚</span>
                Black
              </button>
            </div>
          </div>
        </>
      )}

      <button
        onClick={onStartGame}
        className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
      >
        <Crown className="w-6 h-6 mr-2" />
        Start Game
      </button>
    </div>
  );
};