import React from 'react';
import { useChessGame } from './hooks/useChessGame';
import { ChessBoard } from './components/ChessBoard';
import { GameModeSelector } from './components/GameModeSelector';
import { GameInfo } from './components/GameInfo';
import { CheckNotification } from './components/CheckNotification';
import { SuggestionBulb } from './components/SuggestionBulb';
import { UndoBulb } from './components/UndoBulb';
import { VolumeControl } from './components/VolumeControl';

function App() {
  const {
    gameState,
    gameConfig,
    gameStarted,
    isRotated,
    showCheckNotification,
    playerInCheck,
    suggestedMoves,
    hasUsedFreeSuggestion,
    hasUsedFreeUndo,
    isLoadingAd,
    startGame,
    resetGame,
    undoMove,
    requestSuggestions,
    handleSquareClick,
    handlePieceMove,
    updateGameConfig,
    rotateBoard,
    closeCheckNotification,
  } = useChessGame();

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <GameModeSelector
            selectedMode={gameConfig.mode}
            selectedDifficulty={gameConfig.difficulty}
            selectedColor={gameConfig.playerColor}
            onModeChange={(mode) => updateGameConfig({ mode })}
            onDifficultyChange={(difficulty) => updateGameConfig({ difficulty })}
            onColorChange={(playerColor) => updateGameConfig({ playerColor })}
            onStartGame={startGame}
          />
        </div>
        
        {/* Volume Control */}
        <VolumeControl className="fixed bottom-6 right-6" />
        
        {/* Background decoration */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-amber-900/10 to-transparent" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-slate-900/20 to-transparent" />
        </div>
      </div>
    );
  }

  const canUndo = gameState.moveHistory.length > 0;
  const showSuggestionBulb = gameState.gameStatus === 'playing' && 
    gameState.currentPlayer === (gameConfig.mode === 'human-vs-bot' ? gameConfig.playerColor : gameState.currentPlayer);

  return (
    <>
      {/* Background Music */}
      <audio src={require('../snowy-peaks-270901.mp3')} autoPlay loop volume={0.15} style={{ display: 'none' }} />
      {/* Main App Content */}
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Chess Board with Action Bulbs */}
            <div className="xl:col-span-2 flex items-center justify-center relative">
              <div className="relative">
                <ChessBoard
                  board={gameState.board}
                  selectedSquare={gameState.selectedSquare}
                  validMoves={gameState.validMoves}
                  lastMove={gameState.lastMove}
                  suggestedMoves={suggestedMoves}
                  onSquareClick={handleSquareClick}
                  onPieceMove={handlePieceMove}
                  isRotated={isRotated}
                />
                
                {/* Undo Bulb (Left side) */}
                <UndoBulb
                  onRequestUndo={undoMove}
                  hasUsedFreeUndo={hasUsedFreeUndo}
                  isVisible={!isLoadingAd}
                  canUndo={canUndo}
                />
                
                {/* Suggestion Bulb (Right side) */}
                <SuggestionBulb
                  onRequestSuggestions={requestSuggestions}
                  hasUsedFreeSuggestion={hasUsedFreeSuggestion}
                  isVisible={showSuggestionBulb && !isLoadingAd}
                />
                
                {/* Loading indicator for ads */}
                {isLoadingAd && (
                  <div className="absolute -right-16 top-1/2 transform -translate-y-1/2">
                    <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full shadow-2xl">
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Game Info Panel */}
            <div className="xl:col-span-1">
              <GameInfo
                gameState={gameState}
                gameConfig={gameConfig}
                onNewGame={resetGame}
                onRotateBoard={rotateBoard}
                isRotated={isRotated}
              />
            </div>
          </div>
        </div>
        
        {/* Volume Control */}
        <VolumeControl className="fixed bottom-6 right-6" />
        
        {/* Check Notification */}
        <CheckNotification
          isVisible={showCheckNotification}
          playerInCheck={playerInCheck}
          onClose={closeCheckNotification}
        />
        
        {/* Background decoration */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-amber-900/5 to-transparent" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-radial from-blue-900/5 to-transparent" />
        </div>
      </div>
    </>
  );
}

export default App;
