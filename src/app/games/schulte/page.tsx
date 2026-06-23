"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Trophy, Share2 } from "lucide-react";
import confetti from "canvas-confetti";
import { playSound, vibrate } from "@/lib/audio";

export default function SchulteGridGame() {
  const [gridSize, setGridSize] = useState<number>(5); // Default 5x5 (1-25)
  const [numbers, setNumbers] = useState<number[]>([]);
  const [expectedNext, setExpectedNext] = useState<number>(1);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "won">("idle");
  const [errorIndex, setErrorIndex] = useState<number | null>(null);
  
  const addPoints = useUserStore((state) => state.addPoints);

  const initGame = useCallback(() => {
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
    setGameState("idle");
    setErrorIndex(null);
  }, [gridSize]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === "playing" && startTime) {
      timer = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    }
    return () => clearInterval(timer);
  }, [gameState, startTime]);

  const handleNumberClick = (num: number, index: number) => {
    if (gameState === "won") return;
    
    if (gameState === "idle") {
      setGameState("playing");
      setStartTime(Date.now());
    }

    if (num === expectedNext) {
      if (num === gridSize * gridSize) {
        // Win condition
        setGameState("won");
        addPoints(50);
        playSound.cheer();
        vibrate([100, 50, 100, 50, 200]);
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
        });
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
    <div className="flex flex-col h-full max-w-lg mx-auto w-full px-4">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setGridSize(3)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${gridSize === 3 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}
          >
            3x3
          </button>
          <button 
            onClick={() => setGridSize(4)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${gridSize === 4 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}
          >
            4x4
          </button>
          <button 
            onClick={() => setGridSize(5)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${gridSize === 5 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}
          >
            5x5
          </button>
        </div>
        <button onClick={initGame} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-gray-800 mb-2">舒尔特方格</h1>
        <p className="text-gray-500 font-medium">按顺序点击 1 到 {gridSize * gridSize}</p>
        
        <div className="mt-4 flex justify-center items-center gap-6">
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
            <span className="block text-sm text-gray-400 font-bold mb-1">下一个数字</span>
            <span className="text-3xl font-black text-indigo-600">
              {gameState === "won" ? "🎉" : expectedNext}
            </span>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 min-w-[120px]">
            <span className="block text-sm text-gray-400 font-bold mb-1">用时</span>
            <span className="text-3xl font-black text-gray-700">
              {formatTime(elapsedTime)}s
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center mb-12">
        <div 
          className="grid gap-2 w-full max-w-[400px] aspect-square"
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
                    x: isError ? [-5, 5, -5, 5, 0] : 0 
                  }}
                  transition={{ 
                    duration: isError ? 0.4 : 0.2,
                    x: { type: "spring", stiffness: 300, damping: 10 }
                  }}
                  onClick={() => handleNumberClick(num, i)}
                  className={`
                    w-full h-full rounded-xl flex items-center justify-center font-black text-2xl sm:text-3xl transition-all
                    ${isFound 
                      ? 'bg-indigo-50 text-indigo-300 shadow-inner' 
                      : isError 
                        ? 'bg-red-500 text-white shadow-lg' 
                        : 'bg-white text-gray-800 shadow-md hover:shadow-lg border-2 border-transparent active:border-indigo-400 active:scale-95'
                    }
                  `}
                  disabled={isFound || gameState === "won"}
                >
                  {num}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {gameState === "won" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-4 right-4 max-w-sm mx-auto bg-white rounded-3xl p-6 shadow-2xl border border-indigo-100 text-center z-50"
          >
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">太棒啦！</h2>
            <p className="text-gray-500 font-medium mb-6">
              你的专注力超过了 95% 的小朋友！<br/>
              最终用时: <span className="text-indigo-600 font-bold">{formatTime(elapsedTime)} 秒</span>
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={async () => {
                  const text = `我刚才在「脑力星球」的舒尔特方格（${gridSize}x${gridSize}）挑战中，只用了 ${formatTime(elapsedTime)} 秒通关！快来看看你的专注力如何！`;
                  if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
                    try { await navigator.share({ title: '脑力星球 - 战绩分享', text, url: window.location.origin }); } catch(e) {}
                  } else {
                    navigator.clipboard.writeText(text + ' ' + window.location.origin);
                    alert('战绩已复制到剪贴板！');
                  }
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" /> 分享战绩
              </button>
              <button
                onClick={initGame}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-500/30"
              >
                再来一局
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
