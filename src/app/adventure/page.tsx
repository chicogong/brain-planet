"use client";

import { useEffect, useState } from "react";
import { ADVENTURE_LEVELS } from "@/data/adventure";
import { useUserStore } from "@/store/useUserStore";
import { motion } from "framer-motion";
import Link from "next/link";
import { Lock, Star, Play, CheckCircle2 } from "lucide-react";
import { playSound } from "@/lib/audio";

export default function AdventurePage() {
  const [mounted, setMounted] = useState(false);
  const adventureProgress = useUserStore((state) => state.adventureProgress);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center pb-24 relative">
      <div className="mb-10 text-center relative z-10">
        <h1 className="text-4xl font-black text-gray-800 mb-2 mt-4 tracking-tight flex items-center justify-center gap-2">
          🚀 星际航线
        </h1>
        <p className="text-gray-500 font-medium">完成当前星球的挑战，解锁下一颗神秘星球！</p>
      </div>

      <div className="relative w-full flex flex-col items-center">
        {/* Draw a connecting line behind the nodes */}
        <div className="absolute top-0 bottom-0 w-2 bg-indigo-100 rounded-full left-1/2 -translate-x-1/2 z-0"></div>

        {ADVENTURE_LEVELS.map((level, index) => {
          const isUnlocked = index <= adventureProgress;
          const isCompleted = index < adventureProgress;
          const isCurrent = index === adventureProgress;

          // Alternate left and right
          const isLeft = index % 2 === 0;

          return (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={level.id}
              className={`relative w-full flex items-center justify-center mb-16 z-10`}
            >
              {/* Path connector dot on the line */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-4 border-white ${isCompleted ? "bg-green-500" : isUnlocked ? "bg-indigo-500" : "bg-gray-300"}`}
              ></div>

              <div
                className={`flex w-full ${isLeft ? "justify-start pl-4 md:pl-16" : "justify-end pr-4 md:pr-16"}`}
              >
                <div className="w-[140px] md:w-[180px] flex flex-col items-center relative">
                  {isCurrent && (
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -top-10 text-indigo-600 drop-shadow-md z-20"
                    >
                      <div className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-1 shadow-lg">
                        当前位置
                      </div>
                      <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-indigo-600 mx-auto"></div>
                    </motion.div>
                  )}

                  <Link
                    href={isUnlocked ? `/games/${level.gameId}?adventure=${index}` : "#"}
                    onClick={(e) => {
                      if (!isUnlocked) {
                        e.preventDefault();
                        playSound.error();
                      } else {
                        playSound.pop();
                      }
                    }}
                    className={`
                      w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-4xl md:text-5xl shadow-xl transition-all duration-300
                      ${isUnlocked ? level.color : "bg-gray-200"}
                      ${isUnlocked ? "hover:scale-105 hover:shadow-2xl active:scale-95 cursor-pointer" : "opacity-70 cursor-not-allowed"}
                      ${isCurrent ? "ring-8 ring-indigo-200 ring-opacity-50" : ""}
                      relative overflow-hidden group
                    `}
                  >
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-gray-900/10 flex items-center justify-center backdrop-blur-[1px]">
                        <Lock className="w-8 h-8 text-gray-500" />
                      </div>
                    )}

                    {isCompleted && (
                      <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md">
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      </div>
                    )}

                    {isUnlocked && !isCompleted && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <Play
                          className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 drop-shadow-md"
                          fill="currentColor"
                        />
                      </div>
                    )}

                    <span className="drop-shadow-md">{level.icon}</span>
                  </Link>

                  <div className={`mt-4 text-center ${isUnlocked ? "opacity-100" : "opacity-50"}`}>
                    <h3 className="font-bold text-gray-800 text-lg">{level.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-[150px]">{level.description}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {adventureProgress >= ADVENTURE_LEVELS.length && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mt-10 bg-gradient-to-r from-yellow-400 to-orange-500 p-8 rounded-3xl text-center shadow-2xl text-white w-full max-w-sm relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 text-yellow-300 opacity-20">
            <Star className="w-40 h-40" fill="currentColor" />
          </div>
          <h2 className="text-3xl font-black mb-2 relative z-10">🎉 星河霸主</h2>
          <p className="font-medium opacity-90 relative z-10">你已通关当前所有星球！</p>
          <p className="text-sm mt-4 opacity-80 relative z-10">
            新星球正在宇宙深处孕育，敬请期待...
          </p>
        </motion.div>
      )}
    </div>
  );
}
