export type SoundEffectType =
  | 'select'
  | 'draw'
  | 'intersect'
  | 'star'
  | 'complete'
  | 'countdown'
  | 'unlock'
  | 'error';

class GeometryAudioService {
  private ctx: AudioContext | null = null;
  private sfxEnabled = true;
  private sfxVolume = 0.65;
  private musicEnabled = false;
  private musicVolume = 0.25;
  private musicTimer: number | null = null;
  private musicStep = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    if (!this.ctx) {
      this.ctx = new Ctx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public configure(opts: {
    sfxEnabled: boolean;
    sfxVolume: number;
    musicEnabled: boolean;
    musicVolume: number;
  }): void {
    this.sfxEnabled = opts.sfxEnabled;
    this.sfxVolume = Math.max(0, Math.min(1, opts.sfxVolume));
    this.musicVolume = Math.max(0, Math.min(1, opts.musicVolume));

    if (opts.musicEnabled !== this.musicEnabled) {
      this.musicEnabled = opts.musicEnabled;
      if (this.musicEnabled) {
        this.startAmbientMusic();
      } else {
        this.stopAmbientMusic();
      }
    }
  }

  private playTone(
    freq: number,
    durationSec: number,
    type: OscillatorType = 'sine',
    gainPeak = 0.22,
    delaySec = 0
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, gainPeak), now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + durationSec + 0.02);
  }

  public play(effect: SoundEffectType): void {
    if (!this.sfxEnabled || this.sfxVolume <= 0.01) return;
    const vol = this.sfxVolume;

    switch (effect) {
      case 'select':
        this.playTone(540, 0.07, 'sine', 0.14 * vol);
        break;
      case 'draw':
        this.playTone(440, 0.09, 'triangle', 0.15 * vol);
        this.playTone(660, 0.08, 'sine', 0.12 * vol, 0.045);
        break;
      case 'intersect':
        this.playTone(784, 0.09, 'sine', 0.18 * vol);
        this.playTone(1046.5, 0.12, 'triangle', 0.14 * vol, 0.05);
        break;
      case 'star':
        this.playTone(880, 0.14, 'triangle', 0.2 * vol);
        this.playTone(1318.5, 0.22, 'sine', 0.18 * vol, 0.08);
        break;
      case 'complete':
        [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
          this.playTone(f, 0.24, 'triangle', 0.2 * vol, idx * 0.08);
        });
        break;
      case 'unlock':
        [587.33, 739.99, 880, 1174.66].forEach((f, idx) => {
          this.playTone(f, 0.2, 'sine', 0.17 * vol, idx * 0.07);
        });
        break;
      case 'countdown':
        this.playTone(680, 0.08, 'square', 0.08 * vol);
        break;
      case 'error':
        this.playTone(260, 0.16, 'sawtooth', 0.1 * vol);
        this.playTone(210, 0.2, 'sawtooth', 0.09 * vol, 0.1);
        break;
    }
  }

  public startAmbientMusic(): void {
    if (typeof window === 'undefined' || this.musicTimer !== null) return;
    // Gentle C-major / A-minor mathematical arpeggio chords
    const chords = [
      [261.63, 329.63, 392.0],
      [220.0, 261.63, 329.63],
      [174.61, 220.0, 261.63],
      [196.0, 246.94, 293.66],
    ];
    const playStep = () => {
      if (!this.musicEnabled || this.musicVolume <= 0.01) return;
      const chord = chords[this.musicStep % chords.length];
      this.musicStep += 1;
      chord.forEach((freq, i) => {
        this.playTone(freq, 1.9, 'sine', 0.045 * this.musicVolume, i * 0.22);
      });
    };
    playStep();
    this.musicTimer = window.setInterval(playStep, 2600);
  }

  public stopAmbientMusic(): void {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

export const audioService = new GeometryAudioService();
