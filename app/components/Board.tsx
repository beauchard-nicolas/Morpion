import React from 'react';
import Square from './Square';

interface BoardProps {
  squares: Array<{ value: string | null, timestamp: number | null }>;
  onClick: (i: number) => void;
  nextToErase: number | null;
  winningLine: number[] | null;
}

const Board: React.FC<BoardProps> = ({ squares, onClick, nextToErase, winningLine }) => {
  const renderSquare = (i: number) => {
    return (
      <Square 
        value={squares[i].value} 
        onClick={() => onClick(i)} 
        isNextToErase={nextToErase === i}
        isWinningSquare={winningLine?.includes(i)}
      />
    );
  };

  return (
    <div className="board">
      <div className="grid grid-cols-3 gap-2">
        {[...Array(9)].map((_, i) => (
          <div key={i}>{renderSquare(i)}</div>
        ))}
      </div>
    </div>
  );
};

export default Board;