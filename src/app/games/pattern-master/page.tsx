"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Share2 } from "lucide-react";
import confetti from "canvas-confetti";
import { playSound, vibrate } from "@/lib/audio";

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
  const [gameState, setGameState] = useState<"idle" | "playing" | "won">("idle");
  const [question, setQuestion] = useState<Question | null>(null);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  
  const addPoints = useUserStore((state) => state.addPoints);
  const incrementGameStat = useUserStore((state) => state.incrementGameStat);
  const unlockBadge = useUserStore((state) => state.unlockBadge);

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

  const initGame = () => {
    setGameState("playing");
    setCorrectStreak(0);
    setTotalCorrect(0);
    incrementGameStat("pattern-master");
    generateQuestion();
  };

  const handleSelect = (selected: string) => {
    if (!question) return;

    if (selected === question.answer) {
      // Correct!
      playSound.pop();
      vibrate(30);
      const newStreak = correctStreak + 1;
      const newTotal = totalCorrect + 1;
      
      setCorrectStreak(newStreak);
      setTotalCorrect(newTotal);
      addPoints(10);

      // Check badge
      if (newStreak >= 10) {
        unlockBadge('pattern_master');
      }

      // Check win condition (e.g., 10 correct overall)
      if (newTotal >= 10) {
        setGameState("won");
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
      // Brief red flash or shake could be added here
      const el = document.getElementById("options-container");
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
          <h1 className="text-2xl font-black text-gray-800">逻辑找规律</h1>
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
            <div className="text-6xl mb-6">🧩</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">大侦探福尔摩斯</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              观察图案的排列规律，找出问号处缺失的正确图案。<br/>
              连续答对 10 题即可解锁专属大侦探徽章！
            </p>
            <button
              onClick={initGame}
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold text-xl py-4 px-12 rounded-full transition-all active:scale-95 shadow-lg shadow-teal-500/30"
            >
              开始推理
            </button>
          </div>
        ) : gameState === "playing" && question ? (
          <div className="w-full flex flex-col items-center">
            <div className="flex justify-between w-full mb-8 px-4">
              <div className="bg-teal-50 text-teal-600 px-4 py-2 rounded-2xl font-bold">
                进度: {totalCorrect} / 10
              </div>
              <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-2xl font-bold">
                连对: {correctStreak}
              </div>
            </div>

            {/* Sequence Display */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-16 bg-gray-50 p-6 rounded-3xl border-2 border-gray-100">
              <AnimatePresence mode="popLayout">
                {question.sequence.map((item, idx) => (
                  <motion.div
                    key={`seq-${idx}-${item}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-4xl md:text-5xl rounded-2xl ${
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
          </div>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8 w-full"
          >
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-black text-gray-800 mb-2">推理大师！</h2>
            <p className="text-gray-500 font-medium mb-6">
              你成功找出了所有的规律！<br/>
              逻辑思维满分💯
            </p>
            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              <button
                onClick={async () => {
                  const text = `我刚才在「脑力星球」的找规律大挑战中完美通关！我的逻辑思维无懈可击，快来挑战我吧！`;
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
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-teal-500/30"
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
