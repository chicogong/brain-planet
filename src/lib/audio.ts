"use client";

import { useUserStore } from "@/store/useUserStore";

class AudioEngine {
  private static play(url: string, volume = 1) {
    if (typeof window === "undefined") return;
    
    // Check if muted via Zustand store directly reading from localStorage or state
    // We can directly access the store state
    const state = useUserStore.getState();
    if (state.isMuted) return;

    try {
      const audio = new Audio(url);
      audio.volume = volume;
      audio.play().catch(e => console.warn('Audio play failed:', e));
    } catch (error) {
      console.warn("Audio playback error:", error);
    }
  }

  static pop() {
    this.play("/audio/pop.mp3", 0.5);
  }

  static error() {
    this.play("/audio/error.mp3", 0.4);
  }

  static cheer() {
    this.play("/audio/cheer.mp3", 0.6);
  }
}

export const playSound = {
  pop: () => AudioEngine.pop(),
  error: () => AudioEngine.error(),
  cheer: () => AudioEngine.cheer(),
};

export const vibrate = (pattern: number | number[] = 50) => {
  if (typeof window !== "undefined" && navigator.vibrate) {
    try {
      // Check if muted/haptics disabled. We'll tie haptics to the sound setting for simplicity.
      const state = useUserStore.getState();
      if (state.isMuted) return;
      
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignore vibration errors
    }
  }
};
