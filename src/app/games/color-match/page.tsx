"use client";

import { useState, useEffect, useCallback } from "react";
import { useUserStore } from "@/store/useUserStore";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Timer, Trophy, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

const GAME_DURATION = 30; // 30 seconds for kids
const MAX_GRID = 8; // Max grid size 8x8

export default function ColorMatchGame() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  // Game state
  const [baseColor, setBaseColor] = useState("");
  const [diffColor, setDiffColor] = useState("");
  const [diffIndex, setDiffIndex] = useState(0);
  const [gridSize, setGridSize] = useState(2);

  const addPoints = useUserStore((state) => state.addPoints);

  const generateColors = useCallback((currentLevel: number) => {
    // Generate random hue
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 40) + 40; // 40-80%
    const l = Math.floor(Math.random() * 40) + 30; // 30-70%

    // Calculate difficulty (difference in lightness)
    // Level 1: 20% diff, Level 20: 2% diff
    const diff = Math.max(2, 20 - currentLevel * 0.8);
    
    setBaseColor(`hsl(${h}, ${s}%, ${l}%)`);
    setDiffColor(`hsl(${h}, ${s}%, ${l + diff}%)`);
    
    // Determine grid size based on level
    const newGridSize = Math.min(MAX_GRID, Math.floor((currentLevel + 1) / 2) + 1);
    setGridSize(newGridSize);
    
    // Determine diff index
    setDiffIndex(Math.floor(Math.random() * (newGridSize * newGridSize)));
  }, []);

  const startGame = () => {
    setLevel(1);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setIsPlaying(true);
    setGameOver(false);
    generateColors(1);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isPlaying && timeLeft === 0) {
      endGame();
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  const endGame = () => {
    setIsPlaying(false);
    setGameOver(true);
    // Award points based on score (1 point per score)
    if (score > 0) {
      addPoints(score);
      triggerConfetti();
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4A90E2', '#FFD700', '#52C41A']
    });
  };

  const handleBlockClick = (index: number) => {
    if (!isPlaying) return;

    if (index === diffIndex) {
      // Correct!
      const newLevel = level + 1;
      setLevel(newLevel);
      setScore(score + 1);
      generateColors(newLevel);
    } else {
      // Wrong! Time penalty for kids could be frustrating, so just visual feedback
      // In a real app we'd shake the board
    }
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
            <Timer className="w-5 h-5 text-blue-500" />
            <span className={timeLeft <= 5 && isPlaying ? "text-red-500 animate-pulse" : ""}>
              {timeLeft}s
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm font-bold text-gray-700">
            <Trophy className="w-5 h-5 text-yellow-500" />
            {score}
          </div>
        </div>
      </div>

      <Card className="w-full max-w-md p-6 bg-white shadow-xl rounded-3xl border-4 border-blue-50 relative overflow-hidden min-h-[400px] flex flex-col items-center justify-center">
        
        <AnimatePresence mode="wait">
          {!isPlaying && !gameOver && (
            <motion.div 
              key="start"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center space-y-6 z-10"
            >
              <div className="text-6xl mb-4">🎨</div>
              <h2 className="text-2xl font-bold text-gray-800">色彩发现者</h2>
              <p className="text-gray-500">找出颜色不一样的那块方块！</p>
              <Button onClick={startGame} size="lg" className="w-full rounded-full text-lg h-14 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all">
                开始挑战
              </Button>
            </motion.div>
          )}

          {isPlaying && (
            <motion.div 
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full aspect-square"
            >
              <div 
                className="w-full h-full grid gap-2" 
                style={{ 
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`
                }}
              >
                {Array.from({ length: gridSize * gridSize }).map((_, i) => (
                  <motion.div
                    key={`${level}-${i}`}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.01 }}
                    whileHover={{ scale: 0.95 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleBlockClick(i)}
                    className="rounded-xl shadow-sm cursor-pointer"
                    style={{ backgroundColor: i === diffIndex ? diffColor : baseColor }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {gameOver && (
            <motion.div 
              key="end"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6 z-10 w-full"
            >
              <div className="text-6xl mb-2">🏆</div>
              <h2 className="text-3xl font-bold text-gray-800">时间到！</h2>
              
              <div className="bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-100">
                <p className="text-gray-500 mb-1">本次得分</p>
                <p className="text-5xl font-black text-yellow-600">{score}</p>
                <p className="text-sm text-yellow-600/80 mt-2 font-semibold">+ {score} 星星已存入账户</p>
              </div>

              <Button onClick={startGame} size="lg" className="w-full rounded-full text-lg h-14 bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all">
                <RefreshCw className="w-5 h-5 mr-2" />
                再玩一次
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

      </Card>
    </div>
  );
}
