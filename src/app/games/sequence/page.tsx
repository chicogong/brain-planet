"use client";

import { useState, useRef } from "react";
import { motion, Reorder } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GameContainer } from "@/components/GameContainer";
import { useGameSession } from "@/hooks/useGameSession";
import { playSound, vibrate } from "@/lib/audio";
import { tts } from "@/lib/tts";

interface StorySequence {
  id: string;
  items: { id: string; emoji: string; desc: string }[];
}

const STORIES: StorySequence[] = [
  {
    id: "plant",
    items: [
      { id: "1", emoji: "🌱", desc: "种下种子" },
      { id: "2", emoji: "🌿", desc: "长出叶子" },
      { id: "3", emoji: "🌳", desc: "长成大树" },
      { id: "4", emoji: "🍎", desc: "结出果实" },
    ],
  },
  {
    id: "butterfly",
    items: [
      { id: "1", emoji: "🥚", desc: "虫卵" },
      { id: "2", emoji: "🐛", desc: "毛毛虫" },
      { id: "3", emoji: "🪹", desc: "结成蛹" },
      { id: "4", emoji: "🦋", desc: "变成蝴蝶" },
    ],
  },
  {
    id: "day",
    items: [
      { id: "1", emoji: "🌅", desc: "日出" },
      { id: "2", emoji: "☀️", desc: "正午" },
      { id: "3", emoji: "🌇", desc: "日落" },
      { id: "4", emoji: "🌌", desc: "星空" },
    ],
  },
  {
    id: "chicken",
    items: [
      { id: "1", emoji: "🥚", desc: "鸡蛋" },
      { id: "2", emoji: "🐣", desc: "破壳" },
      { id: "3", emoji: "🐥", desc: "小鸡" },
      { id: "4", emoji: "🐓", desc: "公鸡" },
    ],
  },
];

export default function SequenceGame() {
  const [currentStory, setCurrentStory] = useState<StorySequence | null>(null);
  const [items, setItems] = useState<{ id: string; emoji: string; desc: string }[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const { gameState, score, initGame, handleCorrect, handleWrong } = useGameSession({
    gameId: "sequence",
    winCondition: (_, totalCorrect) => totalCorrect >= 3, // 3 stories to win
  });

  const generateRound = () => {
    // Pick random story
    const available = STORIES.filter((s) => s.id !== currentStory?.id);
    const story = available[Math.floor(Math.random() * available.length)];

    // Shuffle items ensuring they are not already in perfect order
    const shuffled = [...story.items];
    while (JSON.stringify(shuffled) === JSON.stringify(story.items)) {
      shuffled.sort(() => Math.random() - 0.5);
    }

    setCurrentStory(story);
    setItems(shuffled);
    setIsChecking(false);

    tts.speak(`请把它们按时间顺序排好`);
  };

  const handleStart = () => {
    initGame();
    generateRound();
  };

  const checkOrder = () => {
    if (gameState !== "playing" || isChecking || !currentStory) return;

    setIsChecking(true);

    const isCorrect = items.every((item, idx) => item.id === currentStory.items[idx].id);

    if (isCorrect) {
      playSound.cheer();
      handleCorrect();
      setTimeout(() => {
        if (gameState === "playing") generateRound();
      }, 2000);
    } else {
      playSound.error();
      handleWrong();
      vibrate([50, 50]);
      setTimeout(() => {
        setIsChecking(false);
      }, 1000);
    }
  };

  return (
    <GameContainer
      title="逻辑排序"
      gameState={gameState}
      score={score}
      emojiIcon="⏱️"
      themeColor="orange"
      onStart={handleStart}
      winMessage="逻辑推理大师！"
      shareText="我在「脑力星球」完成了逻辑排序挑战，因果推理全满分！"
      idleContent={
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">逻辑排序</h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            万事万物都有它的发展顺序。
            <br />
            拖动方块，把它们按照时间先后顺序排好！
          </p>
        </>
      }
      playingContent={
        <div className="w-full flex flex-col items-center flex-1 pb-4">
          <div className="w-full max-w-[320px] mt-8 flex flex-col gap-3">
            <Reorder.Group
              axis="y"
              values={items}
              onReorder={(newItems) => {
                if (gameState === "playing" && !isChecking) {
                  setItems(newItems);
                  playSound.pop();
                }
              }}
            >
              {items.map((item, index) => (
                <Reorder.Item
                  key={item.id}
                  value={item}
                  className="w-full bg-white border-2 border-amber-200 rounded-2xl p-4 flex items-center shadow-sm cursor-grab active:cursor-grabbing mb-3"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center mr-4">
                    {index + 1}
                  </div>
                  <div className="text-4xl mr-4">{item.emoji}</div>
                  <div className="text-lg font-bold text-gray-700">{item.desc}</div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center mt-6 w-full max-w-[320px]">
            <Button
              className="w-full h-14 text-xl font-bold rounded-2xl bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/30"
              onClick={checkOrder}
              disabled={isChecking}
            >
              检查顺序
            </Button>
          </div>
        </div>
      }
    />
  );
}
