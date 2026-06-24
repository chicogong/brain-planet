"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GameContainer } from "@/components/GameContainer";
import { useGameSession } from "@/hooks/useGameSession";
import { playSound, vibrate } from "@/lib/audio";
import { tts } from "@/lib/tts";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

interface Cell {
  x: number;
  y: number;
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
  visited: boolean;
}

const MAZE_SIZE = 8; // 8x8 maze for kids

export default function MazeGame() {
  const [maze, setMaze] = useState<Cell[][]>([]);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const goalPos = { x: MAZE_SIZE - 1, y: MAZE_SIZE - 1 };

  const { gameState, score, initGame, handleCorrect, setGameState } = useGameSession({
    gameId: "maze",
    winCondition: (_, totalCorrect) => totalCorrect >= 1, // Win per maze
  });

  const generateMaze = useCallback(() => {
    // Initialize empty grid with all walls
    const grid: Cell[][] = [];
    for (let y = 0; y < MAZE_SIZE; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < MAZE_SIZE; x++) {
        row.push({
          x,
          y,
          walls: { top: true, right: true, bottom: true, left: true },
          visited: false,
        });
      }
      grid.push(row);
    }

    // DFS Maze Generation
    const stack: Cell[] = [];
    const startCell = grid[0][0];
    startCell.visited = true;
    stack.push(startCell);

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = [];

      // Check unvisited neighbors
      if (current.y > 0 && !grid[current.y - 1][current.x].visited)
        neighbors.push({ dir: "top", cell: grid[current.y - 1][current.x] });
      if (current.x < MAZE_SIZE - 1 && !grid[current.y][current.x + 1].visited)
        neighbors.push({ dir: "right", cell: grid[current.y][current.x + 1] });
      if (current.y < MAZE_SIZE - 1 && !grid[current.y + 1][current.x].visited)
        neighbors.push({ dir: "bottom", cell: grid[current.y + 1][current.x] });
      if (current.x > 0 && !grid[current.y][current.x - 1].visited)
        neighbors.push({ dir: "left", cell: grid[current.y][current.x - 1] });

      if (neighbors.length > 0) {
        // Choose random neighbor
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];

        // Remove walls
        if (next.dir === "top") {
          current.walls.top = false;
          next.cell.walls.bottom = false;
        } else if (next.dir === "right") {
          current.walls.right = false;
          next.cell.walls.left = false;
        } else if (next.dir === "bottom") {
          current.walls.bottom = false;
          next.cell.walls.top = false;
        } else if (next.dir === "left") {
          current.walls.left = false;
          next.cell.walls.right = false;
        }

        next.cell.visited = true;
        stack.push(next.cell);
      } else {
        stack.pop();
      }
    }

    setMaze(grid);
    setPlayerPos({ x: 0, y: 0 });
    tts.speak("冲破迷宫，找到能量球！");
  }, []);

  const handleStart = () => {
    initGame();
    generateMaze();
  };

  const movePlayer = useCallback(
    (dx: number, dy: number) => {
      if (gameState !== "playing" || maze.length === 0) return;

      setPlayerPos((prev) => {
        const cell = maze[prev.y][prev.x];
        let canMove = false;

        if (dy === -1 && !cell.walls.top) canMove = true;
        if (dx === 1 && !cell.walls.right) canMove = true;
        if (dy === 1 && !cell.walls.bottom) canMove = true;
        if (dx === -1 && !cell.walls.left) canMove = true;

        if (canMove) {
          playSound.pop();
          const newPos = { x: prev.x + dx, y: prev.y + dy };

          // Check win
          if (newPos.x === goalPos.x && newPos.y === goalPos.y) {
            setTimeout(() => handleCorrect(), 100);
          }

          return newPos;
        } else {
          vibrate(20);
          return prev;
        }
      });
    },
    [gameState, maze, goalPos, handleCorrect]
  );

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        movePlayer(0, -1);
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        movePlayer(0, 1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        movePlayer(-1, 0);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        movePlayer(1, 0);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movePlayer]);

  return (
    <GameContainer
      title="星际迷宫追踪"
      gameState={gameState}
      score={score}
      emojiIcon="🛸"
      themeColor="purple"
      onStart={handleStart}
      winMessage="成功寻宝！"
      shareText={`我在「脑力星球」打通了星际迷宫，快来挑战你的空间方向感！`}
      idleContent={
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">星际迷宫追踪</h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            控制飞船穿越重重陨石墙，抵达闪亮的能量核心！
            <br />
            锻炼空间感和统筹规划能力。
          </p>
        </>
      }
      playingContent={
        <div className="w-full flex flex-col items-center">
          {/* Maze Grid */}
          <div className="bg-purple-900 p-2 rounded-xl mb-6 shadow-xl w-full max-w-[320px] aspect-square relative">
            <div
              className="w-full h-full grid"
              style={{
                gridTemplateColumns: `repeat(${MAZE_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${MAZE_SIZE}, 1fr)`,
              }}
            >
              {maze.map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${x}-${y}`}
                    className="relative flex items-center justify-center"
                    style={{
                      borderTop: cell.walls.top ? "2px solid #a855f7" : "1px solid transparent",
                      borderRight: cell.walls.right ? "2px solid #a855f7" : "1px solid transparent",
                      borderBottom: cell.walls.bottom
                        ? "2px solid #a855f7"
                        : "1px solid transparent",
                      borderLeft: cell.walls.left ? "2px solid #a855f7" : "1px solid transparent",
                    }}
                  >
                    {/* Goal */}
                    {x === goalPos.x && y === goalPos.y && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="text-2xl z-0"
                      >
                        ⭐
                      </motion.div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Player Overlay */}
            {maze.length > 0 && (
              <motion.div
                className="absolute text-2xl z-10 pointer-events-none flex items-center justify-center"
                initial={false}
                animate={{
                  x: `calc(${playerPos.x * 100}% + ${playerPos.x * 0}px)`,
                  y: `calc(${playerPos.y * 100}% + ${playerPos.y * 0}px)`,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  width: `calc(100% / ${MAZE_SIZE} - 4px)`, // -4px for borders
                  height: `calc(100% / ${MAZE_SIZE} - 4px)`,
                  left: 10, // match padding
                  top: 10,
                }}
              >
                🚀
              </motion.div>
            )}
          </div>

          {/* D-Pad Controls for Touch Devices */}
          <div className="grid grid-cols-3 gap-2 max-w-[200px] mb-4">
            <div></div>
            <Button
              variant="outline"
              className="h-16 w-16 bg-white shadow-sm border-purple-200 text-purple-700 active:bg-purple-100"
              onClick={() => movePlayer(0, -1)}
            >
              <ArrowUp className="w-8 h-8" />
            </Button>
            <div></div>
            <Button
              variant="outline"
              className="h-16 w-16 bg-white shadow-sm border-purple-200 text-purple-700 active:bg-purple-100"
              onClick={() => movePlayer(-1, 0)}
            >
              <ArrowLeft className="w-8 h-8" />
            </Button>
            <Button
              variant="outline"
              className="h-16 w-16 bg-white shadow-sm border-purple-200 text-purple-700 active:bg-purple-100"
              onClick={() => movePlayer(0, 1)}
            >
              <ArrowDown className="w-8 h-8" />
            </Button>
            <Button
              variant="outline"
              className="h-16 w-16 bg-white shadow-sm border-purple-200 text-purple-700 active:bg-purple-100"
              onClick={() => movePlayer(1, 0)}
            >
              <ArrowRight className="w-8 h-8" />
            </Button>
          </div>
        </div>
      }
    />
  );
}
