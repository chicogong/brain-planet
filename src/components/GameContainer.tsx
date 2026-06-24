"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { playSound } from "@/lib/audio";

interface GameContainerProps {
  title: string;
  gameState: "idle" | "playing" | "won";
  score?: number;
  timeLeft?: number;
  emojiIcon: string;
  themeColor: "indigo" | "teal" | "orange" | "red" | "purple" | "blue" | "gray" | "green";
  idleContent: React.ReactNode;
  playingContent: React.ReactNode;
  onStart: () => void;
  winMessage?: string;
  shareText?: string;
  wonContent?: React.ReactNode;
}

const colorMap = {
  indigo: "bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/30 text-indigo-600 bg-indigo-50",
  teal: "bg-teal-500 hover:bg-teal-600 shadow-teal-500/30 text-teal-600 bg-teal-50",
  orange: "bg-orange-500 hover:bg-orange-600 shadow-orange-500/30 text-orange-600 bg-orange-50",
  red: "bg-red-500 hover:bg-red-600 shadow-red-500/30 text-red-600 bg-red-50",
  purple: "bg-purple-500 hover:bg-purple-600 shadow-purple-500/30 text-purple-600 bg-purple-50",
  blue: "bg-blue-500 hover:bg-blue-600 shadow-blue-500/30 text-blue-600 bg-blue-50",
  gray: "bg-gray-800 hover:bg-gray-900 shadow-gray-800/30 text-gray-800 bg-gray-100",
  green: "bg-green-500 hover:bg-green-600 shadow-green-500/30 text-green-600 bg-green-50",
};

export function GameContainer({
  title,
  gameState,
  score,
  timeLeft,
  emojiIcon,
  themeColor,
  idleContent,
  playingContent,
  onStart,
  winMessage = "挑战成功！",
  shareText = "我刚才在「脑力星球」完成了一次大脑挑战，快来试试吧！",
  wonContent
}: GameContainerProps) {
  
  const classes = colorMap[themeColor].split(" ");
  const btnClass = `${classes[0]} ${classes[1]} ${classes[2]}`;
  const textClass = classes[3];
  const bgSoftClass = classes[4];

  const handleStart = () => {
    playSound.toggleBGM();
    onStart();
  };

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto w-full">
      {/* Universal Top Bar */}
      <div className="w-full flex justify-between items-center mb-6">
        <Link href="/" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-black text-gray-800">{title}</h1>
        </div>
        <button 
          onClick={handleStart} 
          className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          title="重新开始"
        >
          <RefreshCw className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <div className="w-full bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 min-h-[400px] flex flex-col items-center relative overflow-hidden">
        
        {/* Game State Management */}
        {gameState === "idle" && (
          <div className="text-center py-8 flex flex-col items-center justify-center w-full h-full my-auto">
            <div className="text-6xl mb-6">{emojiIcon}</div>
            {idleContent}
            <button
              onClick={handleStart}
              className={`text-white font-bold text-xl py-4 px-12 rounded-full transition-all active:scale-95 active:translate-y-1 shadow-lg mt-8 ${btnClass}`}
            >
              开始挑战
            </button>
          </div>
        )}

        {gameState === "playing" && (
          <div className="w-full h-full flex flex-col">
            {/* Optional Status Bar */}
            {(score !== undefined || timeLeft !== undefined) && (
              <div className="flex justify-between w-full mb-8 px-4">
                {timeLeft !== undefined && (
                  <div className={`px-4 py-2 rounded-2xl font-black text-xl ${bgSoftClass} ${textClass}`}>
                    ⏳ {timeLeft} s
                  </div>
                )}
                {score !== undefined && (
                  <div className={`px-4 py-2 rounded-2xl font-black text-xl ${bgSoftClass} ${textClass}`}>
                    ✨ {score}
                  </div>
                )}
              </div>
            )}
            
            {/* Inject specific game content */}
            <div className="flex-1 w-full">
              {playingContent}
            </div>
          </div>
        )}

        {gameState === "won" && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8 w-full flex flex-col items-center justify-center h-full my-auto"
          >
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-black text-gray-800 mb-2">{winMessage}</h2>
            {score !== undefined && (
              <p className="text-gray-500 font-medium mb-8">
                最终得分: <span className={`font-bold text-2xl ${textClass}`}>{score}</span> 分
              </p>
            )}
            
            {wonContent && (
              <div className="w-full max-w-sm mb-8">
                {wonContent}
              </div>
            )}

            <div className="flex flex-col gap-4 w-full max-w-sm mt-4">
              <button
                onClick={async () => {
                  const url = window.location.origin;
                  if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
                    try { await navigator.share({ title: '脑力星球 - 战绩分享', text: shareText, url }); } catch(e) {}
                  } else {
                    navigator.clipboard.writeText(shareText + ' ' + url);
                    alert('战绩已复制到剪贴板！');
                  }
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 active:translate-y-1 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" /> 炫耀一下
              </button>
              <button
                onClick={handleStart}
                className={`w-full text-white font-bold py-4 rounded-2xl transition-all active:scale-95 active:translate-y-1 shadow-lg ${btnClass}`}
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
