"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, ArrowLeft, RefreshCw, Eraser } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

// Predefined 4x4 solutions
const SOLUTIONS = [
  [
    1, 2, 3, 4,
    3, 4, 1, 2,
    2, 1, 4, 3,
    4, 3, 2, 1
  ],
  [
    4, 1, 2, 3,
    2, 3, 4, 1,
    3, 4, 1, 2,
    1, 2, 3, 4
  ]
];

// Provide masks (true = show initial, false = empty)
const MASKS = [
  [
    true, false, false, true,
    false, true, true, false,
    false, true, true, false,
    true, false, false, true
  ],
  [
    false, true, true, false,
    true, false, false, true,
    true, false, false, true,
    false, true, true, false
  ]
];

interface Cell {
  index: number;
  value: number | null;
  isInitial: boolean;
  isError: boolean;
}

export default function SudokuGame() {
  const [board, setBoard] = useState<Cell[]>([]);
  const [solution, setSolution] = useState<number[]>([]);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const addPoints = useUserStore((state) => state.addPoints);

  const initGame = () => {
    const idx = Math.floor(Math.random() * SOLUTIONS.length);
    const sol = SOLUTIONS[idx];
    const mask = MASKS[idx];
    
    // Add some extra random hiding to make it slightly different
    const currentMask = mask.map((m) => m && Math.random() > 0.2);

    const initialBoard = sol.map((val, i) => ({
      index: i,
      value: currentMask[i] ? val : null,
      isInitial: currentMask[i],
      isError: false,
    }));

    setSolution(sol);
    setBoard(initialBoard);
    setSelectedCell(null);
    setGameOver(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCellClick = (index: number) => {
    if (board[index].isInitial || gameOver) return;
    setSelectedCell(index);
  };

  const handleNumberInput = (num: number | null) => {
    if (selectedCell === null || gameOver) return;

    const newBoard = [...board];
    newBoard[selectedCell].value = num;
    newBoard[selectedCell].isError = false; // Reset error state on new input

    // Basic Validation: highlight duplicates in same row/col/block immediately?
    // For kids, let's just let them fill it and check on win
    setBoard(newBoard);

    // Auto check if full
    if (newBoard.every((c) => c.value !== null)) {
      checkWinCondition(newBoard);
    }
  };

  const checkWinCondition = (currentBoard: Cell[]) => {
    let hasError = false;
    const errorBoard = currentBoard.map((c) => {
      if (c.value !== solution[c.index]) {
        hasError = true;
        return { ...c, isError: true };
      }
      return { ...c, isError: false };
    });

    if (hasError) {
      setBoard(errorBoard);
    } else {
      handleWin();
    }
  };

  const handleWin = () => {
    setGameOver(true);
    setScore(score + 15);
    addPoints(15);
    confetti({
      particleCount: 150,
      spread: 80,
      colors: ['#4ade80', '#fbbf24', '#f87171']
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-8">
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
        </Link>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm font-bold text-gray-700">
            <Trophy className="w-5 h-5 text-green-500" />
            {score}
          </div>
        </div>
      </div>

      <Card className="w-full max-w-md p-6 bg-white shadow-xl rounded-3xl border-4 border-green-50 relative overflow-hidden flex flex-col">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-black text-gray-800 flex items-center justify-center gap-2">
            <span className="text-4xl">🧩</span> 星球数独
          </h2>
          <p className="text-sm text-gray-500 mt-2">填满 1-4，保证每行每列不重复！</p>
        </div>

        <AnimatePresence mode="wait">
          {!gameOver ? (
            <motion.div 
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center"
            >
              {/* Sudoku Grid 4x4 */}
              <div className="grid grid-cols-4 gap-1 bg-green-200 p-1.5 rounded-2xl mb-8 w-full max-w-[280px] aspect-square shadow-inner">
                {board.map((cell, i) => {
                  const isRightEdge = i % 4 === 1;
                  const isBottomEdge = Math.floor(i / 4) === 1;
                  
                  return (
                    <div
                      key={i}
                      onClick={() => handleCellClick(i)}
                      className={`
                        flex items-center justify-center text-3xl font-black rounded-lg cursor-pointer select-none transition-all
                        ${cell.isInitial ? "bg-green-50 text-green-800 cursor-default" : "bg-white"}
                        ${selectedCell === i ? "ring-4 ring-green-400 z-10 scale-105" : ""}
                        ${cell.isError ? "bg-red-100 text-red-500 animate-pulse" : "text-gray-700"}
                        ${isRightEdge ? "mr-1" : ""}
                        ${isBottomEdge ? "mb-1" : ""}
                      `}
                    >
                      {cell.value || ""}
                    </div>
                  );
                })}
              </div>

              {/* Number pad */}
              <div className="flex justify-center gap-3 w-full max-w-[280px] mb-4">
                {[1, 2, 3, 4].map((num) => (
                  <Button
                    key={num}
                    variant="outline"
                    className="flex-1 h-14 rounded-xl text-2xl font-bold bg-green-50 hover:bg-green-100 text-green-700 border-green-200 shadow-sm"
                    onClick={() => handleNumberInput(num)}
                  >
                    {num}
                  </Button>
                ))}
              </div>
              
              {/* Actions */}
              <div className="flex justify-between w-full max-w-[280px]">
                <Button variant="ghost" className="text-gray-500" onClick={() => handleNumberInput(null)}>
                  <Eraser className="w-5 h-5 mr-1" /> 擦除
                </Button>
                <Button variant="ghost" className="text-gray-500" onClick={initGame}>
                  <RefreshCw className="w-5 h-5 mr-1" /> 换一题
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="win"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-8"
            >
              <div className="text-7xl mb-2 animate-bounce">🏆</div>
              <h2 className="text-3xl font-black text-green-600">逻辑满分！</h2>
              <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-100 w-full">
                <p className="text-gray-500 mb-2">本次收获</p>
                <p className="text-4xl font-black text-green-600">+15</p>
                <p className="text-sm text-green-600/80 mt-2 font-semibold">星星奖励</p>
              </div>
              <Button onClick={initGame} size="lg" className="w-full rounded-full text-lg h-14 bg-green-500 hover:bg-green-600 shadow-lg">
                下一关
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
