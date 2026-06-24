"use client";

import { useState, useEffect } from "react";
import { GameContainer } from "@/components/GameContainer";
import { useGameSession } from "@/hooks/useGameSession";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "@/lib/audio";

type Emotion = "happy" | "sad" | "angry" | "scared" | "excited";

interface Scenario {
  id: number;
  text: string;
  icon: string;
  correct: Emotion;
  options: { emoji: string; value: Emotion }[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    text: "小怪兽最爱的冰淇淋掉在地上了...",
    icon: "🍦",
    correct: "sad",
    options: [
      { emoji: "😄", value: "happy" },
      { emoji: "😢", value: "sad" },
      { emoji: "😡", value: "angry" },
    ],
  },
  {
    id: 2,
    text: "今天过生日，小怪兽收到了一份超级大的礼物！",
    icon: "🎁",
    correct: "happy",
    options: [
      { emoji: "😨", value: "scared" },
      { emoji: "😡", value: "angry" },
      { emoji: "😄", value: "happy" },
    ],
  },
  {
    id: 3,
    text: "别的小朋友未经允许，抢走了小怪兽的玩具。",
    icon: "🧸",
    correct: "angry",
    options: [
      { emoji: "😡", value: "angry" },
      { emoji: "😢", value: "sad" },
      { emoji: "🤩", value: "excited" },
    ],
  },
  {
    id: 4,
    text: "晚上停电了，小怪兽一个人在黑漆漆的房间里。",
    icon: "🌑",
    correct: "scared",
    options: [
      { emoji: "😄", value: "happy" },
      { emoji: "😨", value: "scared" },
      { emoji: "😡", value: "angry" },
    ],
  },
  {
    id: 5,
    text: "明天爸爸妈妈要带小怪兽去游乐园玩整整一天！",
    icon: "🎢",
    correct: "excited",
    options: [
      { emoji: "😢", value: "sad" },
      { emoji: "🤩", value: "excited" },
      { emoji: "😨", value: "scared" },
    ],
  },
];

export default function EmotionGame() {
  const session = useGameSession({
    gameId: "emotion-match",
    winCondition: (score) => score >= 50, // 5 wins
  });

  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [feedback, setFeedback] = useState<"none" | "correct" | "wrong">("none");

  const startRound = () => {
    // Pick a random scenario different from the current one
    let nextScenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    while (currentScenario && nextScenario.id === currentScenario.id) {
      nextScenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    }

    // Shuffle options
    const shuffledOptions = [...nextScenario.options].sort(() => Math.random() - 0.5);
    setCurrentScenario({ ...nextScenario, options: shuffledOptions });
    setFeedback("none");
  };

  useEffect(() => {
    if (session.gameState === "playing" && !currentScenario) {
      startRound();
    }
  }, [session.gameState, currentScenario]);

  const handleOptionClick = (value: Emotion) => {
    if (feedback !== "none" || !currentScenario) return;

    if (value === currentScenario.correct) {
      setFeedback("correct");
      playSound.pop();
      session.handleCorrect();
      setTimeout(() => {
        if (session.gameState === "playing") {
          startRound();
        }
      }, 1500);
    } else {
      setFeedback("wrong");
      playSound.error();
      session.handleWrong();
      setTimeout(() => {
        setFeedback("none");
      }, 1000);
    }
  };

  return (
    <GameContainer
      title="情绪小怪兽"
      gameState={session.gameState}
      score={session.score}
      emojiIcon="💖"
      themeColor="rose"
      onStart={() => {
        setCurrentScenario(null);
        setFeedback("none");
        session.initGame();
      }}
      idleContent={
        <div className="text-gray-600 mb-8 max-w-sm">
          <p className="font-bold text-lg text-rose-600 mb-2">玩法说明：</p>
          <ul className="text-left list-disc pl-5 space-y-2">
            <li>读一读小怪兽遇到的事情。</li>
            <li>想一想，小怪兽现在是什么心情呢？</li>
            <li>选出正确的表情符号，帮助小怪兽表达情绪！</li>
          </ul>
        </div>
      }
      playingContent={
        <div className="flex flex-col items-center justify-center h-full pt-8 px-4 w-full max-w-xl mx-auto">
          <AnimatePresence mode="wait">
            {currentScenario && (
              <motion.div
                key={currentScenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                {/* Scenario Card */}
                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-rose-100 border-2 border-rose-50 text-center mb-8 relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 text-8xl opacity-10 blur-sm">
                    {currentScenario.icon}
                  </div>

                  <div className="text-6xl mb-6 relative z-10">{currentScenario.icon}</div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-800 leading-relaxed relative z-10">
                    {currentScenario.text}
                  </h3>

                  <div className="mt-6 text-rose-500 font-bold bg-rose-50 inline-block px-4 py-1.5 rounded-full text-sm">
                    你觉得它现在的心情是？
                  </div>
                </div>

                {/* Feedback */}
                <div className="h-8 mb-4 text-center font-bold text-lg">
                  {feedback === "correct" && (
                    <span className="text-green-500">答对了！就是这个心情！🎉</span>
                  )}
                  {feedback === "wrong" && (
                    <span className="text-red-500">好像不太对哦，再想想？🤔</span>
                  )}
                </div>

                {/* Options */}
                <div className="flex justify-center gap-4 sm:gap-8">
                  {currentScenario.options.map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOptionClick(opt.value)}
                      className={`w-20 h-20 sm:w-28 sm:h-28 text-5xl sm:text-6xl bg-white rounded-2xl shadow-md border-b-4 hover:shadow-lg transition-all ${
                        feedback === "wrong" ? "opacity-50" : "border-gray-200"
                      } flex items-center justify-center`}
                    >
                      {opt.emoji}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      }
    />
  );
}
