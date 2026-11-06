/**
 * TICKS // High-Tech Web Audio Synthesis
 * Synthesizes click, tick, and milestone chime sound effects client-side.
 */

class SoundEngine {
  constructor() {
    this.enabled = false;
    this.audioCtx = null;
    this.lastTickTime = 0;
  }

  init() {
    if (!this.audioCtx && typeof window.AudioContext !== 'undefined') {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
  }

  toggle() {
    this.init();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playSubtleTick() {
    if (!this.enabled || !this.audioCtx) return;
    const now = performance.now();
    // Throttle ticks to avoid cacophony
    if (now - this.lastTickTime < 950) return;
    this.lastTickTime = now;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, this.audioCtx.currentTime);
      filter.Q.setValueAtTime(3, this.audioCtx.currentTime);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(780, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.audioCtx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.015, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.03);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.03);
    } catch (e) {
      // Ignore audio context errors
    }
  }

  playMilestoneChime() {
    if (!this.enabled || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
      const startTime = this.audioCtx.currentTime;

      freqs.forEach((freq, index) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime + index * 0.05);

        gain.gain.setValueAtTime(0.04, startTime + index * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + index * 0.05 + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(startTime + index * 0.05);
        osc.stop(startTime + index * 0.05 + 0.35);
      });
    } catch (e) {
      // Ignore audio context errors
    }
  }
}

window.soundEngine = new SoundEngine();
