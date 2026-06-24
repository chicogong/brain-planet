"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { GameContainer } from "@/components/GameContainer";
import { useGameSession } from "@/hooks/useGameSession";
import { playSound, vibrate } from "@/lib/audio";
import { tts } from "@/lib/tts";

const EMOJIS = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮"];

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [pairsToPlay, setPairsToPlay] = useState(6);

  const { gameState, score, initGame, handleCorrect, handleWrong, setGameState } = useGameSession({
    gameId: "memory",
    winCondition: (_, totalCorrect) => totalCorrect >= pairsToPlay,
    onWin: () => {
      if (pairsToPlay === 8) {
        // We could unlock a badge here for hard mode if needed
      }
    },
  });

  const generateCards = useCallback(() => {
    const selectedEmojis = EMOJIS.slice(0, pairsToPlay);
    const gameEmojis = [...selectedEmojis, ...selectedEmojis];
    // Shuffle
    for (let i = gameEmojis.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameEmojis[i], gameEmojis[j]] = [gameEmojis[j], gameEmojis[i]];
    }

    setCards(
      gameEmojis.map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }))
    );
  }, [pairsToPlay]);

  const handleStart = () => {
    initGame();
    generateCards();
    setFlippedIndices([]);
    setMoves(0);
    tts.speak(pairsToPlay === 6 ? "翻开两张相同的卡片即可消除！" : "困难模式，看你的记忆力咯！");
  };

  const handleCardClick = (index: number) => {
    if (gameState !== "playing") return;
    if (cards[index].isFlipped || cards[index].isMatched) return;
    if (flippedIndices.length === 2) return; // Wait for animation

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIndex, secondIndex] = newFlipped;
      if (cards[firstIndex].emoji === cards[secondIndex].emoji) {
        // Match
        setTimeout(() => {
          setCards((prev) => {
            const matched = [...prev];
            matched[firstIndex].isMatched = true;
            matched[secondIndex].isMatched = true;
            return matched;
          });
          setFlippedIndices([]);
          handleCorrect();
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) => {
            const reset = [...prev];
            reset[firstIndex].isFlipped = false;
            reset[secondIndex].isFlipped = false;
            return reset;
          });
          setFlippedIndices([]);
          handleWrong();
        }, 1000);
      }
    }
  };

  return (
    <GameContainer
      title="记忆翻牌"
      gameState={gameState}
      emojiIcon="🦊"
      themeColor="orange"
      onStart={handleStart}
      winMessage="记忆力大师！"
      shareText={`我在「脑力星球」的记忆大挑战中，只用了 ${moves} 步就找出了所有动物！你能超越我吗？`}
      idleContent={
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">记忆翻牌</h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            翻开两张相同的卡片即可消除。考验你瞬间记忆力的时候到了！
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setPairsToPlay(6)}
              className={`px-4 py-2 rounded-full font-bold transition-all ${pairsToPlay === 6 ? "bg-orange-500 text-white shadow-md" : "bg-orange-100 text-orange-600"}`}
            >
              简单 (12张)
            </button>
            <button
              onClick={() => setPairsToPlay(8)}
              className={`px-4 py-2 rounded-full font-bold transition-all ${pairsToPlay === 8 ? "bg-orange-500 text-white shadow-md" : "bg-orange-100 text-orange-600"}`}
            >
              困难 (16张)
            </button>
          </div>
        </>
      }
      playingContent={
        <div className="w-full flex flex-col items-center">
          <div className="flex justify-between w-full mb-8 px-4 max-w-[500px]">
            <div className="bg-white border border-gray-100 shadow-sm text-gray-500 px-4 py-2 rounded-2xl font-bold">
              步数: <span className="text-orange-500">{moves}</span>
            </div>
            <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-2xl font-bold">
              得分: {score}
            </div>
          </div>

          <div
            className="grid gap-2 sm:gap-3 w-full"
            style={{
              gridTemplateColumns: `repeat(${pairsToPlay === 6 ? 3 : 4}, minmax(0, 1fr))`,
              maxWidth: pairsToPlay === 6 ? "350px" : "450px",
            }}
          >
            {cards.map((card, i) => (
              <div
                key={card.id}
                className="relative aspect-[3/4] cursor-pointer"
                style={{ perspective: "1000px" }}
                onClick={() => handleCardClick(i)}
              >
                <motion.div
                  className="w-full h-full relative"
                  style={{ transformStyle: "preserve-3d" }}
                  initial={false}
                  animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
                >
                  {/* Back of card (visible when face down) */}
                  <div
                    className="absolute w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl shadow-md border-4 border-white flex items-center justify-center"
                    style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                  >
                    <span className="text-white opacity-50 text-2xl font-black">?</span>
                  </div>

                  {/* Front of card (visible when face up) */}
                  <div
                    className={`absolute w-full h-full bg-white rounded-2xl shadow-sm border-2 flex items-center justify-center text-4xl sm:text-5xl
                      ${card.isMatched ? "border-green-400 shadow-green-100" : "border-gray-100"}
                    `}
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <motion.div
                      animate={card.isMatched ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.5 }}
                      className={card.isMatched ? "opacity-50" : "opacity-100"}
                    >
                      {card.emoji}
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
