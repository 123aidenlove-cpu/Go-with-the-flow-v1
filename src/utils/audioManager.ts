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

  public playNote(writtenNote: string, instrumentName: string) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      // Extract note letter, accidental, and octave
      // Example: 'C4', 'C#4', 'Bb4'
      const match = writtenNote.match(/^([A-G])([#b]?)([0-9])$/i);
      if (!match) return;

      const letter = match[1].toUpperCase();
      const acc = match[2];
      const oct = parseInt(match[3], 10);

      const notesToMidi: { [key: string]: number } = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
      };
      
      const noteClass = letter + acc;
      if (!(noteClass in notesToMidi)) return;

      // MIDI note 60 is C4
      let midiNote = (oct + 1) * 12 + notesToMidi[noteClass];

      // Handle Transposing Instruments (offsets from written to sounding)
      const transpositions: { [key: string]: number } = {
        'Trumpet': -2,
        'Clarinet': -2,
        'Alto Saxophone': -9,
        'Tenor Saxophone': -14,
        'Double Bass': -12,
        'Bass Guitar': -12
      };

      if (instrumentName in transpositions) {
        midiNote += transpositions[instrumentName];
      }

      // Convert MIDI to frequency
      const freq = 440 * Math.pow(2, (midiNote - 69) / 12);

      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      // Choose a basic waveform to mimic a generic instrument
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gainNode.gain.setValueAtTime(0.0, this.ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.05); // Attack
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8); // Decay

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.8);
    } catch (e) {
      console.warn("Audio playNote error:", e);
    }
  }
}

export const AudioManager = new AudioManagerService();
