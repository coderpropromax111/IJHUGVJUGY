import React from 'react';
import { ChessPiece as ChessPieceType } from '../types/chess';

interface ChessPieceProps {
  piece: ChessPieceType;
  isDragging?: boolean;
  isSelected?: boolean;
}

const pieceSymbols: { [key: string]: { white: string; black: string } } = {
  king: { white: '♔', black: '♚' },
  queen: { white: '♕', black: '♛' },
  rook: { white: '♖', black: '♜' },
  bishop: { white: '♗', black: '♝' },
  knight: { white: '♘', black: '♞' },
  pawn: { white: '♙', black: '♟' },
};

export const ChessPiece: React.FC<ChessPieceProps> = ({ piece, isDragging, isSelected }) => {
  const symbol = pieceSymbols[piece.type][piece.color];

  return (
    <div
      className={`
        select-none cursor-pointer transition-all duration-200 text-6xl
        ${isDragging ? 'scale-110 opacity-80 z-50' : ''}
        ${isSelected ? 'scale-105 drop-shadow-2xl' : ''}
        hover:scale-105 hover:drop-shadow-xl
        ${piece.color === 'white' ? 'text-amber-50 drop-shadow-md' : 'text-gray-800 drop-shadow-md'}
      `}
      style={{
        textShadow: piece.color === 'white' 
          ? '2px 2px 4px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.3)' 
          : '2px 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(0,0,0,0.2)',
        filter: isSelected ? 'brightness(1.2)' : '',
      }}
    >
      {symbol}
    </div>
  );
};