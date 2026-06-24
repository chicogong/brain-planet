"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameContainer } from "@/components/GameContainer";
import { useGameSession } from "@/hooks/useGameSession";
import { vibrate } from "@/lib/audio";
import { tts } from "@/lib/tts";

const EMOJIS = ['🍎', '🍌', '🍇', '🍉', '🍓', '🚗', '✈️', '🚀', '🐶', '🐱', '🐰', '🐼', '⚽', '🏀', '⭐', '🎈'];
const PATTERNS = [
  "ABABAB",
  "AABBAA",
  "ABCABC",
  "ABBABB",
  "AABAA",
  "AABCAABC"
];

interface Question {
  sequence: string[];
  options: string[];
  answer: string;
}

export default function PatternMasterGame() {
  const [question, setQuestion] = useState<Question | null>(null);

  const {
    gameState,
    totalCorrect,
    correctStreak,
    initGame,
    handleCorrect,
    handleWrong,
  } = useGameSession({
    gameId: "pattern-master",
    winCondition: (_, totalCorrect) => totalCorrect >= 10,
  });

  const generateQuestion = useCallback(() => {
    // Pick a random pattern
    const patternStr = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    
    // Pick unique emojis for A, B, C
    const shuffledEmojis = [...EMOJIS].sort(() => 0.5 - Math.random());
    const emojiMap: Record<string, string> = {
      'A': shuffledEmojis[0],
      'B': shuffledEmojis[1],
      'C': shuffledEmojis[2],
    };

    // Construct full sequence
    const fullSeq = patternStr.split('').map(char => emojiMap[char]);
    
    // The last item is the answer
    const answer = fullSeq[fullSeq.length - 1];
    
    // Sequence to show (last item replaced with ?)
    const sequenceToShow = [...fullSeq];
    sequenceToShow[sequenceToShow.length - 1] = '?';

    // Generate options (1 correct, 3 wrong)
    const options = new Set<string>();
    options.add(answer);
    while(options.size < 4) {
      options.add(shuffledEmojis[Math.floor(Math.random() * shuffledEmojis.length)]);
    }

    setQuestion({
      sequence: sequenceToShow,
      answer,
      options: Array.from(options).sort(() => 0.5 - Math.random())
    });
  }, []);

  const handleStart = () => {
    initGame();
    generateQuestion();
    tts.speak("观察图案的排列规律，找出问号处缺失的正确图案。");
  };

  const handleSelect = (selected: string) => {
    if (!question || gameState !== "playing") return;

    if (selected === question.answer) {
      handleCorrect();
      if (totalCorrect + 1 < 10) {
        generateQuestion();
      }
    } else {
      handleWrong();
      vibrate([50, 50]);
      const el = document.getElementById("options-container");
      if (el) {
        el.classList.add("animate-shake");
        setTimeout(() => el.classList.remove("animate-shake"), 500);
      }
    }
  };

  return (
    <GameContainer
      title="逻辑找规律"
      gameState={gameState}
      emojiIcon="🧩"
      themeColor="teal"
      onStart={handleStart}
      winMessage="推理大师！"
      shareText={`我在「脑力星球」的找规律大挑战中完美通关！我的逻辑思维无懈可击，快来挑战我吧！`}
      idleContent={
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">大侦探福尔摩斯</h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            观察图案的排列规律，找出问号处缺失的正确图案。<br/>
            连续答对 10 题即可通关解锁徽章！
          </p>
        </>
      }
      playingContent={
        <div className="w-full flex flex-col items-center max-w-lg mx-auto">
          <div className="flex justify-between w-full mb-8 px-4">
            <div className="bg-teal-50 text-teal-600 px-4 py-2 rounded-2xl font-bold">
              进度: {totalCorrect} / 10
            </div>
            <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-2xl font-bold">
              连对: {correctStreak}
            </div>
          </div>

          {question && (
            <>
              {/* Sequence Display */}
              <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-16 bg-gray-50 p-6 rounded-3xl border-2 border-gray-100 w-full">
                <AnimatePresence mode="popLayout">
                  {question.sequence.map((item, idx) => (
                    <motion.div
                      key={`seq-${totalCorrect}-${idx}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center text-4xl md:text-5xl rounded-2xl ${
                        item === '?' 
                          ? 'bg-white border-4 border-dashed border-gray-300 text-gray-300 shadow-inner' 
                          : 'bg-white shadow-md'
                      }`}
                    >
                      {item}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Options */}
              <h3 className="text-gray-500 font-bold mb-4">请选择正确的图案填入问号处：</h3>
              <div id="options-container" className="flex flex-wrap justify-center gap-4">
                {question.options.map((opt, i) => (
                  <button
                    key={`opt-${i}`}
                    onClick={() => handleSelect(opt)}
                    className="w-20 h-20 md:w-24 md:h-24 bg-white border-b-4 border-gray-200 rounded-3xl text-5xl hover:border-teal-400 hover:bg-teal-50 transition-all active:border-b-0 active:translate-y-1 shadow-sm flex items-center justify-center"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      }
    />
  );
}
