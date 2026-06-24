"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";
import { tts } from "@/lib/tts";
import { GameContainer } from "@/components/GameContainer";
import { useGameSession } from "@/hooks/useGameSession";

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '豹', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '鹿', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿', '🦔'];

export default function ShadowMatchGame() {
  const [targetEmoji, setTargetEmoji] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
  
  const unlockBadge = useUserStore((state) => state.unlockBadge);

  const {
    gameState,
    totalCorrect,
    correctStreak,
    initGame,
    handleCorrect,
    handleWrong
  } = useGameSession({
    gameId: "shadow-match",
    winCondition: (score, total) => total >= 15,
    onWin: () => unlockBadge('shadow_wizard')
  });

  const generateQuestion = useCallback(() => {
    const shuffled = [...EMOJIS].sort(() => 0.5 - Math.random());
    const selectedOptions = shuffled.slice(0, 4);
    const target = selectedOptions[Math.floor(Math.random() * 4)];
    setTargetEmoji(target);
    setOptions(selectedOptions);
  }, []);

  const handleStart = () => {
    initGame();
    generateQuestion();
    tts.speak("仔细观察上方的纯黑色影子，在下方找出对应的真实动物吧！");
  };

  const handleSelect = (selected: string) => {
    if (!targetEmoji) return;
    if (selected === targetEmoji) {
      handleCorrect();
      if (totalCorrect + 1 < 15) {
        generateQuestion();
      }
    } else {
      handleWrong();
      const el = document.getElementById("shadow-options-container");
      if (el) {
        el.classList.add("animate-shake");
        setTimeout(() => el.classList.remove("animate-shake"), 500);
      }
    }
  };

  useEffect(() => {
    if (gameState === "idle") {
      tts.speak("欢迎来到影子匹配游戏。");
    }
  }, [gameState]);

  return (
    <GameContainer
      title="影子匹配"
      gameState={gameState}
      emojiIcon="🦇"
      themeColor="gray"
      onStart={handleStart}
      winMessage="好眼力！空间想象力满分💯"
      shareText="我刚才在「脑力星球」完成了影子匹配挑战，成功解锁“光影魔术手”！快来试试你的眼力吧！"
      idleContent={
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">光影魔术手</h2>
          <p className="text-gray-500 max-w-sm mx-auto">
            通过观察纯黑的影子轮廓，找出对应的真实图案。<br/>
            完成 15 次挑战即可解锁魔术手徽章！
          </p>
        </>
      }
      playingContent={
        <div className="w-full flex flex-col items-center">
          <div className="flex justify-between w-full mb-8 px-4">
            <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-2xl font-bold">
              进度: {totalCorrect} / 15
            </div>
            <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-2xl font-bold">
              连对: {correctStreak}
            </div>
          </div>

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
      }
    />
  );
}
