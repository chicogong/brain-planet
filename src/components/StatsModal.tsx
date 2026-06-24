"use client";

import { useUserStore } from "@/store/useUserStore";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Flame, X, BarChart2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function StatsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const points = useStore(useUserStore, (state) => state.points);
  const streakDays = useStore(useUserStore, (state) => state.streakDays);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 sm:gap-3 transition-transform active:scale-95 hover:opacity-80"
      >
        <div
          className="flex items-center bg-orange-100 text-orange-600 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-sm"
          title="连胜天数"
        >
          <Flame className="w-4 h-4 sm:mr-1" />
          {streakDays ?? 0} <span className="hidden sm:inline ml-1">天</span>
        </div>
        <div
          className="flex items-center bg-yellow-100 text-yellow-600 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-sm"
          title="总积分"
        >
          <Star className="w-4 h-4 mr-1 fill-yellow-600" />
          {points ?? 0}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-gray-800">我的战绩</h2>
                <p className="text-gray-500 text-sm mt-1">每次玩游戏都会增加积分哦！</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-yellow-50 rounded-2xl p-4 flex flex-col items-center justify-center">
                  <Star className="w-8 h-8 text-yellow-500 fill-yellow-500 mb-2" />
                  <span className="text-3xl font-black text-yellow-600">{points ?? 0}</span>
                  <span className="text-xs font-bold text-yellow-600/70 mt-1">总积分</span>
                </div>
                <div className="bg-orange-50 rounded-2xl p-4 flex flex-col items-center justify-center">
                  <Flame className="w-8 h-8 text-orange-500 mb-2" />
                  <span className="text-3xl font-black text-orange-600">{streakDays ?? 0}</span>
                  <span className="text-xs font-bold text-orange-600/70 mt-1">连胜天数</span>
                </div>
              </div>

              <Link
                href="/parents"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-indigo-500 text-white font-bold py-4 rounded-2xl hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/30"
              >
                <BarChart2 className="w-5 h-5" />
                查看能力雷达图 (家长)
              </Link>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
