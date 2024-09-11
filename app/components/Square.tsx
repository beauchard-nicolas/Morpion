import React from 'react';

interface SquareProps {
  value: string | null;
  onClick: () => void;
  isNextToErase?: boolean;
  isWinningSquare?: boolean;
}

const Square: React.FC<SquareProps> = ({ value, onClick, isNextToErase, isWinningSquare }) => {
  return (
    <button 
      className={`w-20 h-20 text-4xl font-bold rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none 
        ${isWinningSquare ? 'winning-square' : ''}
        ${
          isNextToErase ? 'bg-orange-200 text-orange-600' :
          value === 'X' ? 'bg-blue-200 text-blue-600' : 
          value === 'O' ? 'bg-red-200 text-red-600' : 
          'bg-gray-100 hover:bg-gray-200'
        }`}
      onClick={onClick}
    >
      {value}
    </button>
  );
};

export default Square;