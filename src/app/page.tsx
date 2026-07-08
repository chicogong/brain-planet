"use client";

import { games } from "@/data/games";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { InstallBanner } from "@/components/InstallBanner";
import { DailyMissionCard } from "@/components/DailyMissionCard";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <div className="flex-1 flex flex-col pt-4 pb-12">
      <div className="text-center mb-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-400/20 blur-3xl rounded-full -z-10"></div>
        <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-800 to-purple-600 mb-3 mt-6 tracking-tight drop-shadow-sm">
          脑力星球
        </h2>
        <p className="text-indigo-600/80 font-semibold md:text-lg">
          每天 10 分钟，点亮五维脑力星图 ✨
        </p>
      </div>

      <DailyMissionCard />

      <Link
        href="/adventure"
        className="w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 mb-12 text-white shadow-[0_20px_40px_-15px_rgba(99,102,241,0.5)] hover:shadow-[0_25px_50px_-12px_rgba(99,102,241,0.6)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] flex items-center justify-between relative overflow-hidden group border border-white/20"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute -right-10 -top-10 opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
          <span className="text-[150px] drop-shadow-2xl">🚀</span>
        </div>
        <div className="relative z-10">
          <div className="bg-white/20 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4  border border-white/30 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            核心玩法
          </div>
          <h3 className="text-3xl md:text-5xl font-black mb-3 tracking-tight drop-shadow-md">
            星际航线
          </h3>
          <p className="text-white/90 font-medium md:text-lg max-w-sm drop-shadow-sm leading-relaxed">
            按顺序解锁星球关卡，开启属于你的脑力探险之旅！
          </p>
        </div>
        <div className="hidden sm:flex relative z-10 w-16 h-16 bg-white/20 rounded-full items-center justify-center  border border-white/30 group-hover:bg-white group-hover:text-purple-600 transition-colors shadow-lg">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="w-8 h-8 ml-1 transform group-hover:translate-x-1 transition-transform"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </Link>

      <div className="flex items-center justify-between mb-6 px-2">
        <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-600 flex items-center gap-3 drop-shadow-sm">
          <span className="bg-gradient-to-br from-indigo-100 to-purple-100 shadow-sm border border-white p-2 rounded-xl text-lg">
            🌌
          </span>
          自由探索区
        </h3>
      </div>

      <InstallBanner />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {games.map((game) => (
          <motion.div key={game.id} variants={item}>
            {game.locked ? (
              <div className="relative group opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                <Card
                  className={`overflow-hidden border border-white/50 bg-white/40  shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full rounded-3xl`}
                >
                  <div
                    className={`p-8 flex flex-col items-center justify-center space-y-4 ${game.bgColor} h-44 bg-opacity-40`}
                  >
                    <span className="text-6xl opacity-40">{game.icon}</span>
                  </div>
                  <div className="p-5 flex justify-between items-center border-t border-white/50 bg-white/50">
                    <div>
                      <h3 className="font-bold text-lg text-gray-500">{game.name}</h3>
                      <p className="text-xs text-gray-400 font-medium">{game.tags.join(" · ")}</p>
                    </div>
                    <div className="bg-gray-100/80 p-2 rounded-full border border-gray-200">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Link href={game.path} className="block h-full relative group">
                <Card
                  className={`overflow-hidden border border-white/60 bg-white/60  shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:border-white transition-all duration-300 h-full transform group-hover:-translate-y-2 rounded-3xl`}
                >
                  <div
                    className={`p-8 flex flex-col items-center justify-center space-y-4 ${game.bgColor} h-44 relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                    <motion.span
                      className="text-6xl relative z-10 drop-shadow-lg"
                      whileHover={{
                        scale: 1.15,
                        rotate: [0, -10, 10, -5, 5, 0],
                        transition: { duration: 0.5 },
                      }}
                    >
                      {game.icon}
                    </motion.span>
                  </div>
                  <div className="p-5 flex flex-col justify-between h-32 border-t border-white/60 bg-white/40">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-black text-lg text-gray-800 group-hover:text-indigo-600 transition-colors">
                          {game.name}
                        </h3>
                        {game.isNew && (
                          <Badge className="bg-gradient-to-r from-orange-400 to-rose-500 text-white border-0 shadow-sm shadow-orange-200">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-medium mb-3">
                        {game.tags.join(" · ")}
                      </p>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span
                        className={`${game.textColor} bg-white/50 px-2 py-1 rounded-md border border-white`}
                      >
                        {game.difficulty}
                      </span>
                      <span className="text-gray-400 font-semibold">{game.category}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            )}
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-14 flex justify-center">
        <Link
          href="/parents"
          className="flex items-center gap-2 px-8 py-3.5 bg-white/80  border border-purple-100 text-purple-600 rounded-full font-bold shadow-lg shadow-purple-500/10 hover:shadow-xl hover:bg-white hover:-translate-y-1 transition-all duration-300 active:scale-95 group"
        >
          <Lock className="w-4 h-4 group-hover:animate-bounce" /> 家长专属看板
        </Link>
      </div>
    </div>
  );
}
