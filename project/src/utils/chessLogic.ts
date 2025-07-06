import { ChessPiece, Position, Move, GameState, PieceColor, PieceType, GameStatus } from '../types/chess';

export class ChessLogic {
  static createInitialBoard(): (ChessPiece | null)[][] {
    const board: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Place pawns
    for (let col = 0; col < 8; col++) {
      board[1][col] = { type: 'pawn', color: 'black', id: `black-pawn-${col}` };
      board[6][col] = { type: 'pawn', color: 'white', id: `white-pawn-${col}` };
    }
    
    // Place other pieces
    const pieceOrder: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    pieceOrder.forEach((type, col) => {
      board[0][col] = { type, color: 'black', id: `black-${type}-${col}` };
      board[7][col] = { type, color: 'white', id: `white-${type}-${col}` };
    });
    
    return board;
  }

  static createInitialState(): GameState {
    return {
      board: this.createInitialBoard(),
      currentPlayer: 'white',
      gameStatus: 'playing',
      moveHistory: [],
      selectedSquare: null,
      validMoves: [],
      lastMove: null,
      enPassantTarget: null,
      halfMoveClock: 0,
      fullMoveNumber: 1,
    };
  }

  static isValidPosition(pos: Position): boolean {
    return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
  }

  static getPieceAt(board: (ChessPiece | null)[][], pos: Position): ChessPiece | null {
    return this.isValidPosition(pos) ? board[pos.row][pos.col] : null;
  }

  static getValidMoves(board: (ChessPiece | null)[][], from: Position, enPassantTarget: Position | null): Position[] {
    const piece = this.getPieceAt(board, from);
    if (!piece) return [];

    switch (piece.type) {
      case 'pawn':
        return this.getPawnMoves(board, from, piece.color, enPassantTarget);
      case 'rook':
        return this.getRookMoves(board, from, piece.color);
      case 'knight':
        return this.getKnightMoves(board, from, piece.color);
      case 'bishop':
        return this.getBishopMoves(board, from, piece.color);
      case 'queen':
        return this.getQueenMoves(board, from, piece.color);
      case 'king':
        return this.getKingMoves(board, from, piece.color);
      default:
        return [];
    }
  }

  static getPawnMoves(board: (ChessPiece | null)[][], from: Position, color: PieceColor, enPassantTarget: Position | null): Position[] {
    const moves: Position[] = [];
    const direction = color === 'white' ? -1 : 1;
    const startRow = color === 'white' ? 6 : 1;

    // Forward move
    const oneStep = { row: from.row + direction, col: from.col };
    if (this.isValidPosition(oneStep) && !this.getPieceAt(board, oneStep)) {
      moves.push(oneStep);

      // Two steps from starting position
      if (from.row === startRow) {
        const twoSteps = { row: from.row + 2 * direction, col: from.col };
        if (this.isValidPosition(twoSteps) && !this.getPieceAt(board, twoSteps)) {
          moves.push(twoSteps);
        }
      }
    }

    // Captures
    const captures = [
      { row: from.row + direction, col: from.col - 1 },
      { row: from.row + direction, col: from.col + 1 }
    ];

    captures.forEach(pos => {
      if (this.isValidPosition(pos)) {
        const target = this.getPieceAt(board, pos);
        if (target && target.color !== color) {
          moves.push(pos);
        }
      }
    });

    // En passant
    if (enPassantTarget) {
      const enPassantCaptures = [
        { row: from.row + direction, col: from.col - 1 },
        { row: from.row + direction, col: from.col + 1 }
      ];
      
      enPassantCaptures.forEach(pos => {
        if (pos.row === enPassantTarget.row && pos.col === enPassantTarget.col) {
          moves.push(pos);
        }
      });
    }

    return moves;
  }

  static getRookMoves(board: (ChessPiece | null)[][], from: Position, color: PieceColor): Position[] {
    const moves: Position[] = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    directions.forEach(([dRow, dCol]) => {
      for (let i = 1; i < 8; i++) {
        const pos = { row: from.row + i * dRow, col: from.col + i * dCol };
        if (!this.isValidPosition(pos)) break;

        const piece = this.getPieceAt(board, pos);
        if (!piece) {
          moves.push(pos);
        } else {
          if (piece.color !== color) moves.push(pos);
          break;
        }
      }
    });

    return moves;
  }

  static getKnightMoves(board: (ChessPiece | null)[][], from: Position, color: PieceColor): Position[] {
    const moves: Position[] = [];
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    knightMoves.forEach(([dRow, dCol]) => {
      const pos = { row: from.row + dRow, col: from.col + dCol };
      if (this.isValidPosition(pos)) {
        const piece = this.getPieceAt(board, pos);
        if (!piece || piece.color !== color) {
          moves.push(pos);
        }
      }
    });

    return moves;
  }

  static getBishopMoves(board: (ChessPiece | null)[][], from: Position, color: PieceColor): Position[] {
    const moves: Position[] = [];
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

    directions.forEach(([dRow, dCol]) => {
      for (let i = 1; i < 8; i++) {
        const pos = { row: from.row + i * dRow, col: from.col + i * dCol };
        if (!this.isValidPosition(pos)) break;

        const piece = this.getPieceAt(board, pos);
        if (!piece) {
          moves.push(pos);
        } else {
          if (piece.color !== color) moves.push(pos);
          break;
        }
      }
    });

    return moves;
  }

  static getQueenMoves(board: (ChessPiece | null)[][], from: Position, color: PieceColor): Position[] {
    return [
      ...this.getRookMoves(board, from, color),
      ...this.getBishopMoves(board, from, color)
    ];
  }

  static getKingMoves(board: (ChessPiece | null)[][], from: Position, color: PieceColor): Position[] {
    const moves: Position[] = [];
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];

    directions.forEach(([dRow, dCol]) => {
      const pos = { row: from.row + dRow, col: from.col + dCol };
      if (this.isValidPosition(pos)) {
        const piece = this.getPieceAt(board, pos);
        if (!piece || piece.color !== color) {
          moves.push(pos);
        }
      }
    });

    return moves;
  }

  static isInCheck(board: (ChessPiece | null)[][], color: PieceColor): boolean {
    const king = this.findKing(board, color);
    if (!king) return false;

    const oppositeColor = color === 'white' ? 'black' : 'white';
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === oppositeColor) {
          const moves = this.getValidMoves(board, { row, col }, null);
          if (moves.some(move => move.row === king.row && move.col === king.col)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  static findKing(board: (ChessPiece | null)[][], color: PieceColor): Position | null {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === 'king' && piece.color === color) {
          return { row, col };
        }
      }
    }
    return null;
  }

  static makeMove(gameState: GameState, from: Position, to: Position): GameState | null {
    const newBoard = gameState.board.map(row => [...row]);
    const piece = newBoard[from.row][from.col];
    
    if (!piece) return null;

    const capturedPiece = newBoard[to.row][to.col];
    
    // Make the move
    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = null;

    // Check if move puts own king in check
    if (this.isInCheck(newBoard, piece.color)) {
      return null;
    }

    const move: Move = {
      from,
      to,
      piece,
      capturedPiece: capturedPiece || undefined,
      notation: this.getMoveNotation(from, to, piece, capturedPiece)
    };

    const newGameState: GameState = {
      ...gameState,
      board: newBoard,
      currentPlayer: piece.color === 'white' ? 'black' : 'white',
      moveHistory: [...gameState.moveHistory, move],
      selectedSquare: null,
      validMoves: [],
      lastMove: move,
      enPassantTarget: null,
      halfMoveClock: capturedPiece || piece.type === 'pawn' ? 0 : gameState.halfMoveClock + 1,
      fullMoveNumber: piece.color === 'black' ? gameState.fullMoveNumber + 1 : gameState.fullMoveNumber,
    };

    // Update game status
    newGameState.gameStatus = this.getGameStatus(newGameState);

    return newGameState;
  }

  static undoLastMove(gameState: GameState): GameState | null {
    if (gameState.moveHistory.length === 0) return null;

    const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1];
    const newBoard = gameState.board.map(row => [...row]);
    
    // Restore the piece to its original position
    newBoard[lastMove.from.row][lastMove.from.col] = lastMove.piece;
    
    // Restore captured piece if any
    if (lastMove.capturedPiece) {
      newBoard[lastMove.to.row][lastMove.to.col] = lastMove.capturedPiece;
    } else {
      newBoard[lastMove.to.row][lastMove.to.col] = null;
    }

    const newGameState: GameState = {
      ...gameState,
      board: newBoard,
      currentPlayer: lastMove.piece.color,
      moveHistory: gameState.moveHistory.slice(0, -1),
      selectedSquare: null,
      validMoves: [],
      lastMove: gameState.moveHistory.length > 1 ? gameState.moveHistory[gameState.moveHistory.length - 2] : null,
      enPassantTarget: null,
      halfMoveClock: Math.max(0, gameState.halfMoveClock - 1),
      fullMoveNumber: lastMove.piece.color === 'black' ? gameState.fullMoveNumber - 1 : gameState.fullMoveNumber,
    };

    // Update game status
    newGameState.gameStatus = this.getGameStatus(newGameState);

    return newGameState;
  }

  static getCheckEscapeMoves(gameState: GameState): Array<{ from: Position; to: Position; notation: string }> {
    const moves: Array<{ from: Position; to: Position; notation: string }> = [];
    const currentPlayer = gameState.currentPlayer;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.color === currentPlayer) {
          const validMoves = this.getValidMoves(gameState.board, { row, col }, gameState.enPassantTarget);
          
          for (const move of validMoves) {
            // Test if this move gets the king out of check
            const testGameState = this.makeMove(gameState, { row, col }, move);
            if (testGameState && testGameState.gameStatus !== 'check') {
              moves.push({
                from: { row, col },
                to: move,
                notation: this.getMoveNotation({ row, col }, move, piece, gameState.board[move.row][move.col])
              });
            }
          }
        }
      }
    }

    // Sort moves by priority (king moves first, then captures, then other moves)
    return moves.sort((a, b) => {
      const pieceA = gameState.board[a.from.row][a.from.col];
      const pieceB = gameState.board[b.from.row][b.from.col];
      const captureA = gameState.board[a.to.row][a.to.col] !== null;
      const captureB = gameState.board[b.to.row][b.to.col] !== null;
      
      if (pieceA?.type === 'king' && pieceB?.type !== 'king') return -1;
      if (pieceA?.type !== 'king' && pieceB?.type === 'king') return 1;
      if (captureA && !captureB) return -1;
      if (!captureA && captureB) return 1;
      
      return 0;
    });
  }

  static getGameStatus(gameState: GameState): GameStatus {
    const currentPlayer = gameState.currentPlayer;
    const inCheck = this.isInCheck(gameState.board, currentPlayer);
    const hasValidMoves = this.hasValidMoves(gameState.board, currentPlayer);

    if (inCheck && !hasValidMoves) return 'checkmate';
    if (!inCheck && !hasValidMoves) return 'stalemate';
    if (inCheck) return 'check';
    if (gameState.halfMoveClock >= 50) return 'draw';
    
    return 'playing';
  }

  static hasValidMoves(board: (ChessPiece | null)[][], color: PieceColor): boolean {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === color) {
          const moves = this.getValidMoves(board, { row, col }, null);
          for (const move of moves) {
            const testBoard = board.map(r => [...r]);
            testBoard[move.row][move.col] = piece;
            testBoard[row][col] = null;
            if (!this.isInCheck(testBoard, color)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  static getMoveNotation(from: Position, to: Position, piece: ChessPiece, captured?: ChessPiece | null): string {
    const files = 'abcdefgh';
    const ranks = '87654321';
    
    const fromSquare = files[from.col] + ranks[from.row];
    const toSquare = files[to.col] + ranks[to.row];
    
    const pieceSymbol = piece.type === 'pawn' ? '' : piece.type.charAt(0).toUpperCase();
    const captureSymbol = captured ? 'x' : '';
    
    return `${pieceSymbol}${captureSymbol}${toSquare}`;
  }
}