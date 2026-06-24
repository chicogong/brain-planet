"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Share2 } from "lucide-react";
import confetti from "canvas-confetti";
import { playSound, vibrate } from "@/lib/audio";

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '豹', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '鹿', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿', '🦔'];

export default function ShadowMatchGame() {
  const [gameState, setGameState] = useState<"idle" | "playing" | "won">("idle");
  const [targetEmoji, setTargetEmoji] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  
  const addPoints = useUserStore((state) => state.addPoints);
  const incrementGameStat = useUserStore((state) => state.incrementGameStat);
  const unlockBadge = useUserStore((state) => state.unlockBadge);

  const generateQuestion = useCallback(() => {
    // Pick 4 unique random emojis
    const shuffled = [...EMOJIS].sort(() => 0.5 - Math.random());
    const selectedOptions = shuffled.slice(0, 4);
    
    // The target is one of the 4 options
    const target = selectedOptions[Math.floor(Math.random() * 4)];
    
    setTargetEmoji(target);
    setOptions(selectedOptions);
  }, []);

  const initGame = () => {
    setGameState("playing");
    setCorrectStreak(0);
    setTotalCorrect(0);
    incrementGameStat("shadow-match");
    generateQuestion();
  };

  const handleSelect = (selected: string) => {
    if (!targetEmoji) return;

    if (selected === targetEmoji) {
      // Correct!
      playSound.pop();
      vibrate(30);
      const newStreak = correctStreak + 1;
      const newTotal = totalCorrect + 1;
      
      setCorrectStreak(newStreak);
      setTotalCorrect(newTotal);
      addPoints(10);

      // Check win condition (e.g., 15 correct overall)
      if (newTotal >= 15) {
        setGameState("won");
        unlockBadge('shadow_wizard'); // Badge unlocked at 15 matches
        playSound.cheer();
        vibrate([100, 50, 100, 50, 200]);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      } else {
        generateQuestion();
      }
    } else {
      // Wrong!
      playSound.error();
      vibrate([50, 50, 50]);
      setCorrectStreak(0);
      const el = document.getElementById("shadow-options-container");
      if (el) {
        el.classList.add("animate-shake");
        setTimeout(() => el.classList.remove("animate-shake"), 500);
      }
    }
  };

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto w-full">
      <div className="w-full flex justify-between items-center mb-6">
        <Link href="/" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-black text-gray-800">影子匹配</h1>
        </div>
        <button 
          onClick={initGame} 
          className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          title="重新开始"
        >
          <RefreshCw className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <div className="w-full bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 min-h-[400px] flex flex-col justify-center items-center">
        {gameState === "idle" ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-6 grayscale brightness-0">🦇</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">光影魔术手</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              通过观察纯黑的影子轮廓，找出对应的真实图案。<br/>
              完成 15 次挑战即可解锁魔术手徽章！
            </p>
            <button
              onClick={initGame}
              className="bg-gray-800 hover:bg-gray-900 text-white font-bold text-xl py-4 px-12 rounded-full transition-all active:scale-95 shadow-lg shadow-gray-500/30"
            >
              开始观察
            </button>
          </div>
        ) : gameState === "playing" && targetEmoji ? (
          <div className="w-full flex flex-col items-center">
            <div className="flex justify-between w-full mb-8 px-4">
              <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-2xl font-bold">
                进度: {totalCorrect} / 15
              </div>
              <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-2xl font-bold">
                连对: {correctStreak}
              </div>
            </div>

            {/* Shadow Display */}
            <div className="mb-16">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`shadow-${targetEmoji}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-9xl md:text-[12rem] select-none pointer-events-none drop-shadow-2xl"
                  style={{ filter: "brightness(0)" }}
                >
                  {targetEmoji}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Options */}
            <h3 className="text-gray-500 font-bold mb-4">这是谁的影子？</h3>
            <div id="shadow-options-container" className="flex flex-wrap justify-center gap-4 w-full">
              {options.map((opt, i) => (
                <button
                  key={`opt-${i}`}
                  onClick={() => handleSelect(opt)}
                  className="flex-1 min-w-[70px] aspect-square max-w-[100px] bg-white border-b-4 border-gray-200 rounded-3xl text-5xl hover:border-gray-800 hover:bg-gray-50 transition-all active:border-b-0 active:translate-y-1 shadow-sm flex items-center justify-center"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8 w-full"
          >
            <div className="text-6xl mb-4">🦇</div>
            <h2 className="text-3xl font-black text-gray-800 mb-2">好眼力！</h2>
            <p className="text-gray-500 font-medium mb-6">
              你成功识别出了所有的影子！<br/>
              空间想象力满分💯
            </p>
            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              <button
                onClick={async () => {
                  const text = `我刚才在「脑力星球」完成了影子匹配挑战，成功解锁“光影魔术手”！快来试试你的眼力吧！`;
                  if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
                    try { await navigator.share({ title: '脑力星球 - 战绩分享', text, url: window.location.origin }); } catch(e) {}
                  } else {
                    navigator.clipboard.writeText(text + ' ' + window.location.origin);
                    alert('战绩已复制到剪贴板！');
                  }
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" /> 炫耀一下
              </button>
              <button
                onClick={initGame}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-gray-500/30"
              >
                再来一次
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
