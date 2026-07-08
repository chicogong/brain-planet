"use client";
import { motion } from "framer-motion";
import { Flame, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export function DailyMissionCard() {
  const [mounted, setMounted] = useState(false);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Mock progress for MVP
    const val = parseInt(localStorage.getItem("aimake_daily_progress") || "0");
    setCompleted(val);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-6 md:p-8 text-white shadow-[0_12px_40px_-15px_rgba(249,115,22,0.6)] mb-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
    >
      <div className="absolute -right-4 -top-8 text-[120px] opacity-20 rotate-12 pointer-events-none drop-shadow-2xl">
        🔥
      </div>
      <div className="relative z-10 flex-1">
        <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-sm font-bold mb-3  shadow-inner border border-white/30">
          <Flame size={16} className="text-yellow-300 animate-pulse" />
          今日 10 分钟训练
        </div>
        <h3 className="text-2xl md:text-3xl font-black mb-2 tracking-tight drop-shadow-md">
          点亮五维脑力星图
        </h3>
        <p className="text-white/90 font-medium drop-shadow-sm">
          每天完成 3 个随机训练，保持小脑瓜活跃！
        </p>

        <div className="mt-5 flex gap-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-2.5 flex-1 rounded-full shadow-inner transition-colors duration-500 ${completed >= step ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "bg-white/20"}`}
            ></div>
          ))}
        </div>
        <p className="text-xs font-bold mt-2 opacity-80 uppercase tracking-widest text-white/90">
          {completed >= 3 ? "🎉 今日已达成" : `MISSION PROGRESS: ${completed}/3`}
        </p>
      </div>
      <div className="relative z-10 w-full md:w-auto shrink-0">
        <Link
          href="/adventure"
          onClick={() => {
            if (completed < 3) {
              const next = completed + 1;
              setCompleted(next);
              localStorage.setItem("aimake_daily_progress", String(next));
            }
          }}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-2xl font-black text-lg shadow-[0_8px_20px_rgba(255,255,255,0.2)] hover:shadow-[0_12px_30px_rgba(255,255,255,0.3)] hover:-translate-y-1 active:scale-95 transition-all duration-300"
        >
          {completed >= 3 ? "再来一局" : "🚀 开始今日训练"}
        </Link>
      </div>
    </motion.div>
  );
}
