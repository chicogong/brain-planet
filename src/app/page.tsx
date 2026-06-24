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
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  return (
    <div className="flex-1 flex flex-col pt-4 pb-12">
      <div className="text-center mb-10 space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          欢迎来到 <span className="text-primary">脑力星球</span> 🪐
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          专为 3-12 岁儿童设计的益智游戏站。无广告，免登陆，随时随地开启脑力挑战！
        </p>
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
                <Card className={`overflow-hidden border-2 border-transparent transition-all h-full`}>
                  <div className={`p-8 flex flex-col items-center justify-center space-y-4 ${game.bgColor} h-40`}>
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
                <Card className={`overflow-hidden border-2 border-transparent hover:border-primary hover:shadow-xl transition-all h-full transform group-hover:-translate-y-1`}>
                  <div className={`p-8 flex flex-col items-center justify-center space-y-4 ${game.bgColor} h-40`}>
                    <motion.span 
                      className="text-5xl"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                    >
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
        <Link href="/parents" className="flex items-center gap-2 px-6 py-3 bg-purple-50 text-purple-600 rounded-full font-bold shadow-sm hover:bg-purple-100 transition-all active:scale-95">
          <Lock className="w-4 h-4" /> 家长专属看板
        </Link>
      </div>
    </div>
  );
}
