export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';
export type GameMode = 'human-vs-human' | 'human-vs-bot';
export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  id: string;
  hasMoved?: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: ChessPiece;
  capturedPiece?: ChessPiece;
  isEnPassant?: boolean;
  isCastling?: boolean;
  promotionPiece?: PieceType;
  notation: string;
}

export interface GameState {
  board: (ChessPiece | null)[][];
  currentPlayer: PieceColor;
  gameStatus: GameStatus;
  moveHistory: Move[];
  selectedSquare: Position | null;
  validMoves: Position[];
  lastMove: Move | null;
  enPassantTarget: Position | null;
  halfMoveClock: number;
  fullMoveNumber: number;
}

export interface GameConfig {
  mode: GameMode;
  difficulty: Difficulty;
  playerColor: PieceColor;
}