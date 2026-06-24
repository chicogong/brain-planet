"use client";

import { useState, useEffect, useRef } from "react";
import { GameContainer } from "@/components/GameContainer";
import { useGameSession } from "@/hooks/useGameSession";
import { playSound } from "@/lib/audio";
import { motion } from "framer-motion";

const PADS = [
  {
    id: 0,
    color: "bg-red-500",
    activeColor: "bg-red-300",
    shadow: "shadow-red-500/50",
    freq: 261.63,
  }, // C4
  {
    id: 1,
    color: "bg-blue-500",
    activeColor: "bg-blue-300",
    shadow: "shadow-blue-500/50",
    freq: 329.63,
  }, // E4
  {
    id: 2,
    color: "bg-green-500",
    activeColor: "bg-green-300",
    shadow: "shadow-green-500/50",
    freq: 392.0,
  }, // G4
  {
    id: 3,
    color: "bg-yellow-500",
    activeColor: "bg-yellow-300",
    shadow: "shadow-yellow-500/50",
    freq: 523.25,
  }, // C5
];

type Phase = "idle" | "watching" | "playing" | "success" | "wrong";

export default function SimonGame() {
  const session = useGameSession({
    gameId: "simon-says",
    winCondition: (score) => score >= 50, // 5 rounds
  });

  const [phase, setPhase] = useState<Phase>("idle");
  const [sequence, setSequence] = useState<number[]>([]);
  const [userStep, setUserStep] = useState<number>(0);
  const [activePad, setActivePad] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameStateRef = useRef(session.gameState);

  useEffect(() => {
    gameStateRef.current = session.gameState;
  }, [session.gameState]);

  const playSequence = async (seq: number[]) => {
    setPhase("watching");
    setActivePad(null);

    // Wait a bit before starting playback
    await new Promise((resolve) => setTimeout(resolve, 800));

    for (let i = 0; i < seq.length; i++) {
      if (gameStateRef.current !== "playing") return;

      const padId = seq[i];
      const pad = PADS[padId];

      setActivePad(padId);
      playSound.playTone?.(pad.freq, 0.4);

      await new Promise((resolve) => setTimeout(resolve, 400));
      setActivePad(null);
      await new Promise((resolve) => setTimeout(resolve, 200)); // gap between notes
    }

    setPhase("playing");
    setUserStep(0);
  };

  const startNextRound = (currentSeq: number[]) => {
    const nextPadId = Math.floor(Math.random() * 4);
    const newSeq = [...currentSeq, nextPadId];
    setSequence(newSeq);
    playSequence(newSeq);
  };

  useEffect(() => {
    if (session.gameState === "playing" && phase === "idle") {
      startNextRound([]);
    }
  }, [session.gameState, phase]);

  const handlePadClick = (padId: number) => {
    if (phase !== "playing") return;

    const pad = PADS[padId];
    setActivePad(padId);
    playSound.playTone?.(pad.freq, 0.2);

    // Auto clear active pad visualization
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setActivePad(null), 200);

    const expectedPadId = sequence[userStep];

    if (padId !== expectedPadId) {
      // Wrong!
      playSound.error();
      setPhase("wrong");
      session.handleWrong();

      setTimeout(() => {
        if (session.gameState === "playing") {
          setPhase("idle"); // restart
        }
      }, 1500);
      return;
    }

    // Correct step
    const nextStep = userStep + 1;
    if (nextStep === sequence.length) {
      // Finished the sequence!
      setPhase("success");
      session.handleCorrect(); // +10 points

      setTimeout(() => {
        if (session.gameState === "playing") {
          startNextRound(sequence);
        }
      }, 1000);
    } else {
      setUserStep(nextStep);
    }
  };

  return (
    <GameContainer
      title="听音辨位"
      gameState={session.gameState}
      score={session.score}
      emojiIcon="🎵"
      themeColor="teal"
      onStart={() => {
        setPhase("idle");
        setSequence([]);
        session.initGame();
      }}
      idleContent={
        <div className="text-gray-600 mb-8 max-w-sm">
          <p className="font-bold text-lg text-teal-600 mb-2">玩法说明：</p>
          <ul className="text-left list-disc pl-5 space-y-2">
            <li>仔细看按钮闪烁的顺序，听它们的声音。</li>
            <li>轮到你时，按照刚才的顺序依次点击按钮。</li>
            <li>每次成功，都会增加一个新按钮，挑战你的记忆极限！</li>
          </ul>
        </div>
      }
      playingContent={
        <div className="flex flex-col items-center justify-center h-full pt-4">
          <div className="text-xl font-bold text-teal-600 mb-8 h-8">
            {phase === "watching" && "听仔细！看仔细！👀"}
            {phase === "playing" && "轮到你了！👇"}
            {phase === "success" && "太棒了！准备下一轮！🎉"}
            {phase === "wrong" && "哎呀，点错了！💥"}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 p-4 bg-gray-50 rounded-full shadow-inner">
            {PADS.map((pad) => (
              <motion.button
                key={pad.id}
                whileTap={phase === "playing" ? { scale: 0.9 } : {}}
                onClick={() => handlePadClick(pad.id)}
                className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full transition-all duration-100 ${
                  activePad === pad.id
                    ? `${pad.activeColor} ${pad.shadow} shadow-2xl scale-105 ring-4 ring-white`
                    : `${pad.color} shadow-lg opacity-80`
                }`}
              />
            ))}
          </div>

          <div className="mt-12 text-gray-400 font-bold">
            当前记忆长度:{" "}
            <span className="text-teal-500 text-2xl">{Math.max(0, sequence.length)}</span>
          </div>
        </div>
      }
    />
  );
}
