"use client";

import { games } from "@/data/games";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { InstallBanner } from "@/components/InstallBanner";

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
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-800 mb-2 mt-4 tracking-tight">脑力星球</h2>
        <p className="text-gray-500 font-medium">每天 10 分钟，点亮五维脑力星图</p>
      </div>

      {/* Adventure Mode Entry */}
      <Link
        href="/adventure"
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 mb-10 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-between relative overflow-hidden group"
      >
        <div className="absolute -right-10 -top-10 opacity-20 group-hover:scale-110 transition-transform duration-700">
          <span className="text-[150px]">🚀</span>
        </div>
        <div className="relative z-10">
          <div className="bg-white/20 inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 backdrop-blur-sm">
            核心玩法
          </div>
          <h3 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">星际航线</h3>
          <p className="text-white/80 font-medium md:text-lg max-w-sm">
            按顺序解锁星球关卡，开启属于你的脑力探险之旅！
          </p>
        </div>
        <div className="hidden sm:flex relative z-10 w-16 h-16 bg-white/20 rounded-full items-center justify-center backdrop-blur-sm group-hover:bg-white group-hover:text-indigo-600 transition-colors">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="w-8 h-8 ml-1"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </Link>

      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="bg-green-100 text-green-600 p-1.5 rounded-lg text-sm">🌌</span>
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
              <div className="relative group opacity-60">
                <Card
                  className={`overflow-hidden border-2 border-transparent transition-all h-full`}
                >
                  <div
                    className={`p-8 flex flex-col items-center justify-center space-y-4 ${game.bgColor} h-40`}
                  >
                    <span className="text-5xl grayscale opacity-50">{game.icon}</span>
                  </div>
                  <div className="p-4 bg-white flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg text-gray-400">{game.name}</h3>
                      <p className="text-xs text-gray-400">{game.tags.join(" · ")}</p>
                    </div>
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                </Card>
              </div>
            ) : (
              <Link href={game.path} className="block h-full relative group">
                <Card
                  className={`overflow-hidden border-2 border-transparent hover:border-primary hover:shadow-xl transition-all h-full transform group-hover:-translate-y-1`}
                >
                  <div
                    className={`p-8 flex flex-col items-center justify-center space-y-4 ${game.bgColor} h-40`}
                  >
                    <motion.span className="text-5xl" whileHover={{ scale: 1.2, rotate: 5 }}>
                      {game.icon}
                    </motion.span>
                  </div>
                  <div className="p-4 bg-white flex flex-col justify-between h-28">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                          {game.name}
                        </h3>
                        {game.isNew && (
                          <Badge className="bg-orange-500 hover:bg-orange-600">NEW</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{game.tags.join(" · ")}</p>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className={game.textColor}>{game.difficulty}</span>
                      <span className="text-muted-foreground">{game.category}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            )}
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-12 flex justify-center">
        <Link
          href="/parents"
          className="flex items-center gap-2 px-6 py-3 bg-purple-50 text-purple-600 rounded-full font-bold shadow-sm hover:bg-purple-100 transition-all active:scale-95"
        >
          <Lock className="w-4 h-4" /> 家长专属看板
        </Link>
      </div>
    </div>
  );
}
