"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Trophy, Share2 } from "lucide-react";
import confetti from "canvas-confetti";
import { playSound, vibrate } from "@/lib/audio";

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
  const [gameState, setGameState] = useState<"idle" | "playing" | "won">("idle");
  const [pairsToPlay, setPairsToPlay] = useState(6); // 12 cards total

  const addPoints = useUserStore((state) => state.addPoints);

  const initGame = useCallback(() => {
    const selectedEmojis = EMOJIS.slice(0, pairsToPlay);
    const gameEmojis = [...selectedEmojis, ...selectedEmojis];
    // Shuffle
    for (let i = gameEmojis.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameEmojis[i], gameEmojis[j]] = [gameEmojis[j], gameEmojis[i]];
    }
    
    const newCards = gameEmojis.map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    }));

    setCards(newCards);
    setFlippedIndices([]);
    setMoves(0);
    setGameState("playing");
  }, [pairsToPlay]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCardClick = (index: number) => {
    if (gameState === "won") return;
    if (cards[index].isFlipped || cards[index].isMatched) return;
    if (flippedIndices.length === 2) return; // Wait for animation

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);
    
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstIndex, secondIndex] = newFlipped;
      if (cards[firstIndex].emoji === cards[secondIndex].emoji) {
        // Match!
        setTimeout(() => {
          setCards(prev => {
            const matched = [...prev];
            matched[firstIndex].isMatched = true;
            matched[secondIndex].isMatched = true;
            return matched;
          });
          setFlippedIndices([]);
          playSound.pop();
          vibrate(50);
          
          // Check win
          if (newCards.every((c, i) => i === firstIndex || i === secondIndex || c.isMatched)) {
            setGameState("won");
            addPoints(60);
            playSound.cheer();
            vibrate([100, 50, 100, 50, 200]);
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => {
            const reset = [...prev];
            reset[firstIndex].isFlipped = false;
            reset[secondIndex].isFlipped = false;
            return reset;
          });
          setFlippedIndices([]);
          playSound.error();
          vibrate([50, 50, 50]);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full px-4">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setPairsToPlay(6)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${pairsToPlay === 6 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}
          >
            简单 (12张)
          </button>
          <button 
            onClick={() => setPairsToPlay(8)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${pairsToPlay === 8 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}
          >
            困难 (16张)
          </button>
        </div>
        <button onClick={initGame} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-gray-800 mb-2">记忆翻牌</h1>
        <p className="text-gray-500 font-medium">翻开两张相同的卡片即可消除</p>
        
        <div className="mt-4 inline-block bg-white px-6 py-2 rounded-full shadow-sm border border-gray-100">
          <span className="text-gray-500 font-bold mr-2">步数:</span>
          <span className="text-2xl font-black text-orange-500">{moves}</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center mb-12">
        <div 
          className="grid gap-3 sm:gap-4 w-full"
          style={{ 
            gridTemplateColumns: `repeat(${pairsToPlay === 6 ? 3 : 4}, minmax(0, 1fr))`,
            maxWidth: pairsToPlay === 6 ? '400px' : '500px'
          }}
        >
          {cards.map((card, i) => (
            <div 
              key={card.id} 
              className="relative aspect-[3/4] cursor-pointer perspective-1000"
              onClick={() => handleCardClick(i)}
            >
              <motion.div
                className="w-full h-full relative preserve-3d"
                initial={false}
                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
              >
                {/* Back of card (visible when face down) */}
                <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl shadow-md border-4 border-white flex items-center justify-center">
                  <span className="text-white opacity-50 text-2xl font-black">?</span>
                </div>
                
                {/* Front of card (visible when face up) */}
                <div 
                  className={`absolute w-full h-full backface-hidden rotate-y-180 bg-white rounded-2xl shadow-lg border-2 flex items-center justify-center text-5xl sm:text-6xl
                    ${card.isMatched ? 'border-green-400 shadow-green-100' : 'border-gray-100'}
                  `}
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

      <AnimatePresence>
        {gameState === "won" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm"
          >
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-sm w-full">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-yellow-500" />
              </div>
              <h2 className="text-3xl font-black text-gray-800 mb-2">太强了！</h2>
              <p className="text-gray-500 font-medium mb-6">
                你只用了 <span className="text-orange-500 font-bold text-xl">{moves}</span> 步就找出了所有动物！<br/>
                记忆力大师非你莫属。
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={async () => {
                    const text = `我刚才在「脑力星球」的记忆大挑战中，只用了 ${moves} 步就通关了！你能超越我吗？快来试试！`;
                    if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
                      try { await navigator.share({ title: '脑力星球 - 战绩分享', text, url: window.location.origin }); } catch(e) {}
                    } else {
                      navigator.clipboard.writeText(text + ' ' + window.location.origin);
                      alert('战绩已复制到剪贴板！');
                    }
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" /> 分享战绩
                </button>
                <button
                  onClick={initGame}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-orange-500/30"
                >
                  挑战更高难度
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
