"use client";

import { useState, useEffect, useRef } from "react";
import { useUserStore } from "@/store/useUserStore";
import { tts } from "@/lib/tts";
import { GameContainer } from "@/components/GameContainer";
import { motion } from "framer-motion";

const NOTES = [
  { name: "Do", color: "bg-red-400", freq: 261.63 },
  { name: "Re", color: "bg-orange-400", freq: 293.66 },
  { name: "Mi", color: "bg-yellow-400", freq: 329.63 },
  { name: "Fa", color: "bg-green-400", freq: 349.23 },
  { name: "Sol", color: "bg-teal-400", freq: 392.0 },
  { name: "La", color: "bg-blue-400", freq: 440.0 },
  { name: "Si", color: "bg-indigo-400", freq: 493.88 },
  { name: "Do", color: "bg-purple-400", freq: 523.25 },
];

export default function MagicPianoGame() {
  const [gameState, setGameState] = useState<"idle" | "playing" | "won">("idle");
  const [notesPlayed, setNotesPlayed] = useState(0);
  const [activeNote, setActiveNote] = useState<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const unlockBadge = useUserStore((state) => state.unlockBadge);
  const incrementGameStat = useUserStore((state) => state.incrementGameStat);

  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtxRef.current = new AudioContextClass();
    }
    return () => {
      if (audioCtxRef.current?.state !== "closed") {
        audioCtxRef.current?.close();
      }
    };
  }, []);

  const playNote = (index: number) => {
    setActiveNote(index);
    setNotesPlayed((n) => {
      const newCount = n + 1;
      if (newCount === 50) {
        unlockBadge("music_pro");
        setGameState("won");
      }
      return newCount;
    });

    if (audioCtxRef.current) {
      // Resume context if suspended (browser autoplay policy)
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      const oscillator = audioCtxRef.current.createOscillator();
      const gainNode = audioCtxRef.current.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(NOTES[index].freq, audioCtxRef.current.currentTime);

      // Envelope to make it sound like a soft piano/bell
      gainNode.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtxRef.current.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 1.5);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtxRef.current.destination);

      oscillator.start();
      oscillator.stop(audioCtxRef.current.currentTime + 1.5);
    }

    setTimeout(() => {
      setActiveNote(null);
    }, 200);
  };

  const handleStart = () => {
    setGameState("playing");
    setNotesPlayed(0);
    incrementGameStat("magic-piano");
    tts.speak("点击琴键，弹奏属于你的旋律吧！");
  };

  return (
    <GameContainer
      title="魔法钢琴"
      gameState={gameState}
      emojiIcon="🎹"
      themeColor="purple"
      onStart={handleStart}
      winMessage="音乐小天才！"
      shareText="我刚才在「脑力星球」用魔法钢琴弹奏了一首超棒的曲子，获得了“小小莫扎特”徽章！"
      idleContent={
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">魔法钢琴</h2>
          <p className="text-gray-500 max-w-sm mx-auto">
            纯粹的音乐启蒙！不需要懂五线谱，随意点击彩虹琴键就能演奏出美妙的旋律。
            <br />
            弹奏 50 个音符即可解锁“小小莫扎特”徽章！
          </p>
        </>
      }
      playingContent={
        <div className="w-full flex flex-col items-center">
          <div className="flex justify-between w-full mb-8 px-4">
            <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-2xl font-bold">
              音符进度: {notesPlayed} / 50
            </div>
          </div>

          <div className="w-full max-w-3xl flex justify-center gap-1 sm:gap-2 px-2 h-64 sm:h-80">
            {NOTES.map((note, index) => (
              <motion.button
                key={index}
                onMouseDown={() => playNote(index)}
                onTouchStart={(e) => {
                  e.preventDefault(); // Prevent double firing from touch & mouse
                  playNote(index);
                }}
                animate={activeNote === index ? { scale: 0.95, y: 10 } : { scale: 1, y: 0 }}
                transition={{ duration: 0.1 }}
                className={`flex-1 rounded-b-2xl sm:rounded-b-3xl border-2 border-t-0 border-gray-200 shadow-sm relative flex flex-col justify-end pb-4 transition-colors ${
                  activeNote === index ? note.color : "bg-white"
                }`}
                style={{
                  transformOrigin: "top",
                }}
              >
                <span
                  className={`font-bold text-lg sm:text-2xl mb-2 ${activeNote === index ? "text-white" : note.color.replace("bg-", "text-")}`}
                >
                  {note.name}
                </span>
                <span className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full mx-auto ${note.color}`} />
              </motion.button>
            ))}
          </div>

          <p className="text-gray-400 mt-12 text-sm font-medium">滑动或点击即可发出美妙的声音</p>
        </div>
      }
    />
  );
}
