"use client";

import { useUserStore, AVAILABLE_BADGES } from "@/store/useUserStore";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { useState } from "react";

export function BadgeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const unlockedBadges = useStore(useUserStore, (state) => state.unlockedBadges) || [];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center bg-purple-100 text-purple-600 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm hover:bg-purple-200 transition-colors ml-2"
        title="我的成就"
      >
        <Trophy className="w-4 h-4 mr-1" />
        {unlockedBadges.length}/{AVAILABLE_BADGES.length}
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
              className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-gray-800">成就星空</h2>
                <p className="text-gray-500 text-sm mt-1">
                  已收集 {unlockedBadges.length} / {AVAILABLE_BADGES.length} 枚徽章
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-2 pb-4">
                {AVAILABLE_BADGES.map((badge) => {
                  const isUnlocked = unlockedBadges.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                        isUnlocked
                          ? "border-purple-100 bg-white"
                          : "border-gray-50 bg-gray-50 opacity-60 grayscale"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                          isUnlocked ? badge.color : "bg-gray-200"
                        }`}
                      >
                        {badge.icon}
                      </div>
                      <div>
                        <h4 className={`font-bold ${isUnlocked ? "text-gray-800" : "text-gray-500"}`}>
                          {badge.name}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">{badge.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
