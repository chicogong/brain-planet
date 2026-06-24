/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { playSound, vibrate } from "@/lib/audio";

export interface GameSessionConfig {
  gameId: string;
  durationSeconds?: number;
  winCondition: (score: number, totalCorrect: number) => boolean;
  onWin?: () => void;
}

export function useGameSession({
  gameId,
  durationSeconds,
  winCondition,
  onWin,
}: GameSessionConfig) {
  const [gameState, setGameState] = useState<"idle" | "playing" | "won">("idle");
  const [score, setScore] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(durationSeconds ?? 0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [adventureLevel, setAdventureLevel] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const lvlStr = params.get("adventure");
      if (lvlStr) {
        setAdventureLevel(parseInt(lvlStr, 10));
      }
    }
  }, []);

  const addPoints = useUserStore((state) => state.addPoints);
  const incrementGameStat = useUserStore((state) => state.incrementGameStat);
  const advanceAdventure = useUserStore((state) => state.advanceAdventure);

  const endGame = useCallback(
    (finalScore: number, finalTotal: number) => {
      setGameState("won");
      if (timerRef.current) clearInterval(timerRef.current);

      // Default scoring: 10 points per win, plus score logic
      addPoints(10 + Math.floor(finalScore / 10));

      playSound.cheer();
      vibrate([100, 50, 100, 50, 200]);

      import("canvas-confetti").then((module) => {
        const confetti = module.default;
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      });

      if (adventureLevel !== null && !isNaN(adventureLevel)) {
        advanceAdventure(adventureLevel);
      }

      if (onWin) onWin();
    },
    [addPoints, onWin, adventureLevel, advanceAdventure]
  );

  const handleCorrect = useCallback(() => {
    playSound.pop();
    vibrate(30);
    setScore((s) => s + 10);
    setTotalCorrect((t) => {
      const newTotal = t + 1;
      if (winCondition(score + 10, newTotal)) {
        endGame(score + 10, newTotal);
      }
      return newTotal;
    });
    setCorrectStreak((s) => s + 1);
  }, [score, winCondition, endGame]);

  const handleWrong = useCallback(() => {
    playSound.error();
    vibrate([50, 50, 50]);
    setScore((s) => Math.max(0, s - 5));
    setCorrectStreak(0);
  }, []);

  const initGame = useCallback(() => {
    setGameState("playing");
    setScore(0);
    setTotalCorrect(0);
    setCorrectStreak(0);
    if (durationSeconds) setTimeLeft(durationSeconds);
    incrementGameStat(gameId);
  }, [gameId, durationSeconds, incrementGameStat]);

  useEffect(() => {
    if (gameState === "playing" && durationSeconds) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame(score, totalCorrect);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, durationSeconds, endGame, score, totalCorrect]);

  return {
    gameState,
    score,
    totalCorrect,
    correctStreak,
    timeLeft,
    initGame,
    handleCorrect,
    handleWrong,
    setGameState,
  };
}
