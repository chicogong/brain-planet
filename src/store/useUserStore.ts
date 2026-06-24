import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const AVAILABLE_BADGES: Badge[] = [
  { id: 'first_blood', name: '初露锋芒', description: '完成你的第一次游戏', icon: '🐣', color: 'bg-yellow-100 text-yellow-600' },
  { id: 'math_genius', name: '算术小达人', description: '24点游戏累计获胜3次', icon: '🧮', color: 'bg-blue-100 text-blue-600' },
  { id: 'memory_master', name: '最强记忆大脑', description: '通关困难模式翻牌游戏', icon: '🧠', color: 'bg-purple-100 text-purple-600' },
  { id: 'streak_3', name: '恒星开拓者', description: '保持连续3天登陆', icon: '🔥', color: 'bg-orange-100 text-orange-600' },
  { id: 'whack_100', name: '黄金右手', description: '打地鼠单局超过 500 分', icon: '⚡', color: 'bg-red-100 text-red-600' },
];

interface UserState {
  points: number;
  streakDays: number;
  lastLoginDate: string | null;
  unlockedGames: string[];
  isMuted: boolean;
  unlockedBadges: string[];
  gameStats: Record<string, number>; // gameId -> playCount or winCount
  addPoints: (points: number) => void;
  unlockGame: (gameId: string) => void;
  updateStreak: () => void;
  toggleMute: () => void;
  unlockBadge: (badgeId: string) => void;
  incrementGameStat: (gameId: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      points: 0,
      streakDays: 0,
      lastLoginDate: null,
      unlockedGames: ['color-match'], // Default unlocked MVP game
      isMuted: false,
      unlockedBadges: [],
      gameStats: {},
      addPoints: (points) => set((state) => {
        const newPoints = state.points + points;
        if (state.points === 0 && newPoints > 0) {
          setTimeout(() => get().unlockBadge('first_blood'), 500);
        }
        return { points: newPoints };
      }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      unlockGame: (gameId) => set((state) => ({
        unlockedGames: state.unlockedGames.includes(gameId) 
          ? state.unlockedGames 
          : [...state.unlockedGames, gameId]
      })),
      updateStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const lastLogin = get().lastLoginDate;
        
        if (lastLogin !== today) {
          // Simple streak logic: check if lastLogin was exactly yesterday
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          const isConsecutive = lastLogin === yesterdayStr;
          const newStreak = isConsecutive ? get().streakDays + 1 : 1;
          
          if (newStreak >= 3) {
            setTimeout(() => get().unlockBadge('streak_3'), 500);
          }
          
          set((state) => ({
            lastLoginDate: today,
            streakDays: newStreak
          }));
        }
      },
      unlockBadge: (badgeId) => set((state) => {
        if (!state.unlockedBadges.includes(badgeId)) {
          // Play sound and vibrate on new badge
          if (typeof window !== 'undefined') {
            import('@/lib/audio').then(({ playSound, vibrate }) => {
              playSound.cheer();
              vibrate([100, 50, 100, 50, 200]);
              // Native alert for now, can be replaced with a beautiful modal
              setTimeout(() => alert(`🏆 恭喜获得新徽章：${AVAILABLE_BADGES.find(b => b.id === badgeId)?.name}`), 100);
            });
          }
          return { unlockedBadges: [...state.unlockedBadges, badgeId] };
        }
        return state;
      }),
      incrementGameStat: (gameId) => set((state) => {
        const count = (state.gameStats[gameId] || 0) + 1;
        if (gameId === 'math-24' && count >= 3) {
          setTimeout(() => get().unlockBadge('math_genius'), 500);
        }
        return { gameStats: { ...state.gameStats, [gameId]: count } };
      })
    }),
    {
      name: 'brain-planet-storage',
    }
  )
)
