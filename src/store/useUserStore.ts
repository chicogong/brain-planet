import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
  points: number;
  streakDays: number;
  lastLoginDate: string | null;
  unlockedGames: string[];
  isMuted: boolean;
  addPoints: (points: number) => void;
  unlockGame: (gameId: string) => void;
  updateStreak: () => void;
  toggleMute: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      points: 0,
      streakDays: 0,
      lastLoginDate: null,
      unlockedGames: ['color-match'], // Default unlocked MVP game
      isMuted: false,
      addPoints: (points) => set((state) => ({ points: state.points + points })),
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
          
          set((state) => ({
            lastLoginDate: today,
            streakDays: isConsecutive ? state.streakDays + 1 : 1
          }));
        }
      }
    }),
    {
      name: 'brain-planet-storage',
    }
  )
)
