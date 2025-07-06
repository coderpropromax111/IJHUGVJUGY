import React from 'react';
import { GameState, GameConfig, Move } from '../types/chess';
import { Crown, Clock, History, RotateCcw, Home } from 'lucide-react';

interface GameInfoProps {
  gameState: GameState;
  gameConfig: GameConfig;
  onNewGame: () => void;
  onRotateBoard?: () => void;
  isRotated?: boolean;
}

export const GameInfo: React.FC<GameInfoProps> = ({
  gameState,
  gameConfig,
  onNewGame,
  onRotateBoard,
  isRotated = false,
}) => {
  const getStatusMessage = () => {
    switch (gameState.gameStatus) {
      case 'check':
        return `${gameState.currentPlayer === 'white' ? 'White' : 'Black'} is in check!`;
      case 'checkmate':
        return `Checkmate! ${gameState.currentPlayer === 'white' ? 'Black' : 'White'} wins!`;
      case 'stalemate':
        return 'Stalemate! Game is a draw.';
      case 'draw':
        return 'Draw by 50-move rule.';
      default:
        return `${gameState.currentPlayer === 'white' ? 'White' : 'Black'} to move`;
    }
  };

  const getStatusColor = () => {
    switch (gameState.gameStatus) {
      case 'check':
        return 'text-yellow-400';
      case 'checkmate':
        return 'text-red-400';
      case 'stalemate':
      case 'draw':
        return 'text-blue-400';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Game Status */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Crown className="w-6 h-6 mr-2 text-amber-400" />
            Game Status
          </h2>
          <div className="flex space-x-2">
            {onRotateBoard && (
              <button
                onClick={onRotateBoard}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200"
                title="Rotate Board"
              >
                <RotateCcw className="w-5 h-5 text-white" />
              </button>
            )}
            <button
              onClick={onNewGame}
              className="p-2 bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors duration-200"
              title="New Game"
            >
              <Home className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        
        <div className={`text-lg font-semibold ${getStatusColor()}`}>
          {getStatusMessage()}
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Mode:</span>
            <div className="text-white font-medium">
              {gameConfig.mode === 'human-vs-bot' ? 'vs Computer' : 'Local Multiplayer'}
            </div>
          </div>
          {gameConfig.mode === 'human-vs-bot' && (
            <div>
              <span className="text-slate-400">Difficulty:</span>
              <div className="text-white font-medium capitalize">
                {gameConfig.difficulty}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Move History */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700/50">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <History className="w-5 h-5 mr-2 text-amber-400" />
          Move History
        </h3>
        
        <div className="max-h-60 overflow-y-auto space-y-2">
          {gameState.moveHistory.length === 0 ? (
            <div className="text-slate-400 text-center py-4">
              No moves yet
            </div>
          ) : (
            <div className="space-y-1">
              {gameState.moveHistory.map((move, index) => (
                <div
                  key={index}
                  className={`
                    flex items-center justify-between p-2 rounded-lg text-sm
                    ${index === gameState.moveHistory.length - 1 
                      ? 'bg-amber-400/10 border border-amber-400/20' 
                      : 'bg-slate-800/50'
                    }
                  `}
                >
                  <span className="text-slate-300">
                    {Math.floor(index / 2) + 1}.{index % 2 === 0 ? '' : '..'}
                  </span>
                  <span className="text-white font-mono">
                    {move.notation}
                  </span>
                  <span className="text-slate-400 text-xs">
                    {move.piece.color} {move.piece.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-4 text-xs text-slate-400 flex justify-between">
          <span>Moves: {gameState.moveHistory.length}</span>
          <span>Turn: {gameState.fullMoveNumber}</span>
        </div>
      </div>

      {/* Game Statistics */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700/50">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-amber-400" />
          Game Stats
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Half-moves:</span>
            <div className="text-white font-medium">{gameState.halfMoveClock}</div>
          </div>
          <div>
            <span className="text-slate-400">Full moves:</span>
            <div className="text-white font-medium">{gameState.fullMoveNumber}</div>
          </div>
        </div>
        
        {gameState.lastMove && (
          <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
            <div className="text-slate-400 text-xs mb-1">Last Move:</div>
            <div className="text-white font-mono text-sm">
              {gameState.lastMove.notation}
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-2xl p-4 border border-blue-700/30">
        <h4 className="text-blue-300 font-semibold mb-2 text-sm">💡 Quick Help</h4>
        <div className="text-blue-200 text-xs space-y-1">
          <p>• <strong>Blue squares:</strong> Suggested moves</p>
          <p>• <strong>Green bulb:</strong> Free undo/hints</p>
          <p>• <strong>Orange/Purple bulb:</strong> Watch ad for more</p>
        </div>
      </div>
    </div>
  );
};