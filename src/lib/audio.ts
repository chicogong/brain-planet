"use client";

import { useUserStore } from "@/store/useUserStore";

class AudioEngine {
  private static audioCtx: AudioContext | null = null;

  private static getContext() {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      } catch (e) {
        console.warn("Web Audio API not supported");
      }
    }
    // Resume context if suspended (browser auto-play policy)
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  private static canPlay() {
    if (typeof window === "undefined") return false;
    const state = useUserStore.getState();
    return !state.isMuted;
  }

  static pop() {
    if (!this.canPlay()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  static error() {
    if (!this.canPlay()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  static cheer() {
    if (!this.canPlay()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Simple arpeggio for cheer
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    const duration = 0.15;
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = "triangle";
      const startTime = ctx.currentTime + i * duration;
      
      osc.frequency.setValueAtTime(freq, startTime);
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
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
      const state = useUserStore.getState();
      if (state.isMuted) return;
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignore vibration errors
    }
  }
};
