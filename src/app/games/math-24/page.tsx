"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Undo, RefreshCw } from "lucide-react";
import { GameContainer } from "@/components/GameContainer";
import { useGameSession } from "@/hooks/useGameSession";
import { tts } from "@/lib/tts";

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

  const {
    gameState,
    score,
    initGame,
    handleCorrect,
  } = useGameSession({
    gameId: "math-24",
    winCondition: (_, totalCorrect) => totalCorrect >= 1, // Win per puzzle
  });

  const handleStart = () => {
    initGame();
    generatePuzzle();
    tts.speak("把卡片组合起来，算出24！");
  };

  const generatePuzzle = () => {
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
  };

  const handleCardClick = (id: string) => {
    if (gameState !== "playing") return;
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
          // Prevent negative numbers
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
          // Prevent fractional answers
          if (card1.value % card2.value === 0) {
            newValue = card1.value / card2.value;
            newExpr = `(${card1.expression}÷${card2.expression})`;
          } else if (card2.value % card1.value === 0) {
            newValue = card2.value / card1.value;
            newExpr = `(${card2.expression}÷${card1.expression})`;
          } else {
            return; // Invalid division
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
        handleCorrect();
      }
    } else {
      setSelectedCardId(id);
    }
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

  const finalExpression = cards.find(c => !c.used)?.expression;

  return (
    <GameContainer
      title="极限 24 点"
      gameState={gameState}
      score={score}
      emojiIcon="🔢"
      themeColor="purple"
      onStart={handleStart}
      winMessage="算得漂亮！"
      shareText={`我在「脑力星球」成功解出了一道极限 24 点！快来看看你能算出来吗？`}
      wonContent={
        finalExpression ? (
          <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-100 text-center w-full">
            <p className="text-gray-500 mb-2">最终公式</p>
            <p className="text-xl font-bold text-purple-700 break-words">
              {finalExpression} = 24
            </p>
          </div>
        ) : null
      }
      idleContent={
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">极限 24 点</h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            通过加减乘除，把4个数字拼凑出结果为 24 的等式！<br/>考验逻辑与数学运算能力。
          </p>
        </>
      }
      playingContent={
        <div className="w-full flex flex-col items-center h-full max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-4 mb-8 w-full">
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
          <div className="mt-auto flex justify-between w-full">
            <Button variant="ghost" className="text-gray-500 bg-white" onClick={handleUndo} disabled={history.length <= 1}>
              <Undo className="w-5 h-5 mr-2" /> 撤销
            </Button>
            <Button variant="ghost" className="text-gray-500 bg-white" onClick={generatePuzzle}>
              <RefreshCw className="w-5 h-5 mr-2" /> 换一题
            </Button>
          </div>
        </div>
      }
    />
  );
}
