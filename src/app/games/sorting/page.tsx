"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GameContainer } from "@/components/GameContainer";
import { useGameSession } from "@/hooks/useGameSession";
import { playSound, vibrate } from "@/lib/audio";
import { tts } from "@/lib/tts";

type Category = "水果" | "交通工具" | "动物" | "衣服";

interface Item {
  id: string;
  emoji: string;
  category: Category;
}

const ALL_ITEMS: Item[] = [
  { id: "1", emoji: "🍎", category: "水果" },
  { id: "2", emoji: "🍌", category: "水果" },
  { id: "3", emoji: "🍉", category: "水果" },
  { id: "4", emoji: "葡萄", category: "水果" }, // text or emoji, let's use emoji
  { id: "5", emoji: "🍇", category: "水果" },
  { id: "6", emoji: "🚗", category: "交通工具" },
  { id: "7", emoji: "✈️", category: "交通工具" },
  { id: "8", emoji: "🚲", category: "交通工具" },
  { id: "9", emoji: "🚀", category: "交通工具" },
  { id: "10", emoji: "🐶", category: "动物" },
  { id: "11", emoji: "🐱", category: "动物" },
  { id: "12", emoji: "🐰", category: "动物" },
  { id: "13", emoji: "🐘", category: "动物" },
  { id: "14", emoji: "👕", category: "衣服" },
  { id: "15", emoji: "👗", category: "衣服" },
  { id: "16", emoji: "👟", category: "衣服" },
  { id: "17", emoji: "🧢", category: "衣服" },
];

export default function SortingGame() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const { gameState, score, initGame, handleCorrect, handleWrong } = useGameSession({
    gameId: "sorting",
    winCondition: (_, totalCorrect) => totalCorrect >= 4, // 4 items per round
  });

  const generateRound = () => {
    // Pick 2 random categories
    const allCats: Category[] = ["水果", "交通工具", "动物", "衣服"];
    const shuffledCats = [...allCats].sort(() => Math.random() - 0.5);
    const selectedCats = shuffledCats.slice(0, 2);

    // Pick 4 items total from these 2 categories
    const availableItems = ALL_ITEMS.filter((i) => selectedCats.includes(i.category));
    const roundItems = [...availableItems].sort(() => Math.random() - 0.5).slice(0, 4);

    setCategories(selectedCats);
    setItems(roundItems);
    setCurrentItemIndex(0);

    tts.speak(`请把物品分到对应的筐里吧`);
  };

  const handleStart = () => {
    initGame();
    generateRound();
  };

  const handleDragEnd = (event: any, info: any) => {
    if (gameState !== "playing") return;

    // Check drop zone based on screen X coordinate
    // Center is 0 because we'll measure against window width
    const screenWidth = window.innerWidth;
    const isLeft = info.point.x < screenWidth / 2;

    const currentItem = items[currentItemIndex];
    const targetCategory = isLeft ? categories[0] : categories[1];

    if (currentItem.category === targetCategory) {
      // Correct!
      playSound.pop();
      handleCorrect();

      if (currentItemIndex < items.length - 1) {
        setCurrentItemIndex((prev) => prev + 1);
      } else {
        // Round won (handled by useGameSession internally based on totalCorrect)
        setTimeout(() => {
          if (gameState === "playing") {
            // Only generate if not already won
            generateRound();
          }
        }, 1500);
      }
    } else {
      // Wrong!
      playSound.error();
      handleWrong();
      vibrate([50, 50]);
    }
  };

  const handleBinClick = (categoryIndex: number) => {
    if (gameState !== "playing") return;

    const currentItem = items[currentItemIndex];
    const targetCategory = categories[categoryIndex];

    if (currentItem.category === targetCategory) {
      playSound.pop();
      handleCorrect();
      if (currentItemIndex < items.length - 1) {
        setCurrentItemIndex((prev) => prev + 1);
      } else {
        setTimeout(() => {
          if (gameState === "playing") generateRound();
        }, 1500);
      }
    } else {
      playSound.error();
      handleWrong();
      vibrate([50, 50]);
    }
  };

  return (
    <GameContainer
      title="分类小达人"
      gameState={gameState}
      score={score}
      emojiIcon="🍎"
      themeColor="orange"
      onStart={handleStart}
      winMessage="分类大师！"
      shareText="我在「脑力星球」的分类小达人中拿到了满分，快来挑战你的逻辑归纳能力！"
      idleContent={
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">分类小达人</h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            你能帮乱跑的物品找到它们自己的家吗？
            <br />
            拖拽或点击，把它们放进正确的分类筐！
          </p>
        </>
      }
      playingContent={
        <div className="w-full flex flex-col items-center flex-1 pb-10" ref={containerRef}>
          {/* Active Item to Sort */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] relative w-full">
            <AnimatePresence mode="wait">
              {items[currentItemIndex] && (
                <motion.div
                  key={items[currentItemIndex].id}
                  initial={{ scale: 0, y: -50 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  drag
                  dragConstraints={containerRef}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  whileDrag={{ scale: 1.2, zIndex: 50 }}
                  className="text-8xl cursor-grab active:cursor-grabbing drop-shadow-xl z-10 touch-none"
                >
                  {items[currentItemIndex].emoji}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="absolute bottom-4 text-gray-400 text-sm font-medium animate-pulse">
              向下拖拽或点击下方筐子
            </div>
          </div>

          {/* Target Bins */}
          <div className="flex w-full justify-between gap-4 px-2 max-w-[320px]">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleBinClick(idx)}
                className="flex-1 bg-white/60 backdrop-blur-md border-4 border-dashed border-orange-300 rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50 transition-colors shadow-sm"
              >
                <div className="text-3xl mb-2">
                  {cat === "水果" ? "🧺" : cat === "交通工具" ? "🛣️" : cat === "动物" ? "🐾" : "👗"}
                </div>
                <h3 className="font-black text-orange-700 text-lg">{cat}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      }
    />
  );
}
