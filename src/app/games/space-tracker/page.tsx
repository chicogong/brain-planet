"use client";

import { useState, useEffect, useRef } from "react";
import { GameContainer } from "@/components/GameContainer";
import { useGameSession } from "@/hooks/useGameSession";
import { motion } from "framer-motion";
import { playSound } from "@/lib/audio";

type Phase = "idle" | "showing" | "shuffling" | "guessing";

export default function SpaceTrackerGame() {
  const session = useGameSession({
    gameId: "space-tracker",
    winCondition: (score) => score >= 30, // 3 wins
  });

  const [phase, setPhase] = useState<Phase>("idle");
  const [positions, setPositions] = useState<number[]>([0, 1, 2]); // Array of cup IDs
  const [targetId, setTargetId] = useState<number>(0);

  const shuffleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startGameRound = () => {
    // Reset positions
    const newPositions = [0, 1, 2];
    setPositions(newPositions);

    // Pick a random cup to be the target
    const randomTarget = Math.floor(Math.random() * 3);
    setTargetId(randomTarget);

    setPhase("showing");

    // After 2 seconds showing, start shuffling
    setTimeout(() => {
      setPhase("shuffling");

      let shufflesLeft = 4 + Math.floor(session.score / 10) * 2; // Difficulty scaling
      const speed = Math.max(250, 600 - Math.floor(session.score / 10) * 50);

      const shuffleStep = () => {
        if (shufflesLeft <= 0) {
          setPhase("guessing");
          return;
        }

        setPositions((prev) => {
          const next = [...prev];
          // Pick two random indices to swap
          const i1 = Math.floor(Math.random() * 3);
          let i2 = Math.floor(Math.random() * 3);
          while (i1 === i2) {
            i2 = Math.floor(Math.random() * 3);
          }
          const temp = next[i1];
          next[i1] = next[i2];
          next[i2] = temp;
          playSound.pop(); // click sound for swap
          return next;
        });

        shufflesLeft--;
        shuffleTimerRef.current = setTimeout(shuffleStep, speed);
      };

      shuffleTimerRef.current = setTimeout(shuffleStep, speed);
    }, 2000);
  };

  useEffect(() => {
    if (session.gameState === "playing" && phase === "idle") {
      startGameRound();
    }
  }, [session.gameState, phase]);

  // Clean up
  useEffect(() => {
    return () => {
      if (shuffleTimerRef.current) clearTimeout(shuffleTimerRef.current);
    };
  }, []);

  const handleCupClick = (cupId: number) => {
    if (phase !== "guessing") return;

    if (cupId === targetId) {
      session.handleCorrect();
      setPhase("idle");
      // Wait a bit before next round if not won
      setTimeout(() => {
        if (session.gameState === "playing") {
          startGameRound();
        }
      }, 1000);
    } else {
      session.handleWrong();
      setPhase("showing"); // Show where it was
      setTimeout(() => {
        setPhase("idle");
        if (session.gameState === "playing") {
          startGameRound();
        }
      }, 2000);
    }
  };

  return (
    <GameContainer
      title="星际追踪"
      gameState={session.gameState}
      score={session.score}
      emojiIcon="🛸"
      themeColor="indigo"
      onStart={() => {
        setPhase("idle");
        if (shuffleTimerRef.current) clearTimeout(shuffleTimerRef.current);
        session.initGame();
      }}
      idleContent={
        <div className="text-gray-600 mb-8 max-w-sm">
          <p className="font-bold text-lg text-indigo-600 mb-2">玩法说明：</p>
          <ul className="text-left list-disc pl-5 space-y-2">
            <li>看准小外星人藏在哪个飞船里。</li>
            <li>飞船会快速移动打乱位置。</li>
            <li>停下后，找出刚才那个外星人的飞船！</li>
          </ul>
        </div>
      }
      playingContent={
        <div className="flex flex-col items-center justify-center h-full pt-10">
          <div className="text-xl font-bold text-indigo-600 mb-12 h-8">
            {phase === "showing" && "记住外星人的位置！👀"}
            {phase === "shuffling" && "注意看，别眨眼！🛸"}
            {phase === "guessing" && "外星人在哪里？👇"}
          </div>

          <div className="flex gap-4 sm:gap-8 justify-center items-end h-64 w-full px-4">
            {positions.map((cupId) => (
              <motion.div
                layout
                key={cupId}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`relative flex flex-col items-center cursor-pointer ${
                  phase === "guessing" ? "hover:scale-110" : ""
                } transition-transform`}
                onClick={() => handleCupClick(cupId)}
              >
                {/* The Cup / Spaceship */}
                <motion.div
                  animate={{
                    y: phase === "showing" ? -60 : 0,
                  }}
                  className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-t-full shadow-lg z-10 flex items-center justify-center border-4 border-indigo-700"
                >
                  <div className="w-16 h-8 bg-indigo-300 rounded-full opacity-50 blur-sm" />
                </motion.div>

                {/* The Alien underneath */}
                <div
                  className={`absolute bottom-0 text-5xl sm:text-6xl transition-opacity duration-300 ${
                    cupId === targetId && (phase === "showing" || phase === "idle")
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                >
                  👽
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      }
    />
  );
}
