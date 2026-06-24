"use client";

import { useState } from "react";
import { useUserStore, AVAILABLE_BADGES } from "@/store/useUserStore";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { ArrowLeft, Lock, BarChart3, Medal, Brain, Activity, Target, Compass } from "lucide-react";
import { games } from "@/data/games";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  PolarRadiusAxis,
  Tooltip,
} from "recharts";

export default function ParentsDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState(false);

  // Math problem for parent gate
  const [num1] = useState(Math.floor(Math.random() * 5) + 6); // 6-10
  const [num2] = useState(Math.floor(Math.random() * 5) + 6); // 6-10
  const correctAnswer = num1 * num2;

  // Store data
  const store = useStore(useUserStore, (state) => state);
  const points = store?.points || 0;
  const streakDays = store?.streakDays || 0;
  const gameStats = store?.gameStats || {};
  const unlockedBadges = store?.unlockedBadges || [];

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(answer) === correctAnswer) {
      setIsAuthenticated(true);
    } else {
      setError(true);
      setAnswer("");
      setTimeout(() => setError(false), 2000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center max-w-md mx-auto w-full pt-12 px-4">
        <div className="w-full flex justify-between items-center mb-12">
          <Link
            href="/"
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-400">家长中心</h1>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">家长验证</h2>
          <p className="text-gray-500 mb-8 text-sm">为了防止孩子误入，请回答以下乘法题：</p>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="text-4xl font-black text-indigo-600">
              {num1} × {num2} = ?
            </div>
            <input
              type="number"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className={`w-full text-center text-3xl font-bold p-4 border-2 rounded-2xl focus:outline-none transition-colors ${
                error
                  ? "border-red-500 bg-red-50 text-red-500"
                  : "border-gray-200 focus:border-indigo-500"
              }`}
              placeholder="输入答案"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm font-bold">答案错误，请重试</p>}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-indigo-500/30"
            >
              验证进入
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Calculate radar chart / stats data
  const dimensionStats = {
    逻辑思维: 0,
    记忆认知: 0,
    专注反应: 0,
    空间观察: 0,
    艺术启蒙: 0,
  };

  const dimensionMapping: Record<string, keyof typeof dimensionStats> = {
    "math-24": "逻辑思维",
    sudoku: "逻辑思维",
    "pattern-master": "逻辑思维",
    memory: "记忆认知",
    "color-match": "记忆认知",
    schulte: "专注反应",
    "whack-a-mole": "专注反应",
    "shadow-match": "空间观察",
    piano: "艺术启蒙",
  };

  Object.entries(gameStats).forEach(([gameId, count]) => {
    const dim = dimensionMapping[gameId];
    if (dim) {
      dimensionStats[dim] += count;
    }
  });

  const maxStat = Math.max(...Object.values(dimensionStats), 10);
  const chartData = Object.entries(dimensionStats).map(([subject, val]) => ({
    subject,
    // Add a base value so the radar chart doesn't look empty when they just started
    value: val + Math.floor(maxStat * 0.2),
    fullMark: maxStat * 1.2,
    actual: val,
  }));

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto w-full px-4 pb-12">
      <div className="w-full flex items-center mb-8 sticky top-0 bg-gray-50/80 backdrop-blur-md py-4 z-10">
        <Link
          href="/"
          className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors mr-4"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-800">成长数据中心</h1>
          <p className="text-sm text-gray-500">所有数据仅在本地保存，保护孩子隐私</p>
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
          <Activity className="w-8 h-8 text-blue-500 mb-2" />
          <div className="text-3xl font-black text-gray-800">{streakDays}</div>
          <div className="text-sm text-gray-500 font-medium">连续学习天数</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
          <Target className="w-8 h-8 text-yellow-500 mb-2" />
          <div className="text-3xl font-black text-gray-800">{points}</div>
          <div className="text-sm text-gray-500 font-medium">累积星光币</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
          <Brain className="w-8 h-8 text-purple-500 mb-2" />
          <div className="text-3xl font-black text-gray-800">{Object.keys(gameStats).length}</div>
          <div className="text-sm text-gray-500 font-medium">接触的游戏数</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
          <Medal className="w-8 h-8 text-teal-500 mb-2" />
          <div className="text-3xl font-black text-gray-800">{unlockedBadges.length}</div>
          <div className="text-sm text-gray-500 font-medium">已解锁徽章</div>
        </div>
      </div>

      {/* Radar Chart Section */}
      <div className="w-full bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Compass className="w-6 h-6 text-indigo-500" />
          <h2 className="text-xl font-bold text-gray-800">多元能力雷达图</h2>
          <p className="text-sm text-gray-400 ml-auto hidden sm:block">
            基于各维度游戏的游玩频次综合测算
          </p>
        </div>
        <div className="w-full h-[300px] sm:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#4b5563", fontWeight: "bold", fontSize: 14 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, "dataMax"]} tick={false} axisLine={false} />
              <Tooltip
                formatter={(value: any, name: any, props: any) => [
                  props.payload.actual + " 次训练",
                  "游玩频次",
                ]}
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
              />
              <Radar
                name="能力值"
                dataKey="value"
                stroke="#6366f1"
                fill="#818cf8"
                fillOpacity={0.5}
                activeDot={{ r: 6, fill: "#4f46e5" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Play History */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-6 h-6 text-indigo-500" />
            <h2 className="text-xl font-bold text-gray-800">游戏偏好统计</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(gameStats).length === 0 ? (
              <p className="text-gray-400 text-center py-8">暂无游玩数据</p>
            ) : (
              Object.entries(gameStats)
                .sort(([, a], [, b]) => b - a)
                .map(([gameId, count]) => {
                  const game = games.find((g) => g.id === gameId);
                  const maxCount = Math.max(...Object.values(gameStats));
                  const percentage = Math.round((count / maxCount) * 100);

                  return (
                    <div key={gameId} className="flex items-center gap-4">
                      <div className="w-8 h-8 flex items-center justify-center text-xl bg-gray-100 rounded-xl shrink-0">
                        {game?.icon || "🎮"}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-bold text-gray-700">{game?.name || gameId}</span>
                          <span className="text-gray-500 font-medium">{count} 次</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Badges Overview */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Medal className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-gray-800">成就解锁进度</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {AVAILABLE_BADGES.map((badge) => {
              const isUnlocked = unlockedBadges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`flex items-center gap-3 p-3 rounded-2xl border ${isUnlocked ? "border-gray-100 bg-gray-50" : "border-transparent opacity-50 grayscale"}`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isUnlocked ? badge.color : "bg-gray-200"}`}
                  >
                    {badge.icon}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{badge.name}</div>
                    <div className="text-xs text-gray-500">{badge.description}</div>
                  </div>
                  {isUnlocked && (
                    <div className="ml-auto text-green-500 text-sm font-bold">已解锁</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
