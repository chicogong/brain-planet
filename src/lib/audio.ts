/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

class AudioEngine {
  private static audioCtx: AudioContext | null = null;
  private static bgmOscillators: OscillatorNode[] = [];
  private static bgmGain: GainNode | null = null;
  private static isBgmPlaying = false;
  private static bgmInterval: NodeJS.Timeout | null = null;

  static initAudio() {
    const ctx = this.getContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume();
    }
    // Play a silent oscillator to force unlock on iOS
    if (ctx) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.001);
    }
  }

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
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  private static canPlay() {
    if (typeof window === "undefined") return false;
    try {
      const data = JSON.parse(localStorage.getItem("brain-planet-storage") || "{}");
      return !data?.state?.isMuted;
    } catch {
      return true;
    }
  }

  static toggleBGM() {
    if (!this.canPlay()) {
      this.stopBGM();
      return;
    }

    if (this.isBgmPlaying) return;

    const ctx = this.getContext();
    if (!ctx) return;

    // Very gentle ambient procedural music (pentatonic scale)
    const scale = [261.63, 293.66, 329.63, 392.0, 440.0]; // C4, D4, E4, G4, A4

    this.bgmGain = ctx.createGain();
    this.bgmGain.gain.value = 0.03; // Very quiet background
    this.bgmGain.connect(ctx.destination);

    this.isBgmPlaying = true;

    const playNote = () => {
      if (!this.isBgmPlaying || !this.canPlay() || !this.bgmGain) {
        if (this.bgmInterval) clearInterval(this.bgmInterval);
        return;
      }

      const freq = scale[Math.floor(Math.random() * scale.length)];
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq * (Math.random() > 0.5 ? 0.5 : 1); // Mix octaves

      // Soft attack and release
      noteGain.gain.setValueAtTime(0, ctx.currentTime);
      noteGain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2);
      noteGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 6);

      osc.connect(noteGain);
      noteGain.connect(this.bgmGain);

      osc.start();
      osc.stop(ctx.currentTime + 6);

      this.bgmOscillators.push(osc);

      // Clean up old oscillators
      setTimeout(() => {
        const index = this.bgmOscillators.indexOf(osc);
        if (index > -1) {
          this.bgmOscillators.splice(index, 1);
        }
      }, 6000);
    };

    // Play a note every 1-3 seconds
    this.bgmInterval = setInterval(playNote, 2000);
    playNote();
  }

  static stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }

    // Fade out smoothly
    if (this.bgmGain && this.audioCtx) {
      this.bgmGain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 1);
      setTimeout(() => {
        this.bgmOscillators.forEach((osc) => {
          try {
            osc.stop();
          } catch (e) {}
        });
        this.bgmOscillators = [];
        if (this.bgmGain) {
          this.bgmGain.disconnect();
          this.bgmGain = null;
        }
      }, 1000);
    }
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

  static playTone(freq: number, duration: number = 0.3) {
    if (!this.canPlay()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
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
  playTone: (freq: number, duration?: number) => AudioEngine.playTone(freq, duration),
  toggleBGM: () => AudioEngine.toggleBGM(),
  stopBGM: () => AudioEngine.stopBGM(),
  initAudio: () => AudioEngine.initAudio(),
};

export const vibrate = (pattern: number | number[] = 50) => {
  if (typeof window !== "undefined" && navigator.vibrate) {
    try {
      const data = JSON.parse(localStorage.getItem("brain-planet-storage") || "{}");
      if (data?.state?.isMuted) return;
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignore vibration errors
    }
  }
};
