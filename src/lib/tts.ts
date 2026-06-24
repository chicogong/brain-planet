import { useUserStore } from "@/store/useUserStore";

class TTSEngine {
  private static synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  private static voice: SpeechSynthesisVoice | null = null;

  private static initVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    const zhVoices = voices.filter(v => v.lang.startsWith('zh'));
    this.voice = zhVoices.find(v => v.name.includes('Ting-Ting') || v.name.includes('Google')) || zhVoices[0] || null;
  }

  static speak(text: string) {
    if (!this.synth) return;
    
    const state = useUserStore.getState();
    // Do not speak if globally muted
    if (state.isMuted) return;

    // Cancel any ongoing speech
    this.synth.cancel();

    // In Chrome, getVoices might be populated late, so we re-init if not found
    this.initVoice();

    // Chrome sometimes suspends the audio context, resume it
    if (this.synth.resume) {
      this.synth.resume();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) utterance.voice = this.voice;
    
    // Friendly, slightly slower speech rate for kids
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;

    this.synth.speak(utterance);
  }

  static stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

// In some browsers (like Chrome/iOS Safari), voices are loaded asynchronously
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    // Force voice initialization when voices are finally loaded
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Just fetching them triggers readiness
    }
  };
}

export const tts = {
  speak: (text: string) => TTSEngine.speak(text),
  stop: () => TTSEngine.stop(),
};
