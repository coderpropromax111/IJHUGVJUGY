import { ChessPiece, Position, GameState, PieceColor, Difficulty } from '../types/chess';
import { ChessLogic } from './chessLogic';

export class ChessBot {
  private difficulty: Difficulty;
  private color: PieceColor;

  constructor(difficulty: Difficulty, color: PieceColor) {
    this.difficulty = difficulty;
    this.color = color;
  }

  findBestMove(gameState: GameState): { from: Position; to: Position } | null {
    const allMoves = this.getAllPossibleMoves(gameState.board, this.color);
    if (allMoves.length === 0) return null;

    switch (this.difficulty) {
      case 'easy':
        return this.getRandomMove(allMoves);
      case 'medium':
        return this.getMediumMove(gameState, allMoves);
      case 'hard':
        return this.getHardMove(gameState, allMoves);
      default:
        return this.getRandomMove(allMoves);
    }
  }

  private getAllPossibleMoves(board: (ChessPiece | null)[][], color: PieceColor): Array<{ from: Position; to: Position }> {
    const moves: Array<{ from: Position; to: Position }> = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === color) {
          const validMoves = ChessLogic.getValidMoves(board, { row, col }, null);
          validMoves.forEach(to => {
            // Test if move is legal (doesn't put king in check)
            const testBoard = board.map(r => [...r]);
            testBoard[to.row][to.col] = piece;
            testBoard[row][col] = null;
            if (!ChessLogic.isInCheck(testBoard, color)) {
              moves.push({ from: { row, col }, to });
            }
          });
        }
      }
    }

    return moves;
  }

  private getRandomMove(moves: Array<{ from: Position; to: Position }>): { from: Position; to: Position } {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  private getMediumMove(gameState: GameState, moves: Array<{ from: Position; to: Position }>): { from: Position; to: Position } {
    // Prioritize captures and threats
    const scoredMoves = moves.map(move => ({
      move,
      score: this.evaluateMove(gameState.board, move)
    }));

    scoredMoves.sort((a, b) => b.score - a.score);
    
    // Add some randomness to medium difficulty
    const topMoves = scoredMoves.slice(0, Math.min(3, scoredMoves.length));
    return topMoves[Math.floor(Math.random() * topMoves.length)].move;
  }

  private getHardMove(gameState: GameState, moves: Array<{ from: Position; to: Position }>): { from: Position; to: Position } {
    let bestMove = moves[0];
    let bestScore = -Infinity;

    moves.forEach(move => {
      const score = this.minimax(gameState.board, move, 3, -Infinity, Infinity, true);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    });

    return bestMove;
  }

  private evaluateMove(board: (ChessPiece | null)[][], move: { from: Position; to: Position }): number {
    let score = 0;
    const targetPiece = board[move.to.row][move.to.col];
    
    // Capture value
    if (targetPiece) {
      score += this.getPieceValue(targetPiece.type);
    }

    // Center control
    const centerSquares = [[3, 3], [3, 4], [4, 3], [4, 4]];
    if (centerSquares.some(([r, c]) => r === move.to.row && c === move.to.col)) {
      score += 0.3;
    }

    // Development (knights and bishops)
    const movingPiece = board[move.from.row][move.from.col];
    if (movingPiece && (movingPiece.type === 'knight' || movingPiece.type === 'bishop')) {
      if ((this.color === 'white' && move.from.row === 7) || (this.color === 'black' && move.from.row === 0)) {
        score += 0.5;
      }
    }

    return score;
  }

  private minimax(board: (ChessPiece | null)[][], move: { from: Position; to: Position }, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    if (depth === 0) {
      return this.evaluateBoard(board);
    }

    const newBoard = board.map(row => [...row]);
    const piece = newBoard[move.from.row][move.from.col];
    newBoard[move.to.row][move.to.col] = piece;
    newBoard[move.from.row][move.from.col] = null;

    const currentColor = isMaximizing ? this.color : (this.color === 'white' ? 'black' : 'white');
    const possibleMoves = this.getAllPossibleMoves(newBoard, currentColor);

    if (possibleMoves.length === 0) {
      return isMaximizing ? -Infinity : Infinity;
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const nextMove of possibleMoves) {
        const evaluation = this.minimax(newBoard, nextMove, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const nextMove of possibleMoves) {
        const evaluation = this.minimax(newBoard, nextMove, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  private evaluateBoard(board: (ChessPiece | null)[][]): number {
    let score = 0;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          const pieceValue = this.getPieceValue(piece.type);
          const positionalValue = this.getPositionalValue(piece, { row, col });
          
          if (piece.color === this.color) {
            score += pieceValue + positionalValue;
          } else {
            score -= pieceValue + positionalValue;
          }
        }
      }
    }

    return score;
  }

  private getPieceValue(type: string): number {
    const values: { [key: string]: number } = {
      'pawn': 1,
      'knight': 3,
      'bishop': 3.25,
      'rook': 5,
      'queen': 9,
      'king': 1000
    };
    return values[type] || 0;
  }

  private getPositionalValue(piece: ChessPiece, pos: Position): number {
    // Simple positional evaluation
    let value = 0;
    
    // Center control
    const centerDistance = Math.abs(3.5 - pos.row) + Math.abs(3.5 - pos.col);
    value += (7 - centerDistance) * 0.1;
    
    // Piece-specific positional values
    switch (piece.type) {
      case 'pawn':
        value += piece.color === 'white' ? (7 - pos.row) * 0.1 : pos.row * 0.1;
        break;
      case 'knight':
        value += centerDistance < 2 ? 0.2 : 0;
        break;
      case 'bishop':
        value += centerDistance < 3 ? 0.15 : 0;
        break;
    }
    
    return value;
  }
}