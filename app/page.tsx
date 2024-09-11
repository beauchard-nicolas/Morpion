'use client';

import React, { useState, useEffect } from 'react';
import Board from './components/Board';
import { calculateWinner } from './lib/gameLogic';
import { CrownIcon } from 'lucide-react';
import Confetti from './components/Confetti';

type GameMode = 'classic' | 'ai' | 'erasing';

type SquareState = {
  value: string | null;
  timestamp: number | null;
};

export default function Home() {
  const [history, setHistory] = useState<SquareState[][]>([Array(9).fill({ value: null, timestamp: null })]);
  const [stepNumber, setStepNumber] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [leaderPlayer, setLeaderPlayer] = useState<'X' | 'O' | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [nextToErase, setNextToErase] = useState<number | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [winner, setWinner] = useState<'X' | 'O' | null>(null);

  useEffect(() => {
    const current = history[stepNumber];
    const winner = calculateWinner(current);
    
    console.log("État actuel:", { gameMode, xIsNext, stepNumber, boardState: current });
    console.log("Gagnant:", winner);
    console.log("Jeu terminé:", gameOver);

    if (winner && !gameOver) {
      setGameOver(true);
      // Ne mettez pas à jour le score ici, car c'est déjà fait dans handleClick
    } else if (current.every(square => square.value !== null) && !gameOver) {
      setGameOver(true);
    } else if (gameMode === 'ai' && !xIsNext && !gameOver) {
      console.log("C'est le tour de l'IA");
      setTimeout(() => makeAIMove(current), 500);
    }
  }, [history, stepNumber, gameMode, xIsNext, gameOver]);

  useEffect(() => {
    if (history.length > 0) {
      updateNextToErase(history[stepNumber]);
    }
  }, [gameMode, history, stepNumber]);

  const updateLeaderPlayer = (newScores: { X: number, O: number }) => {
    if (newScores.X > newScores.O) {
      setLeaderPlayer('X');
    } else if (newScores.O > newScores.X) {
      setLeaderPlayer('O');
    } else {
      setLeaderPlayer(null);
    }
  };

  const eraseOldestMove = (squares: SquareState[], currentPlayer: 'X' | 'O') => {
    console.log("Tentative d'effacement du plus ancien coup pour", currentPlayer);
    let oldestMoveIndex = -1;
    let oldestTimestamp = Infinity;

    squares.forEach((square, index) => {
      if (square.value === currentPlayer && square.timestamp !== null && square.timestamp < oldestTimestamp) {
        oldestMoveIndex = index;
        oldestTimestamp = square.timestamp;
      }
    });

    if (oldestMoveIndex !== -1) {
      console.log("Effacement du coup à l'index:", oldestMoveIndex);
      const newSquares = [...squares];
      newSquares[oldestMoveIndex] = { value: null, timestamp: null };
      return newSquares;
    }
    console.log("Aucun coup à effacer");
    return squares;
  };

  const findOldestMove = (squares: SquareState[], currentPlayer: 'X' | 'O') => {
    let oldestMoveIndex = -1;
    let oldestTimestamp = Infinity;

    squares.forEach((square, index) => {
      if (square.value === currentPlayer && square.timestamp !== null && square.timestamp < oldestTimestamp) {
        oldestMoveIndex = index;
        oldestTimestamp = square.timestamp;
      }
    });

    return oldestMoveIndex;
  };

  const updateNextToErase = (squares: SquareState[]) => {
    const currentPlayer = xIsNext ? 'X' : 'O';
    const playerMoveCount = squares.filter(square => square.value === currentPlayer).length;

    if (gameMode === 'erasing' && playerMoveCount >= 3) {
      const oldestMoveIndex = findOldestMove(squares, currentPlayer);
      setNextToErase(oldestMoveIndex);
    } else {
      setNextToErase(null);
    }
  };

  const handleClick = (i: number) => {
    if (gameOver) {
      return;
    }

    const newHistory = history.slice(0, stepNumber + 1);
    const current = [...newHistory[newHistory.length - 1]];
    if (current[i].value) {
      return;
    }

    const currentPlayer = xIsNext ? 'X' : 'O';
    let updatedSquares = [...current];
    updatedSquares[i] = { value: currentPlayer, timestamp: Date.now() };

    if (gameMode === 'erasing' && nextToErase !== null) {
      updatedSquares[nextToErase] = { value: null, timestamp: null };
    }

    const result = calculateWinner(updatedSquares);
    if (result) {
      setGameOver(true);
      setWinner(result.winner as 'X' | 'O');
      setScores(prevScores => ({
        ...prevScores,
        [result.winner]: prevScores[result.winner as 'X' | 'O'] + 1
      }));
      setWinningLine(result.line);
    } else if (updatedSquares.every(square => square.value !== null)) {
      setGameOver(true);
    }

    setHistory([...newHistory, updatedSquares]);
    setStepNumber(newHistory.length);
    setXIsNext(!xIsNext);

    // Mettre à jour nextToErase pour le prochain tour
    updateNextToErase(updatedSquares);
  };

  const makeAIMove = (current: SquareState[]) => {
    console.log("L'IA fait son mouvement");
    const availableMoves = current.reduce((acc, square, index) => {
      if (!square.value) acc.push(index);
      return acc;
    }, [] as number[]);

    if (availableMoves.length > 0) {
      const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
      console.log("L'IA choisit la case:", randomMove);
      // Utiliser setTimeout pour s'assurer que l'état est mis à jour
      setTimeout(() => handleClick(randomMove), 0);
    } else {
      console.log("Aucun mouvement disponible pour l'IA");
    }
  };

  const resetGame = () => {
    setHistory([Array(9).fill({ value: null, timestamp: null })]);
    setStepNumber(0);
    setXIsNext(true);
    setGameOver(false);
    setNextToErase(null);
    setWinningLine(null);
    setWinner(null);
    // Ne réinitialisez pas les scores ici
  };

  const startNewGame = (mode: GameMode) => {
    console.log("Démarrage d'un nouveau jeu en mode:", mode);
    setGameMode(mode);
    resetGame();
    // Ne réinitialisez pas les scores ici
  };

  const current = history[stepNumber];
  const winnerResult = calculateWinner(current);
  console.log("Winner:", winnerResult);

  let status;
  if (winnerResult) {
    status = `Le gagnant est ${winnerResult.winner}`;
  } else if (gameOver) {
    status = "Match nul !";
  } else {
    status = `Au tour de ${xIsNext ? 'X' : 'O'}`;
  }

  return (
    <main className="min-h-screen p-4 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center relative overflow-hidden">
      <Confetti winner={winner} />
      <div className="bg-white rounded-lg shadow-2xl p-4 relative max-w-[570px] w-full overflow-hidden">
        <h1 className="text-2xl font-bold mb-4 text-center">Jeu de Morpion</h1>
        <div className="flex flex-row items-start gap-2">
          <div className="game-board flex-shrink-0 font-fredoka">
            <Board 
              squares={history[stepNumber]} 
              onClick={(i) => handleClick(i)} 
              nextToErase={nextToErase}
              winningLine={winningLine}
            />
          </div>
          <div className="game-info w-64 flex-shrink-0">
            <div className="flex justify-between my-5 space-x-2">
              <button 
                onClick={() => startNewGame('classic')} 
                className={`px-2 py-1 text-xs font-semibold rounded ${gameMode === 'classic' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Classique
              </button>
              <button 
                onClick={() => startNewGame('ai')} 
                className={`px-2 py-1 text-xs font-semibold rounded ${gameMode === 'ai' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Contre l'IA
              </button>
              <button 
                onClick={() => startNewGame('erasing')} 
                className={`px-2 py-1 text-xs font-semibold rounded ${gameMode === 'erasing' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Effacement
              </button>
            </div>
            <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2 my-5">
              <div className="text-sm font-bold text-gray-500">{status}</div>
              <div className={`flex justify-center items-center h-8 w-8 rounded-lg ${xIsNext ? 'bg-blue-100' : 'bg-red-100'}`}>
                <span className={`font-fredoka text-2xl font-bold ${xIsNext ? 'text-blue-600' : 'text-red-600'}`}>
                  {xIsNext ? 'X' : 'O'}
                </span>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-2 my-5 font-fredoka">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-xl font-bold text-blue-400 mr-1">X</span>
                  <span className="text-lg text-white">{scores.X}</span>
                  {leaderPlayer === 'X' && <CrownIcon className="text-yellow-400 ml-1" size={16} />}
                </div>
                <div className="flex items-center">
                  <span className="text-lg text-white">{scores.O}</span>
                  <span className="text-xl font-bold text-red-400 ml-1">O</span>
                  {leaderPlayer === 'O' && <CrownIcon className="text-yellow-400 ml-1" size={16} />}
                </div>
              </div>
            </div>
            <button 
              className={`w-full font-bold mb-5 py-2 px-4 rounded-lg text-sm transition duration-300 ease-in-out transform hover:scale-105 ${
                gameOver 
                  ? 'bg-green-500 hover:bg-green-700 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={resetGame}
              disabled={!gameOver}
            >
              {gameOver ? 'Nouvelle partie' : 'Partie en cours'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}