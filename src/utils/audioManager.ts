// Web Audio API Synth-based AudioManager to provide zero-latency audio feedback without external assets
class AudioManagerService {
  private isMuted: boolean = false;
  private ctx: AudioContext | null = null;

  constructor() {
    // Lazy initialize to conform with user actions and browsers' autoplay policies
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('musicalExplorerMuted');
      if (savedMute) {
        this.isMuted = savedMute === 'true';
      }
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    // Resume context if suspended (common in browser security policies)
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('musicalExplorerMuted', String(this.isMuted));
    return this.isMuted;
  }

  public getMutedState(): boolean {
    return this.isMuted;
  }

  public playClick() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.08);

      gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      console.warn("Audio Click error:", e);
    }
  }

  public playSuccess() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      // Play a lovely major triad arpeggio (C5 -> E5 -> G5 -> C6) like a slot machine paying out!
      const notes = [523.25, 659.25, 783.99, 1046.50];
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const noteTime = now + idx * 0.12;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gainNode.gain.setValueAtTime(0.0, noteTime);
        gainNode.gain.linearRampToValueAtTime(0.12, noteTime + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.005, noteTime + 0.25);

        osc.start(noteTime);
        osc.stop(noteTime + 0.25);
      });
    } catch (e) {
      console.warn("Audio Success error:", e);
    }
  }

  public playError() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.setValueAtTime(120, this.ctx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {
      console.warn("Audio Error error:", e);
    }
  }
}

export const AudioManager = new AudioManagerService();
