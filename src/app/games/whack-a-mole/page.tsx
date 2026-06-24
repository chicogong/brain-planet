"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Share2 } from "lucide-react";
import confetti from "canvas-confetti";
import { playSound, vibrate } from "@/lib/audio";

type EntityType = "none" | "mole" | "bomb";

export default function WhackAMoleGame() {
  const [gameState, setGameState] = useState<"idle" | "playing" | "won">("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [holes, setHoles] = useState<EntityType[]>(Array(9).fill("none"));
  
  const addPoints = useUserStore((state) => state.addPoints);
  const incrementGameStat = useUserStore((state) => state.incrementGameStat);
  const unlockBadge = useUserStore((state) => state.unlockBadge);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const spawnerRef = useRef<NodeJS.Timeout | null>(null);

  const initGame = () => {
    setGameState("playing");
    setScore(0);
    setTimeLeft(30);
    setHoles(Array(9).fill("none"));
    incrementGameStat("whack-a-mole");
  };

  const endGame = useCallback(() => {
    setGameState("won");
    if (timerRef.current) clearInterval(timerRef.current);
    if (spawnerRef.current) clearInterval(spawnerRef.current);
    
    // Add points based on score (1 point per 10 game score)
    const earnedPoints = Math.max(0, Math.floor(score / 10));
    if (earnedPoints > 0) addPoints(earnedPoints);
    
    // Badge logic
    if (score >= 500) {
      unlockBadge('whack_100');
    }

    playSound.cheer();
    vibrate([100, 50, 100, 50, 200]);
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  }, [score, addPoints, unlockBadge]);

  useEffect(() => {
    if (gameState === "playing") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      spawnerRef.current = setInterval(() => {
        setHoles((prev) => {
          const newHoles = [...prev];
          
          // clear existing
          const activeIndices = newHoles.map((h, i) => h !== "none" ? i : -1).filter(i => i !== -1);
          if (activeIndices.length > 2) {
            // randomly remove one to keep board clean
            newHoles[activeIndices[Math.floor(Math.random() * activeIndices.length)]] = "none";
          }

          // spawn new
          const emptyIndices = newHoles.map((h, i) => h === "none" ? i : -1).filter(i => i !== -1);
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
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnerRef.current) clearInterval(spawnerRef.current);
    };
  }, [gameState, endGame]);

  const whack = (index: number) => {
    if (gameState !== "playing") return;
    
    const entity = holes[index];
    if (entity === "none") return;

    if (entity === "mole") {
      setScore((s) => s + 20);
      playSound.pop();
      vibrate(30);
    } else if (entity === "bomb") {
      setScore((s) => Math.max(0, s - 30));
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
    <div className="flex flex-col items-center max-w-lg mx-auto w-full">
      <div className="w-full flex justify-between items-center mb-6">
        <Link href="/" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-black text-gray-800">萌宠打地鼠</h1>
        </div>
        <button 
          onClick={initGame} 
          className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          title="重新开始"
        >
          <RefreshCw className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
        {gameState === "idle" ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-6">🐹</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">准备好拼手速了吗？</h2>
            <p className="text-gray-500 mb-8 max-w-sm">
              敲击探出头的地鼠 (+20分)<br/>
              千万别碰到炸弹 (-30分)<br/>
              时间限制 30 秒，超过 500 分可解锁神秘徽章！
            </p>
            <button
              onClick={initGame}
              className="bg-red-500 hover:bg-red-600 text-white font-bold text-xl py-4 px-12 rounded-full transition-all active:scale-95 shadow-lg shadow-red-500/30"
            >
              开始挑战
            </button>
          </div>
        ) : gameState === "playing" ? (
          <div className="w-full">
            <div className="flex justify-between items-center mb-8 px-4">
              <div className="bg-orange-100 text-orange-600 px-4 py-2 rounded-2xl font-black text-xl">
                ⏳ {timeLeft} s
              </div>
              <div className="bg-blue-100 text-blue-600 px-4 py-2 rounded-2xl font-black text-xl">
                ✨ {score} 分
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-green-500/10 p-4 rounded-3xl">
              {holes.map((entity, i) => (
                <div key={i} className="relative w-full aspect-square bg-gray-900/10 rounded-2xl overflow-hidden border-b-4 border-gray-900/20">
                  <div className="absolute bottom-0 w-full h-1/3 bg-gray-900/30 rounded-t-full" />
                  <AnimatePresence>
                    {entity !== "none" && (
                      <motion.button
                        initial={{ y: "100%", scale: 0.8 }}
                        animate={{ y: "10%", scale: 1 }}
                        exit={{ y: "100%", scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        onClick={() => whack(i)}
                        className="absolute inset-0 flex items-center justify-center text-5xl active:scale-90 select-none"
                      >
                        {entity === "mole" ? "🐹" : "💣"}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8 w-full"
          >
            <div className="text-6xl mb-4">{score >= 500 ? "🏆" : "👏"}</div>
            <h2 className="text-3xl font-black text-gray-800 mb-2">挑战结束！</h2>
            <p className="text-gray-500 font-medium mb-6">
              最终得分: <span className="text-blue-500 font-bold text-2xl">{score}</span> 分<br/>
              {score >= 500 ? "手速简直无敌了！" : "再接再厉哦！"}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={async () => {
                  const text = `我刚才在「脑力星球」打地鼠狂揽了 ${score} 分！我的手速已经突破天际，你能超过我吗？`;
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
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-red-500/30"
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
