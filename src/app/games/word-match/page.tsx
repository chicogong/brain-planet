"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RefreshCw, Undo2 } from "lucide-react";
import { GameContainer } from "@/components/GameContainer";
import { useGameSession } from "@/hooks/useGameSession";
import { playSound, vibrate } from "@/lib/audio";
import { tts } from "@/lib/tts";

interface WordPuzzle {
  word: string;
  emoji: string;
  zh: string;
}

const PUZZLES: WordPuzzle[] = [
  { word: "APPLE", emoji: "🍎", zh: "苹果" },
  { word: "CAT", emoji: "🐱", zh: "猫咪" },
  { word: "DOG", emoji: "🐶", zh: "小狗" },
  { word: "SUN", emoji: "☀️", zh: "太阳" },
  { word: "MOON", emoji: "🌙", zh: "月亮" },
  { word: "STAR", emoji: "⭐", zh: "星星" },
  { word: "BIRD", emoji: "🐦", zh: "小鸟" },
  { word: "FISH", emoji: "🐟", zh: "小鱼" },
  { word: "TREE", emoji: "🌳", zh: "大树" },
  { word: "BOOK", emoji: "📖", zh: "书本" },
];

export default function WordMatchGame() {
  const [currentPuzzle, setCurrentPuzzle] = useState<WordPuzzle | null>(null);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<{ char: string; originalIndex: number }[]>(
    []
  );
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());

  const { gameState, score, initGame, handleCorrect, handleWrong, setGameState } = useGameSession({
    gameId: "word-match",
    winCondition: (_, totalCorrect) => totalCorrect >= 3, // Win after 3 words
  });

  const generatePuzzle = () => {
    // Pick a random puzzle not currently showing
    const available = PUZZLES.filter((p) => p.word !== currentPuzzle?.word);
    const puzzle = available[Math.floor(Math.random() * available.length)];

    // Shuffle the letters
    const letters = puzzle.word.split("");
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }

    setCurrentPuzzle(puzzle);
    setShuffledLetters(letters);
    setSelectedLetters([]);
    setUsedIndices(new Set());

    tts.speak(`拼写出 ${puzzle.zh} 的英文单词`);
  };

  const handleStart = () => {
    initGame();
    generatePuzzle();
  };

  const handleLetterSelect = (char: string, index: number) => {
    if (gameState !== "playing" || usedIndices.has(index)) return;

    playSound.pop();
    const newSelected = [...selectedLetters, { char, originalIndex: index }];
    setSelectedLetters(newSelected);

    const newUsed = new Set(usedIndices);
    newUsed.add(index);
    setUsedIndices(newUsed);

    // Check if full word is formed
    if (newSelected.length === currentPuzzle?.word.length) {
      const spelledWord = newSelected.map((s) => s.char).join("");
      if (spelledWord === currentPuzzle.word) {
        playSound.cheer();
        handleCorrect();
        setTimeout(() => {
          generatePuzzle();
        }, 1500);
      } else {
        playSound.error();
        handleWrong();
        vibrate([50, 50]);
        // Reset selections after a short delay
        setTimeout(() => {
          setSelectedLetters([]);
          setUsedIndices(new Set());
        }, 800);
      }
    }
  };

  const handleUndo = () => {
    if (selectedLetters.length === 0 || gameState !== "playing") return;
    playSound.pop();
    const last = selectedLetters[selectedLetters.length - 1];

    setSelectedLetters(selectedLetters.slice(0, -1));
    const newUsed = new Set(usedIndices);
    newUsed.delete(last.originalIndex);
    setUsedIndices(newUsed);
  };

  return (
    <GameContainer
      title="看图拼词"
      gameState={gameState}
      score={score}
      emojiIcon="🅰️"
      themeColor="blue"
      onStart={handleStart}
      winMessage="英语小天才！"
      shareText={`我在「脑力星球」的看图拼词中学会了好多新单词，快来一起玩！`}
      idleContent={
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">看图拼词</h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            看着可爱的图片，点击字母拼出正确的英文单词！
            <br />
            寓教于乐的语言启蒙第一课。
          </p>
        </>
      }
      playingContent={
        currentPuzzle && (
          <div className="w-full flex flex-col items-center">
            {/* Display Area */}
            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl w-full max-w-[320px] flex flex-col items-center mb-8 border-2 border-blue-100 shadow-sm">
              <motion.div
                key={currentPuzzle.word}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-8xl mb-2 drop-shadow-md"
              >
                {currentPuzzle.emoji}
              </motion.div>
              <div className="text-gray-500 font-bold mb-6">{currentPuzzle.zh}</div>

              {/* Answer Slots */}
              <div className="flex gap-2 min-h-[60px]">
                {Array.from({ length: currentPuzzle.word.length }).map((_, i) => {
                  const selected = selectedLetters[i];
                  return (
                    <div
                      key={i}
                      className={`w-12 h-14 rounded-xl flex items-center justify-center text-3xl font-black transition-all ${selected ? "bg-blue-500 text-white shadow-md transform scale-110" : "bg-gray-100 border-2 border-dashed border-gray-300 text-transparent"}`}
                    >
                      {selected ? selected.char : ""}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Input Letters */}
            <div className="flex flex-wrap justify-center gap-3 max-w-[320px] mb-8">
              <AnimatePresence>
                {shuffledLetters.map((char, index) => {
                  const isUsed = usedIndices.has(index);
                  return (
                    <motion.button
                      key={`${index}-${char}`}
                      whileHover={!isUsed ? { scale: 1.1 } : {}}
                      whileTap={!isUsed ? { scale: 0.9 } : {}}
                      onClick={() => handleLetterSelect(char, index)}
                      disabled={isUsed}
                      className={`w-14 h-16 rounded-2xl flex items-center justify-center text-3xl font-black transition-all shadow-sm
                        ${isUsed ? "bg-gray-100 text-gray-300 shadow-none" : "bg-white text-gray-800 hover:border-blue-300 border-2 border-transparent active:bg-blue-50"}`}
                    >
                      {char}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex justify-between w-full max-w-[320px]">
              <Button
                variant="ghost"
                className="text-gray-500 bg-white shadow-sm"
                onClick={handleUndo}
                disabled={selectedLetters.length === 0}
              >
                <Undo2 className="w-5 h-5 mr-1" /> 撤销
              </Button>
              <Button
                variant="ghost"
                className="text-blue-500 bg-blue-50 shadow-sm"
                onClick={generatePuzzle}
              >
                <RefreshCw className="w-5 h-5 mr-1" /> 跳过
              </Button>
            </div>
          </div>
        )
      }
    />
  );
}
