"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RefreshCw, Eraser } from "lucide-react";
import { GameContainer } from "@/components/GameContainer";
import { useGameSession } from "@/hooks/useGameSession";
import { playSound, vibrate } from "@/lib/audio";
import { tts } from "@/lib/tts";

// Predefined 4x4 solutions
const SOLUTIONS = [
  [1, 2, 3, 4, 3, 4, 1, 2, 2, 1, 4, 3, 4, 3, 2, 1],
  [4, 1, 2, 3, 2, 3, 4, 1, 3, 4, 1, 2, 1, 2, 3, 4],
];

// Provide masks (true = show initial, false = empty)
const MASKS = [
  [
    true,
    false,
    false,
    true,
    false,
    true,
    true,
    false,
    false,
    true,
    true,
    false,
    true,
    false,
    false,
    true,
  ],
  [
    false,
    true,
    true,
    false,
    true,
    false,
    false,
    true,
    true,
    false,
    false,
    true,
    false,
    true,
    true,
    false,
  ],
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

  const { gameState, score, initGame, handleCorrect, handleWrong } = useGameSession({
    gameId: "sudoku",
    winCondition: (_, totalCorrect) => totalCorrect >= 1, // Win per puzzle
  });

  const handleStart = () => {
    initGame();
    generatePuzzle();
    tts.speak("填满一到四，保证每行每列不重复！");
  };

  const generatePuzzle = () => {
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
  };

  const handleCellClick = (index: number) => {
    if (board[index].isInitial || gameState !== "playing") return;
    setSelectedCell(index);
  };

  const handleNumberInput = (num: number | null) => {
    if (selectedCell === null || gameState !== "playing") return;

    const newBoard = [...board];
    newBoard[selectedCell].value = num;
    newBoard[selectedCell].isError = false; // Reset error state on new input

    setBoard(newBoard);
    playSound.pop();

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
      handleWrong();
      vibrate([50, 50]);
    } else {
      handleCorrect();
    }
  };

  return (
    <GameContainer
      title="星球数独"
      gameState={gameState}
      score={score}
      emojiIcon="🧩"
      themeColor="green"
      onStart={handleStart}
      winMessage="逻辑满分！"
      shareText={`我在「脑力星球」的星球数独挑战中完美通关！快来看看你的逻辑推理能力如何！`}
      idleContent={
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">星球数独</h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            填满 1-4，保证每行每列不重复！
            <br />
            这是锻炼逻辑推理能力的绝佳游戏。
          </p>
        </>
      }
      playingContent={
        <div className="w-full flex flex-col items-center">
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
            <Button
              variant="ghost"
              className="text-gray-500 bg-white"
              onClick={() => handleNumberInput(null)}
            >
              <Eraser className="w-5 h-5 mr-1" /> 擦除
            </Button>
            <Button variant="ghost" className="text-gray-500 bg-white" onClick={generatePuzzle}>
              <RefreshCw className="w-5 h-5 mr-1" /> 换一题
            </Button>
          </div>
        </div>
      }
    />
  );
}
