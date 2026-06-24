"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameContainer } from "@/components/GameContainer";
import { useGameSession } from "@/hooks/useGameSession";
import { vibrate, playSound } from "@/lib/audio";
import { tts } from "@/lib/tts";

export default function SchulteGridGame() {
  const [gridSize, setGridSize] = useState<number>(5); // Default 5x5 (1-25)
  const [numbers, setNumbers] = useState<number[]>([]);
  const [expectedNext, setExpectedNext] = useState<number>(1);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [errorIndex, setErrorIndex] = useState<number | null>(null);

  const { gameState, initGame, handleCorrect, setGameState } = useGameSession({
    gameId: "schulte",
    winCondition: () => false, // We'll trigger win manually based on expectedNext
  });

  const generateGrid = useCallback(() => {
    const maxNumber = gridSize * gridSize;
    const nums = Array.from({ length: maxNumber }, (_, i) => i + 1);
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    setNumbers(nums);
    setExpectedNext(1);
    setStartTime(null);
    setElapsedTime(0);
    setErrorIndex(null);
  }, [gridSize]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === "playing" && startTime) {
      timer = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    }
    return () => clearInterval(timer);
  }, [gameState, startTime]);

  const handleStart = () => {
    initGame();
    generateGrid();
    tts.speak(`按顺序点击一到${gridSize * gridSize}`);
  };

  const handleNumberClick = (num: number, index: number) => {
    if (gameState !== "playing") return;

    if (!startTime) {
      setStartTime(Date.now());
    }

    if (num === expectedNext) {
      if (num === gridSize * gridSize) {
        // Win condition
        handleCorrect(); // Just to record stats
        setGameState("won");
      } else {
        setExpectedNext(num + 1);
        playSound.pop();
        vibrate(30);
      }
    } else {
      // Error feedback
      setErrorIndex(index);
      playSound.error();
      vibrate([50, 50, 50]);
      setTimeout(() => setErrorIndex(null), 300);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = ms / 1000;
    return totalSeconds.toFixed(1);
  };

  return (
    <GameContainer
      title="舒尔特方格"
      gameState={gameState}
      emojiIcon="👁️"
      themeColor="indigo"
      onStart={handleStart}
      winMessage="太棒啦！"
      shareText={`我在「脑力星球」的舒尔特方格（${gridSize}x${gridSize}）挑战中，只用了 ${formatTime(elapsedTime)} 秒通关！快来看看你的专注力如何！`}
      wonContent={
        <p className="text-gray-500 font-medium mb-6 text-center">
          你的专注力超过了 95% 的小朋友！
          <br />
          最终用时: <span className="text-indigo-600 font-bold">{formatTime(elapsedTime)} 秒</span>
        </p>
      }
      idleContent={
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">舒尔特方格</h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            按顺序点击 1 到 {gridSize * gridSize}。<br />
            这是提升专注力和视觉广度的最经典训练！
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setGridSize(3)}
              className={`px-4 py-2 rounded-full font-bold transition-all ${gridSize === 3 ? "bg-indigo-500 text-white shadow-md" : "bg-indigo-100 text-indigo-700"}`}
            >
              3x3
            </button>
            <button
              onClick={() => setGridSize(4)}
              className={`px-4 py-2 rounded-full font-bold transition-all ${gridSize === 4 ? "bg-indigo-500 text-white shadow-md" : "bg-indigo-100 text-indigo-700"}`}
            >
              4x4
            </button>
            <button
              onClick={() => setGridSize(5)}
              className={`px-4 py-2 rounded-full font-bold transition-all ${gridSize === 5 ? "bg-indigo-500 text-white shadow-md" : "bg-indigo-100 text-indigo-700"}`}
            >
              5x5
            </button>
          </div>
        </>
      }
      playingContent={
        <div className="w-full flex flex-col items-center">
          <div className="mt-4 flex justify-center items-center gap-6 mb-8 w-full px-4">
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 text-center flex-1 max-w-[150px]">
              <span className="block text-sm text-gray-400 font-bold mb-1">下一个数字</span>
              <span className="text-3xl font-black text-indigo-600">{expectedNext}</span>
            </div>
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 text-center flex-1 max-w-[150px]">
              <span className="block text-sm text-gray-400 font-bold mb-1">用时</span>
              <span className="text-3xl font-black text-gray-700">{formatTime(elapsedTime)}s</span>
            </div>
          </div>

          <div
            className="grid gap-2 w-full max-w-[400px] aspect-square mx-auto"
            style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
          >
            <AnimatePresence mode="popLayout">
              {numbers.map((num, i) => {
                const isFound = num < expectedNext;
                const isError = errorIndex === i;

                return (
                  <motion.button
                    key={num}
                    layout
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: isError ? [-5, 5, -5, 5, 0] : 0,
                    }}
                    transition={{
                      duration: isError ? 0.4 : 0.2,
                      x: { type: "spring", stiffness: 300, damping: 10 },
                    }}
                    onClick={() => handleNumberClick(num, i)}
                    className={`
                      w-full h-full rounded-xl flex items-center justify-center font-black text-2xl sm:text-3xl transition-all
                      ${
                        isFound
                          ? "bg-indigo-50 text-indigo-300 shadow-inner"
                          : isError
                            ? "bg-red-500 text-white shadow-lg"
                            : "bg-white text-gray-800 shadow-md hover:shadow-lg border-2 border-transparent active:border-indigo-400 active:scale-95"
                      }
                    `}
                    disabled={isFound}
                  >
                    {num}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      }
    />
  );
}
