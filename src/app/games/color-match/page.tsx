"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { tts } from "@/lib/tts";
import { GameContainer } from "@/components/GameContainer";
import { useGameSession } from "@/hooks/useGameSession";
import { vibrate } from "@/lib/audio";

const GAME_DURATION = 30; // 30 seconds for kids
const MAX_GRID = 8; // Max grid size 8x8

export default function ColorMatchGame() {
  const [level, setLevel] = useState(1);
  const [baseColor, setBaseColor] = useState("");
  const [diffColor, setDiffColor] = useState("");
  const [diffIndex, setDiffIndex] = useState(0);
  const [gridSize, setGridSize] = useState(2);

  const { gameState, score, timeLeft, initGame, handleCorrect, handleWrong } = useGameSession({
    gameId: "color-match",
    durationSeconds: GAME_DURATION,
    winCondition: () => false, // Time-based, so never win by score
  });

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

  const handleStart = () => {
    initGame();
    setLevel(1);
    generateColors(1);
    tts.speak("找出颜色不一样的那块方块！看你能找对多少个。");
  };

  const handleBlockClick = (index: number) => {
    if (gameState !== "playing") return;

    if (index === diffIndex) {
      handleCorrect();
      const newLevel = level + 1;
      setLevel(newLevel);
      generateColors(newLevel);
    } else {
      handleWrong();
      vibrate([50, 50]);
    }
  };

  return (
    <GameContainer
      title="色彩发现者"
      gameState={gameState}
      score={score}
      timeLeft={timeLeft}
      emojiIcon="🎨"
      themeColor="blue"
      onStart={handleStart}
      winMessage="时间到！"
      shareText={`我在「脑力星球」的色彩发现者中拿到了 ${score} 分，找出了 ${level - 1} 个色块，你能比我更眼尖吗？`}
      idleContent={
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">色彩发现者</h2>
          <p className="text-gray-500 max-w-sm mx-auto">
            找出颜色不一样的那块方块！
            <br />
            随着等级提升，颜色差异会越来越小，非常考验你的视觉敏锐度哦。
          </p>
        </>
      }
      playingContent={
        <div className="w-full flex flex-col items-center">
          <div className="text-center mb-6">
            <span className="text-gray-500 font-bold bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100">
              第 {level} 关
            </span>
          </div>

          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md aspect-square mx-auto"
          >
            <div
              className="w-full h-full grid gap-2 sm:gap-3"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
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
        </div>
      }
    />
  );
}
