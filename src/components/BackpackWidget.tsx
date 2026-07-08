"use client";

import React, { useState, useEffect } from "react";
import { aimakeHub } from "@/lib/aimake-hub-client";
import { Backpack, X } from "lucide-react";

export function BackpackWidget() {
  const [backpack, setBackpack] = useState<{ id: string; name: string; url: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    aimakeHub?.init();
    const fetchBackpack = async () => {
      try {
        const raw = await aimakeHub?.getItem("aimake_backpack");
        if (Array.isArray(raw)) {
          setBackpack(raw);
        }
      } catch {
        // ignore
      }
    };
    // Fetch after a short delay to ensure iframe is ready
    setTimeout(fetchBackpack, 1000);
  }, []);

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-2 text-sm font-bold bg-indigo-50 text-indigo-600 px-4 py-3 w-full rounded-2xl shadow-sm border border-indigo-100 hover:bg-indigo-100 transition-colors"
      >
        <Backpack size={16} /> 星际背包 ({backpack.length})
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-full min-w-[250px] sm:min-w-[320px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-[100] overflow-hidden md:right-0 md:left-auto">
          <div className="flex justify-between items-center bg-indigo-50 px-4 py-3 border-b border-indigo-100">
            <span className="font-bold text-indigo-900 text-sm flex items-center gap-2">
              <Backpack size={14} /> 跨星际资产
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-3 max-h-60 overflow-y-auto grid grid-cols-3 gap-2 bg-slate-50">
            {backpack.length === 0 ? (
              <p className="col-span-3 text-xs text-slate-400 text-center py-4">
                空空如也，快去创作星球吧！
              </p>
            ) : (
              backpack.map((item) => (
                <div
                  key={item.id}
                  className="aspect-square bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm p-1 group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
