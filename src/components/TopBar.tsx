"use client";

import { useUserStore } from "@/store/useUserStore";
import { useStore } from "@/store/useStore";
import { Flame, Star, Share2, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export function TopBar() {
  const points = useStore(useUserStore, (state) => state.points);
  const streakDays = useStore(useUserStore, (state) => state.streakDays);
  const isMuted = useStore(useUserStore, (state) => state.isMuted);
  const updateStreak = useUserStore((state) => state.updateStreak);
  const toggleMute = useUserStore((state) => state.toggleMute);

  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-8 mx-auto justify-between max-w-5xl">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <span className="font-bold text-2xl text-primary flex items-center gap-2">
            🚀 脑力星球
          </span>
        </Link>

        <div className="flex items-center space-x-3">
          <button 
            onClick={async () => {
              const shareData = {
                title: '脑力星球 - 免费儿童益智平台',
                text: '我发现了一个超棒的儿童脑力训练营，无需登陆，没有广告，还能离线玩！',
                url: 'https://kids.aimake.cc',
              };
              if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
                try {
                  await navigator.share(shareData);
                } catch (err) {
                  // user cancelled
                }
              } else {
                navigator.clipboard.writeText('https://kids.aimake.cc');
                alert('游戏链接已复制，快去分享吧！');
              }
            }}
            className="flex items-center bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm hover:bg-blue-100 transition-colors"
          >
            <Share2 className="w-4 h-4 mr-1" />
            分享
          </button>
          <div className="flex items-center bg-orange-100 text-orange-600 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
            <Flame className="w-4 h-4 mr-1" />
            {streakDays ?? 0} 天
          </div>
          <div className="flex items-center bg-yellow-100 text-yellow-600 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
            <Star className="w-4 h-4 mr-1 fill-yellow-600" />
            {points ?? 0}
          </div>
          <button
            onClick={() => toggleMute?.()}
            className="p-1.5 ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            title={isMuted ? "开启音效" : "关闭音效"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
