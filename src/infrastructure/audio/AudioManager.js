import { AudioPort } from '../../ports/output/AudioPort.js';

/**
 * Web Audio API implementation of AudioPort.
 * Generates sound effects procedurally — no external audio files needed.
 */
export class AudioManager extends AudioPort {
  constructor() {
    super();
    this._context = null;
    this._volume = 0.3;
    this._muted = false;
  }

  _ensureContext() {
    if (!this._context) {
      this._context = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this._context.state === 'suspended') {
      this._context.resume();
    }
    return this._context;
  }

  playSound(soundName) {
    if (this._muted) return;

    try {
      const ctx = this._ensureContext();
      const sounds = {
        move: () => this._playTone(ctx, 440, 0.04, 'sine', 0.15),
        collect: () => this._playChime(ctx),
        error: () => this._playTone(ctx, 200, 0.08, 'square', 0.1),
        gate_open: () => this._playFanfare(ctx),
      };

      const play = sounds[soundName];
      if (play) play();
    } catch {
      // Audio not available
    }
  }

  setVolume(volume) {
    this._volume = Math.max(0, Math.min(1, volume));
  }

  isMuted() {
    return this._muted;
  }

  toggleMute() {
    this._muted = !this._muted;
    return this._muted;
  }

  _playTone(ctx, freq, duration, type, vol) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol * this._volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  _playChime(ctx) {
    const now = ctx.currentTime;
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.2 * this._volume, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.15);
    });
  }

  _playFanfare(ctx) {
    const now = ctx.currentTime;
    [392, 523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0.25 * this._volume, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.2);
    });
  }
}
