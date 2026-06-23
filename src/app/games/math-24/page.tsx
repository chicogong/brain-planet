"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, ArrowLeft, RefreshCw, Undo, HelpCircle } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

// A predefined set of easy and medium 24-point puzzles for kids
const PUZZLES = [
  [1, 2, 3, 4], // (1+2+3)*4=24
  [2, 3, 4, 6], // 6/(4-3)*2=12? No, 2*3*4? No, 4*6=24, 3-2=1
  [2, 2, 6, 6], // 2+2=4, 4*6=24
  [3, 4, 5, 6], // (5-3)*4*? No. 6/(5-4)*... 
  [1, 5, 5, 5], // 5*5-1^5? (5-1/5)*5=24
  [2, 3, 5, 8], // 3*8=24, 5-2=3... wait no.
  [4, 4, 4, 6], // 4+4+4+6=18. 6*4=24, 4/4=1
  [3, 3, 8, 8], // 8/(3-8/3)=24
  [1, 4, 5, 6], // 4/(1-5/6)=24
  [2, 4, 8, 8], // 8+8+2*4=24
];

type Operator = "+" | "-" | "×" | "÷" | null;

interface CardData {
  id: string;
  value: number;
  expression: string;
  used: boolean;
}

export default function Math24Game() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [history, setHistory] = useState<CardData[][]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<Operator>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const addPoints = useUserStore((state) => state.addPoints);

  const initGame = () => {
    // Generate 4 random numbers between 1 and 10 for true random, or pick from PUZZLES
    // For MVP we will use random 1-10 to allow the "refresh" mechanic
    const newCards = Array.from({ length: 4 }).map(() => {
      const val = Math.floor(Math.random() * 10) + 1;
      return {
        id: Math.random().toString(36).substr(2, 9),
        value: val,
        expression: String(val),
        used: false,
      };
    });
    setCards(newCards);
    setHistory([newCards]);
    setSelectedCardId(null);
    setSelectedOperator(null);
    setGameOver(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (id: string) => {
    const card = cards.find(c => c.id === id);
    if (!card || card.used) return;

    if (selectedCardId === null) {
      setSelectedCardId(id);
    } else if (selectedCardId === id) {
      setSelectedCardId(null); // deselect
    } else if (selectedOperator) {
      // Execute operation
      const card1 = cards.find(c => c.id === selectedCardId)!;
      const card2 = card;
      let newValue = 0;
      let newExpr = "";

      switch (selectedOperator) {
        case "+":
          newValue = card1.value + card2.value;
          newExpr = `(${card1.expression}+${card2.expression})`;
          break;
        case "-":
          // Prevent negative numbers to keep it simple for kids
          if (card1.value < card2.value) {
            newValue = card2.value - card1.value;
            newExpr = `(${card2.expression}-${card1.expression})`;
          } else {
            newValue = card1.value - card2.value;
            newExpr = `(${card1.expression}-${card2.expression})`;
          }
          break;
        case "×":
          newValue = card1.value * card2.value;
          newExpr = `(${card1.expression}×${card2.expression})`;
          break;
        case "÷":
          // Prevent fractional answers to keep it simple
          if (card1.value % card2.value === 0) {
            newValue = card1.value / card2.value;
            newExpr = `(${card1.expression}÷${card2.expression})`;
          } else if (card2.value % card1.value === 0) {
            newValue = card2.value / card1.value;
            newExpr = `(${card2.expression}÷${card1.expression})`;
          } else {
            // Invalid division for kids MVP
            return;
          }
          break;
      }

      const newCards = cards.map(c => {
        if (c.id === selectedCardId) {
          return { ...c, used: true };
        }
        if (c.id === id) {
          return { ...c, value: newValue, expression: newExpr };
        }
        return c;
      });

      setCards(newCards);
      setHistory([...history, newCards]);
      setSelectedCardId(null);
      setSelectedOperator(null);

      // Check win condition
      const activeCards = newCards.filter(c => !c.used);
      if (activeCards.length === 1 && Math.abs(activeCards[0].value - 24) < 0.001) {
        handleWin();
      }
    } else {
      // Just select the new card instead
      setSelectedCardId(id);
    }
  };

  const handleWin = () => {
    setGameOver(true);
    setScore(score + 10);
    addPoints(10);
    confetti({
      particleCount: 150,
      spread: 80,
      colors: ['#8B5CF6', '#F59E0B', '#10B981']
    });
  };

  const handleUndo = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setCards(newHistory[newHistory.length - 1]);
      setSelectedCardId(null);
      setSelectedOperator(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-8">
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
        </Link>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm font-bold text-gray-700">
            <Trophy className="w-5 h-5 text-purple-500" />
            {score}
          </div>
        </div>
      </div>

      <Card className="w-full max-w-md p-6 bg-white shadow-xl rounded-3xl border-4 border-purple-50 relative overflow-hidden min-h-[450px] flex flex-col">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-gray-800 flex items-center justify-center gap-2">
            <span className="text-4xl">🔢</span> 极限 24 点
          </h2>
          <p className="text-sm text-gray-500 mt-2">点击数字和符号，拼凑出 24 吧！</p>
        </div>

        <AnimatePresence mode="wait">
          {!gameOver ? (
            <motion.div 
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <div className="grid grid-cols-2 gap-4 mb-8">
                {cards.map((card) => !card.used && (
                  <motion.div
                    key={card.id}
                    layoutId={card.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCardClick(card.id)}
                    className={`
                      aspect-video flex flex-col items-center justify-center rounded-2xl cursor-pointer shadow-md border-b-4 transition-colors
                      ${selectedCardId === card.id 
                        ? "bg-purple-500 text-white border-purple-700" 
                        : "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200"}
                    `}
                  >
                    <span className="text-4xl font-black">{card.value}</span>
                    {card.expression !== String(card.value) && (
                      <span className="text-xs opacity-70 mt-1 truncate px-2 w-full text-center">
                        {card.expression}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Operators */}
              <div className="flex justify-center gap-4 mb-8">
                {["+", "-", "×", "÷"].map((op) => (
                  <Button
                    key={op}
                    size="icon"
                    variant={selectedOperator === op ? "default" : "outline"}
                    className={`w-14 h-14 rounded-full text-2xl font-bold shadow-sm
                      ${selectedOperator === op ? 'bg-orange-500 hover:bg-orange-600 text-white border-none' : 'text-gray-600'}
                    `}
                    onClick={() => setSelectedOperator(op as Operator)}
                  >
                    {op}
                  </Button>
                ))}
              </div>

              {/* Toolbar */}
              <div className="mt-auto flex justify-between">
                <Button variant="ghost" className="text-gray-500" onClick={handleUndo} disabled={history.length <= 1}>
                  <Undo className="w-5 h-5 mr-2" /> 撤销
                </Button>
                <Button variant="ghost" className="text-gray-500" onClick={initGame}>
                  <RefreshCw className="w-5 h-5 mr-2" /> 无解换题
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="win"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="text-7xl mb-2 animate-bounce">🎉</div>
              <h2 className="text-3xl font-black text-green-600">算得漂亮！</h2>
              <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-100 w-full">
                <p className="text-gray-500 mb-2">最终公式</p>
                <p className="text-xl font-bold text-purple-700 break-words">
                  {cards.find(c => !c.used)?.expression} = 24
                </p>
              </div>
              <Button onClick={initGame} size="lg" className="w-full rounded-full text-lg h-14 bg-purple-600 hover:bg-purple-700 shadow-lg">
                下一关
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
