"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, BookA, Calculator, Code, Brain, Brush, X } from "lucide-react";

const PLANETS = [
  {
    id: "brain",
    name: "脑力星球",
    icon: Brain,
    href: "https://kids.aimake.cc",
    color: "from-blue-400 to-indigo-500",
    shadow: "shadow-blue-500/30",
  },
  {
    id: "math",
    name: "数学星球",
    icon: Calculator,
    href: "https://math.aimake.cc",
    color: "from-orange-400 to-red-500",
    shadow: "shadow-orange-500/30",
  },
  {
    id: "word",
    name: "单词星球",
    icon: BookA,
    href: "https://word.aimake.cc",
    color: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-500/30",
  },
  {
    id: "code",
    name: "编程星球",
    icon: Code,
    href: "https://code.aimake.cc",
    color: "from-purple-400 to-fuchsia-500",
    shadow: "shadow-purple-500/30",
  },
  {
    id: "ai",
    name: "AI素养星球",
    icon: Compass,
    href: "https://ai.aimake.cc",
    color: "from-cyan-400 to-blue-500",
    shadow: "shadow-cyan-500/30",
  },
  {
    id: "create",
    name: "创作星球",
    icon: Brush,
    href: "https://create.aimake.cc",
    color: "from-pink-400 to-rose-500",
    shadow: "shadow-pink-500/30",
  },
];

export function AimakeOrbit() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mb-4 p-4 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex flex-col gap-2 origin-bottom-right"
          >
            <div className="px-2 pb-2 border-b border-slate-200/50 flex justify-between items-center">
              <span className="text-xs font-black tracking-widest uppercase text-slate-400">
                Aimake Orbit
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {PLANETS.map((planet) => {
                const Icon = planet.icon;
                return (
                  <a
                    key={planet.id}
                    href={planet.href}
                    className={`group relative overflow-hidden flex flex-col items-center justify-center p-3 w-24 h-24 rounded-2xl bg-white/50 border border-white/60 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}
                  >
                    <div
                      className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${planet.color} transition-opacity duration-300`}
                    />
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${planet.color} text-white flex items-center justify-center mb-2 shadow-lg ${planet.shadow} group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 tracking-tight">
                      {planet.name}
                    </span>
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-slate-900 text-white shadow-[0_8px_24px_rgba(15,23,42,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Compass
          size={24}
          className={`relative z-10 ${isOpen ? "rotate-90" : "rotate-0"} transition-transform duration-300`}
        />

        {/* Orbit Rings */}
        <div className="absolute inset-0 border border-white/20 rounded-full scale-[0.6] group-hover:scale-[1.2] transition-transform duration-500 opacity-50" />
        <div className="absolute inset-0 border border-white/10 rounded-full scale-[0.8] group-hover:scale-[1.5] transition-transform duration-500 opacity-30" />
      </button>
    </div>
  );
}
