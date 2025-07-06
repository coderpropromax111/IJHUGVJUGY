import React, { useState, useCallback } from 'react';
import { Position, ChessPiece as ChessPieceType } from '../types/chess';
import { ChessPiece } from './ChessPiece';

interface ChessBoardProps {
  board: (ChessPieceType | null)[][];
  selectedSquare: Position | null;
  validMoves: Position[];
  lastMove: { from: Position; to: Position } | null;
  suggestedMoves?: Position[];
  onSquareClick: (position: Position) => void;
  onPieceMove: (from: Position, to: Position) => void;
  isRotated?: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  selectedSquare,
  validMoves,
  lastMove,
  suggestedMoves = [],
  onSquareClick,
  onPieceMove,
  isRotated = false,
}) => {
  const [draggedPiece, setDraggedPiece] = useState<{ piece: ChessPieceType; from: Position } | null>(null);
  const [dragOver, setDragOver] = useState<Position | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, piece: ChessPieceType, position: Position) => {
    setDraggedPiece({ piece, from: position });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, position: Position) => {
    e.preventDefault();
    setDragOver(position);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, position: Position) => {
    e.preventDefault();
    setDragOver(null);
    
    if (draggedPiece) {
      onPieceMove(draggedPiece.from, position);
      setDraggedPiece(null);
    }
  }, [draggedPiece, onPieceMove]);

  const isValidMove = useCallback((position: Position) => {
    return validMoves.some(move => move.row === position.row && move.col === position.col);
  }, [validMoves]);

  const isSuggestedMove = useCallback((position: Position) => {
    return suggestedMoves.some(move => move.row === position.row && move.col === position.col);
  }, [suggestedMoves]);

  const isLastMoveSquare = useCallback((position: Position) => {
    return lastMove && (
      (lastMove.from.row === position.row && lastMove.from.col === position.col) ||
      (lastMove.to.row === position.row && lastMove.to.col === position.col)
    );
  }, [lastMove]);

  const getSquareColor = useCallback((row: number, col: number) => {
    const isLight = (row + col) % 2 === 0;
    const position = { row, col };
    
    if (selectedSquare && selectedSquare.row === row && selectedSquare.col === col) {
      return isLight ? 'bg-yellow-300 shadow-inner' : 'bg-yellow-600 shadow-inner';
    }
    
    if (isSuggestedMove(position)) {
      return isLight ? 'bg-blue-300 shadow-inner animate-pulse' : 'bg-blue-500 shadow-inner animate-pulse';
    }
    
    if (isValidMove(position)) {
      return isLight ? 'bg-green-200 shadow-inner' : 'bg-green-400 shadow-inner';
    }
    
    if (isLastMoveSquare(position)) {
      return isLight ? 'bg-blue-200 shadow-inner' : 'bg-blue-400 shadow-inner';
    }
    
    if (dragOver && dragOver.row === row && dragOver.col === col) {
      return isLight ? 'bg-purple-200 shadow-inner' : 'bg-purple-400 shadow-inner';
    }
    
    return isLight 
      ? 'bg-gradient-to-br from-amber-100 to-amber-200 shadow-inner' 
      : 'bg-gradient-to-br from-amber-800 to-amber-900 shadow-inner';
  }, [selectedSquare, validMoves, lastMove, suggestedMoves, dragOver, isValidMove, isSuggestedMove, isLastMoveSquare]);

  const renderSquare = (row: number, col: number) => {
    const displayRow = isRotated ? 7 - row : row;
    const displayCol = isRotated ? 7 - col : col;
    const position = { row: displayRow, col: displayCol };
    const piece = board[displayRow][displayCol];
    const isSelected = selectedSquare && selectedSquare.row === displayRow && selectedSquare.col === displayCol;

    return (
      <div
        key={`${displayRow}-${displayCol}`}
        className={`
          relative w-16 h-16 flex items-center justify-center cursor-pointer
          transition-all duration-200 border border-amber-700/20
          ${getSquareColor(row, col)}
          hover:brightness-110
        `}
        onClick={() => onSquareClick(position)}
        onDragOver={(e) => handleDragOver(e, position)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, position)}
      >
        {/* Coordinate labels */}
        {row === 7 && (
          <div className="absolute bottom-1 right-1 text-xs font-semibold text-amber-900/60">
            {String.fromCharCode(97 + col)}
          </div>
        )}
        {col === 0 && (
          <div className="absolute top-1 left-1 text-xs font-semibold text-amber-900/60">
            {8 - row}
          </div>
        )}
        
        {/* Suggested move indicator */}
        {isSuggestedMove(position) && (
          <div className="absolute inset-0 border-4 border-blue-400 rounded-md animate-pulse">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-6 h-6 bg-blue-500 rounded-full animate-ping opacity-75" />
              <div className="absolute inset-0 w-6 h-6 bg-blue-600 rounded-full" />
            </div>
          </div>
        )}
        
        {/* Valid move indicator */}
        {isValidMove(position) && !piece && !isSuggestedMove(position) && (
          <div className="w-4 h-4 rounded-full bg-green-500/60 shadow-lg animate-pulse" />
        )}
        
        {/* Piece */}
        {piece && (
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, piece, position)}
            className="flex items-center justify-center w-full h-full"
          >
            <ChessPiece 
              piece={piece} 
              isSelected={isSelected}
              isDragging={draggedPiece?.from.row === position.row && draggedPiece?.from.col === position.col}
            />
          </div>
        )}
        
        {/* Capture indicator */}
        {isValidMove(position) && piece && !isSuggestedMove(position) && (
          <div className="absolute inset-0 border-4 border-red-500/60 rounded-md animate-pulse" />
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="p-4 bg-gradient-to-br from-amber-900 to-amber-950 rounded-2xl shadow-2xl border-4 border-amber-700">
        <div className="grid grid-cols-8 gap-0 rounded-lg overflow-hidden shadow-inner bg-amber-800/20">
          {Array.from({ length: 8 }, (_, row) =>
            Array.from({ length: 8 }, (_, col) => renderSquare(row, col))
          )}
        </div>
      </div>
      
      {/* Board decoration */}
      <div className="absolute -top-2 -left-2 -right-2 -bottom-2 bg-gradient-to-br from-amber-800/20 to-amber-900/20 rounded-3xl -z-10" />
      <div className="absolute -top-1 -left-1 -right-1 -bottom-1 bg-gradient-to-br from-amber-700/30 to-amber-800/30 rounded-2xl -z-10" />
    </div>
  );
};