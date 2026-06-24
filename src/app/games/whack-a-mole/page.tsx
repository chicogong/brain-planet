"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";
import { GameContainer } from "@/components/GameContainer";
import { useGameSession } from "@/hooks/useGameSession";
import { playSound, vibrate } from "@/lib/audio";
import { tts } from "@/lib/tts";

type EntityType = "none" | "mole" | "bomb";

export default function WhackAMoleGame() {
  const [customScore, setCustomScore] = useState(0);
  const [holes, setHoles] = useState<EntityType[]>(Array(9).fill("none"));

  const unlockBadge = useUserStore((state) => state.unlockBadge);
  const spawnerRef = useRef<NodeJS.Timeout | null>(null);

  const { gameState, timeLeft, initGame } = useGameSession({
    gameId: "whack-a-mole",
    durationSeconds: 30,
    winCondition: () => false, // time-based game
    onWin: () => {
      // Badge logic
      if (customScore >= 500) {
        unlockBadge("whack_100");
      }
    },
  });

  const handleStart = () => {
    initGame();
    setCustomScore(0);
    setHoles(Array(9).fill("none"));
    tts.speak("准备好拼手速了吗？敲击探出头的地鼠，千万别碰到炸弹！");
  };

  useEffect(() => {
    if (gameState === "playing") {
      spawnerRef.current = setInterval(() => {
        setHoles((prev) => {
          const newHoles = [...prev];

          // clear existing
          const activeIndices = newHoles
            .map((h, i) => (h !== "none" ? i : -1))
            .filter((i) => i !== -1);
          if (activeIndices.length > 2) {
            // randomly remove one to keep board clean
            newHoles[activeIndices[Math.floor(Math.random() * activeIndices.length)]] = "none";
          }

          // spawn new
          const emptyIndices = newHoles
            .map((h, i) => (h === "none" ? i : -1))
            .filter((i) => i !== -1);
          if (emptyIndices.length > 0) {
            const spawnIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            // 20% chance bomb, 80% mole
            newHoles[spawnIndex] = Math.random() > 0.8 ? "bomb" : "mole";
          }

          return newHoles;
        });
      }, 700);
    }

    return () => {
      if (spawnerRef.current) clearInterval(spawnerRef.current);
    };
  }, [gameState]);

  const whack = (index: number) => {
    if (gameState !== "playing") return;

    const entity = holes[index];
    if (entity === "none") return;

    if (entity === "mole") {
      setCustomScore((s) => s + 20);
      playSound.pop();
      vibrate(30);
    } else if (entity === "bomb") {
      setCustomScore((s) => Math.max(0, s - 30));
      playSound.error();
      vibrate([100, 100]);
    }

    setHoles((prev) => {
      const newHoles = [...prev];
      newHoles[index] = "none";
      return newHoles;
    });
  };

  return (
    <GameContainer
      title="萌宠打地鼠"
      gameState={gameState}
      score={customScore}
      timeLeft={timeLeft}
      emojiIcon="🐹"
      themeColor="red"
      onStart={handleStart}
      winMessage={customScore >= 500 ? "手速简直无敌了！" : "挑战结束！"}
      shareText={`我刚才在「脑力星球」打地鼠狂揽了 ${customScore} 分！我的手速已经突破天际，你能超过我吗？`}
      idleContent={
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">准备好拼手速了吗？</h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-6 text-center">
            敲击探出头的地鼠 (+20分)
            <br />
            千万别碰到炸弹 (-30分)
            <br />
            时间限制 30 秒，超过 500 分可解锁神秘徽章！
          </p>
        </>
      }
      playingContent={
        <div className="w-full flex justify-center mt-8">
          <div className="grid grid-cols-3 gap-3 bg-green-500/10 p-4 rounded-3xl w-full max-w-[400px]">
            {holes.map((entity, i) => (
              <div
                key={i}
                className="relative w-full aspect-square bg-gray-900/10 rounded-2xl overflow-hidden border-b-4 border-gray-900/20"
              >
                <div className="absolute bottom-0 w-full h-1/3 bg-gray-900/30 rounded-t-full" />
                <AnimatePresence>
                  {entity !== "none" && (
                    <motion.button
                      initial={{ y: "100%", scale: 0.8 }}
                      animate={{ y: "10%", scale: 1 }}
                      exit={{ y: "100%", scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      onClick={() => whack(i)}
                      className="absolute inset-0 flex items-center justify-center text-5xl sm:text-6xl active:scale-90 select-none"
                    >
                      {entity === "mole" ? "🐹" : "💣"}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
