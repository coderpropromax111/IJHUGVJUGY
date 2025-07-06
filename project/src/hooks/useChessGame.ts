import { useState, useCallback, useEffect } from 'react';
import { GameState, GameConfig, Position, GameMode, Difficulty, PieceColor } from '../types/chess';
import { ChessLogic } from '../utils/chessLogic';
import { ChessBot } from '../utils/chessBot';
import { AdManager } from '../utils/adManager';

export const useChessGame = () => {
  const [gameState, setGameState] = useState<GameState>(ChessLogic.createInitialState());
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    mode: 'human-vs-bot',
    difficulty: 'medium',
    playerColor: 'white',
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [bot, setBot] = useState<ChessBot | null>(null);
  const [isRotated, setIsRotated] = useState(false);
  const [showCheckNotification, setShowCheckNotification] = useState(false);
  const [playerInCheck, setPlayerInCheck] = useState<'white' | 'black' | null>(null);
  const [suggestedMoves, setSuggestedMoves] = useState<Position[]>([]);
  const [hasUsedFreeSuggestion, setHasUsedFreeSuggestion] = useState(false);
  const [hasUsedFreeUndo, setHasUsedFreeUndo] = useState(false);
  const [isLoadingAd, setIsLoadingAd] = useState(false);

  const adManager = AdManager.getInstance();

  // Set up ad callbacks
  useEffect(() => {
    adManager.setAdCallbacks(
      () => setIsLoadingAd(true),  // onAdStarted
      () => setIsLoadingAd(false)  // onAdFinished
    );
  }, [adManager]);

  // Initialize bot when needed
  useEffect(() => {
    if (gameConfig.mode === 'human-vs-bot') {
      const botColor = gameConfig.playerColor === 'white' ? 'black' : 'white';
      setBot(new ChessBot(gameConfig.difficulty, botColor));
    } else {
      setBot(null);
    }
  }, [gameConfig]);

  // Handle check notifications
  useEffect(() => {
    if (gameState.gameStatus === 'check') {
      setPlayerInCheck(gameState.currentPlayer);
      setShowCheckNotification(true);
    } else {
      setPlayerInCheck(null);
      setShowCheckNotification(false);
    }
  }, [gameState.gameStatus, gameState.currentPlayer]);

  // Handle bot moves
  useEffect(() => {
    if (
      bot && 
      gameStarted && 
      gameState.gameStatus === 'playing' &&
      gameState.currentPlayer !== gameConfig.playerColor
    ) {
      const timer = setTimeout(() => {
        const botMove = bot.findBestMove(gameState);
        if (botMove) {
          const newGameState = ChessLogic.makeMove(gameState, botMove.from, botMove.to);
          if (newGameState) {
            setGameState(newGameState);
          }
        }
      }, 500); // Add small delay to make bot moves visible

      return () => clearTimeout(timer);
    }
  }, [bot, gameStarted, gameState, gameConfig.playerColor]);

  const startGame = useCallback(() => {
    setGameState(ChessLogic.createInitialState());
    setGameStarted(true);
    setIsRotated(gameConfig.playerColor === 'black');
    setShowCheckNotification(false);
    setPlayerInCheck(null);
    setSuggestedMoves([]);
    setHasUsedFreeSuggestion(false);
    setHasUsedFreeUndo(false);
    
    // Start the ad timer
    adManager.startGameTimer();
  }, [gameConfig.playerColor, adManager]);

  const resetGame = useCallback(() => {
    setGameState(ChessLogic.createInitialState());
    setGameStarted(false);
    setIsRotated(false);
    setShowCheckNotification(false);
    setPlayerInCheck(null);
    setSuggestedMoves([]);
    setHasUsedFreeSuggestion(false);
    setHasUsedFreeUndo(false);
    
    // Stop the ad timer
    adManager.stopGameTimer();
  }, [adManager]);

  const undoMove = useCallback(async () => {
    if (gameState.moveHistory.length === 0) return;
    if (isLoadingAd) return;

    if (!hasUsedFreeUndo) {
      // First undo is free
      setHasUsedFreeUndo(true);
      performUndo();
    } else {
      // Subsequent undos require watching an ad
      setIsLoadingAd(true);
      
      try {
        const adWatched = await adManager.requestRewardedAd();
        if (adWatched) {
          performUndo();
        } else {
          console.log('Ad failed or was skipped');
        }
      } catch (error) {
        console.error('Error requesting ad:', error);
      } finally {
        setIsLoadingAd(false);
      }
    }
  }, [gameState, gameConfig, hasUsedFreeUndo, isLoadingAd, adManager]);

  const performUndo = useCallback(() => {
    // In bot mode, undo both player and bot moves to get back to player's turn
    let newGameState = ChessLogic.undoLastMove(gameState);
    if (newGameState && gameConfig.mode === 'human-vs-bot' && newGameState.currentPlayer !== gameConfig.playerColor) {
      const secondUndo = ChessLogic.undoLastMove(newGameState);
      if (secondUndo) {
        newGameState = secondUndo;
      }
    }
    
    if (newGameState) {
      setGameState(newGameState);
      setSuggestedMoves([]); // Clear suggestions after undo
    }
  }, [gameState, gameConfig]);

  const requestSuggestions = useCallback(async () => {
    if (isLoadingAd) return;

    // Generate suggestions for current position
    let movesToHighlight: Position[] = [];

    if (gameState.gameStatus === 'check') {
      // If in check, show escape moves
      const checkEscapeMoves = ChessLogic.getCheckEscapeMoves(gameState);
      movesToHighlight = checkEscapeMoves.slice(0, 5).map(move => move.to);
    } else {
      // If not in check, get best possible moves
      const allMoves: Array<{ from: Position; to: Position; score: number }> = [];
      
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = gameState.board[row][col];
          if (piece && piece.color === gameState.currentPlayer) {
            const validMoves = ChessLogic.getValidMoves(gameState.board, { row, col }, gameState.enPassantTarget);
            for (const move of validMoves) {
              const testGameState = ChessLogic.makeMove(gameState, { row, col }, move);
              if (testGameState) {
                // Simple scoring: captures are better, center control is good
                let score = 0;
                const capturedPiece = gameState.board[move.row][move.col];
                if (capturedPiece) {
                  score += 10; // Capture bonus
                }
                // Center control bonus
                const centerDistance = Math.abs(3.5 - move.row) + Math.abs(3.5 - move.col);
                score += (7 - centerDistance) * 0.5;
                
                allMoves.push({ from: { row, col }, to: move, score });
              }
            }
          }
        }
      }
      
      // Sort by score and take top 5
      allMoves.sort((a, b) => b.score - a.score);
      movesToHighlight = allMoves.slice(0, 5).map(move => move.to);
    }

    if (!hasUsedFreeSuggestion) {
      // First time is free
      setHasUsedFreeSuggestion(true);
      setSuggestedMoves(movesToHighlight);
      
      // Auto-clear suggestions after 8 seconds
      setTimeout(() => {
        setSuggestedMoves([]);
      }, 8000);
    } else {
      // Subsequent uses require watching an ad
      setIsLoadingAd(true);
      
      try {
        const adWatched = await adManager.requestRewardedAd();
        if (adWatched) {
          setSuggestedMoves(movesToHighlight);
          
          // Auto-clear suggestions after 8 seconds
          setTimeout(() => {
            setSuggestedMoves([]);
          }, 8000);
        } else {
          console.log('Ad failed or was skipped');
        }
      } catch (error) {
        console.error('Error requesting ad:', error);
      } finally {
        setIsLoadingAd(false);
      }
    }
  }, [gameState, hasUsedFreeSuggestion, isLoadingAd, adManager]);

  const handleSquareClick = useCallback((position: Position) => {
    if (gameState.gameStatus !== 'playing') return;
    
    // In bot mode, prevent moves when it's bot's turn
    if (gameConfig.mode === 'human-vs-bot' && gameState.currentPlayer !== gameConfig.playerColor) {
      return;
    }

    // Clear suggestions when player makes a move
    if (suggestedMoves.length > 0) {
      setSuggestedMoves([]);
    }

    const piece = ChessLogic.getPieceAt(gameState.board, position);
    
    if (gameState.selectedSquare) {
      // If clicking on the same square, deselect
      if (gameState.selectedSquare.row === position.row && gameState.selectedSquare.col === position.col) {
        setGameState(prev => ({
          ...prev,
          selectedSquare: null,
          validMoves: [],
        }));
        return;
      }
      
      // Try to make a move
      const isValidMove = gameState.validMoves.some(
        move => move.row === position.row && move.col === position.col
      );
      
      if (isValidMove) {
        const newGameState = ChessLogic.makeMove(gameState, gameState.selectedSquare, position);
        if (newGameState) {
          setGameState({
            ...newGameState,
            selectedSquare: null,
            validMoves: [],
          });
        }
        return;
      }
    }
    
    // Select a piece
    if (piece && piece.color === gameState.currentPlayer) {
      const validMoves = ChessLogic.getValidMoves(gameState.board, position, gameState.enPassantTarget);
      // Filter moves that would put own king in check
      const legalMoves = validMoves.filter(move => {
        const testGameState = ChessLogic.makeMove(gameState, position, move);
        return testGameState !== null;
      });
      
      setGameState(prev => ({
        ...prev,
        selectedSquare: position,
        validMoves: legalMoves,
      }));
    } else {
      // Deselect if clicking on invalid square
      setGameState(prev => ({
        ...prev,
        selectedSquare: null,
        validMoves: [],
      }));
    }
  }, [gameState, gameConfig, suggestedMoves]);

  const handlePieceMove = useCallback((from: Position, to: Position) => {
    if (gameState.gameStatus !== 'playing') return;
    
    // In bot mode, prevent moves when it's bot's turn
    if (gameConfig.mode === 'human-vs-bot' && gameState.currentPlayer !== gameConfig.playerColor) {
      return;
    }

    // Clear suggestions when player makes a move
    if (suggestedMoves.length > 0) {
      setSuggestedMoves([]);
    }

    const newGameState = ChessLogic.makeMove(gameState, from, to);
    if (newGameState) {
      setGameState({
        ...newGameState,
        selectedSquare: null,
        validMoves: [],
      });
    }
  }, [gameState, gameConfig, suggestedMoves]);

  const updateGameConfig = useCallback((updates: Partial<GameConfig>) => {
    setGameConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const rotateBoard = useCallback(() => {
    setIsRotated(prev => !prev);
  }, []);

  const closeCheckNotification = useCallback(() => {
    setShowCheckNotification(false);
  }, []);

  return {
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
  };
};