"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GameContainer } from "@/components/GameContainer";
import { useGameSession } from "@/hooks/useGameSession";
import { playSound, vibrate } from "@/lib/audio";
import { tts } from "@/lib/tts";
import { Undo2, RefreshCw } from "lucide-react";

export default function BalanceGame() {
  const [targetWeight, setTargetWeight] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  const { gameState, score, initGame, handleCorrect, handleWrong } = useGameSession({
    gameId: "balance",
    winCondition: (_, totalCorrect) => totalCorrect >= 3, // 3 equations to win
  });

  const generateRound = () => {
    // Random target weight between 2 and 6
    const weight = Math.floor(Math.random() * 5) + 2;
    setTargetWeight(weight);
    setCurrentWeight(0);
    setIsChecking(false);
    tts.speak(`让天平两边一样重吧`);
  };

  const handleStart = () => {
    initGame();
    generateRound();
  };

  const handleAddWeight = () => {
    if (gameState !== "playing" || isChecking) return;
    playSound.pop();
    setCurrentWeight((prev) => prev + 1);
  };

  const handleRemoveWeight = () => {
    if (gameState !== "playing" || currentWeight <= 0 || isChecking) return;
    playSound.pop();
    setCurrentWeight((prev) => prev - 1);
  };

  // Calculate tilt angle based on difference
  // Max tilt angle could be e.g. 15 degrees
  const difference = currentWeight - targetWeight;
  const rawAngle = difference * 5;
  // Limit angle to max 20 degrees
  const tiltAngle = Math.max(-20, Math.min(20, rawAngle));

  const checkBalance = () => {
    if (gameState !== "playing" || isChecking) return;

    setIsChecking(true);
    if (currentWeight === targetWeight) {
      playSound.cheer();
      handleCorrect();
      setTimeout(() => {
        if (gameState === "playing") generateRound();
      }, 2000);
    } else {
      playSound.error();
      handleWrong();
      vibrate([50, 50]);
      setTimeout(() => {
        setIsChecking(false);
      }, 1000);
    }
  };

  return (
    <GameContainer
      title="平衡天平"
      gameState={gameState}
      score={score}
      emojiIcon="⚖️"
      themeColor="teal"
      onStart={handleStart}
      winMessage="数感大师！"
      shareText="我在「脑力星球」的平衡天平里学会了数量关系，你也来试试吧！"
      idleContent={
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">平衡天平</h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            观察左边的数量，在右边放上一样多的小球！
            <br />
            这是理解“等于”的最好方法。
          </p>
        </>
      }
      playingContent={
        <div className="w-full flex flex-col items-center flex-1 pb-4">
          {/* Balance Scale UI */}
          <div className="relative w-full max-w-[320px] h-[250px] flex flex-col items-center mt-8">
            {/* The Beam */}
            <motion.div
              className="absolute top-10 w-full h-4 bg-teal-600 rounded-full z-10 origin-center"
              animate={{ rotate: isChecking ? tiltAngle : Math.max(-15, -targetWeight * 3) }}
              transition={{ type: "spring", stiffness: 100, damping: 10 }}
            >
              {/* Left Plate (Target) */}
              <div className="absolute left-4 top-2 w-20 h-20 bg-teal-100 rounded-b-3xl border-2 border-teal-500 border-t-0 flex flex-col-reverse items-center justify-start pb-2 overflow-hidden shadow-inner">
                <div className="absolute -top-[2px] w-full h-[2px] bg-teal-500"></div>
                <div className="flex flex-wrap-reverse justify-center gap-1 px-1">
                  {Array.from({ length: targetWeight }).map((_, i) => (
                    <div key={i} className="w-6 h-6 bg-orange-400 rounded-full shadow-sm" />
                  ))}
                </div>
              </div>

              {/* Right Plate (Current) */}
              <div className="absolute right-4 top-2 w-20 h-20 bg-teal-100 rounded-b-3xl border-2 border-teal-500 border-t-0 flex flex-col-reverse items-center justify-start pb-2 overflow-hidden shadow-inner">
                <div className="absolute -top-[2px] w-full h-[2px] bg-teal-500"></div>
                <div className="flex flex-wrap-reverse justify-center gap-1 px-1">
                  <AnimatePresence>
                    {Array.from({ length: currentWeight }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, y: -20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="w-6 h-6 bg-blue-500 rounded-full shadow-sm"
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* The Base/Fulcrum */}
            <div className="absolute top-[38px] w-0 h-0 border-l-[16px] border-r-[16px] border-b-[24px] border-l-transparent border-r-transparent border-b-teal-800 z-20"></div>
            <div className="absolute top-[62px] w-8 h-[120px] bg-teal-800 rounded-t-lg z-0 shadow-lg"></div>
            <div className="absolute top-[182px] w-32 h-6 bg-teal-900 rounded-lg z-0 shadow-xl"></div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-4 mt-8 w-full max-w-[280px]">
            <div className="flex justify-between w-full gap-4">
              <Button
                variant="outline"
                className="flex-1 h-16 text-2xl font-black rounded-2xl border-2 border-gray-200 text-gray-500"
                onClick={handleRemoveWeight}
                disabled={currentWeight === 0 || isChecking}
              >
                - 拿走
              </Button>
              <Button
                variant="default"
                className="flex-1 h-16 text-2xl font-black rounded-2xl bg-blue-500 hover:bg-blue-600 shadow-md"
                onClick={handleAddWeight}
                disabled={currentWeight >= 12 || isChecking}
              >
                + 放入
              </Button>
            </div>

            <Button
              className="w-full h-14 text-xl font-bold rounded-2xl bg-teal-500 hover:bg-teal-600 shadow-lg shadow-teal-500/30"
              onClick={checkBalance}
              disabled={currentWeight === 0 || isChecking}
            >
              检查是否平衡！
            </Button>
          </div>
        </div>
      }
    />
  );
}
