/**
 * TICKS // Real-time Simulation Engine & Mathematical Formatter
 * 60fps requestAnimationFrame Loop with DOM Cache & Zero-Jitter Alignment
 */

class TicksEngine {
  constructor() {
    this.currency = 'USD';
    this.mode = '5yr'; // '5yr' or 'ttm'
    this.multiplier = 1; // 1x, 10x, 60x, 3600x, 86400x
    this.isPaused = false;

    this.startTime = performance.now();
    this.pausedAt = 0;
    this.totalPausedDuration = 0;
    this.virtualElapsedSeconds = 0;
    this.lastFrameTimestamp = performance.now();

    // DOM cache for high performance RAF updates
    this.domCache = {};

    // Listeners for custom hooks
    this.tickCallbacks = [];
  }

  init() {
    this.startTime = performance.now();
    this.lastFrameTimestamp = performance.now();
    this.virtualElapsedSeconds = 0;
  }

  setCurrency(curr) {
    if (TICKS_DATA.CURRENCIES[curr]) {
      this.currency = curr;
    }
  }

  getCurrencyMeta() {
    return TICKS_DATA.CURRENCIES[this.currency];
  }

  setMode(mode) {
    if (mode === '5yr' || mode === 'ttm') {
      this.mode = mode;
    }
  }

  setMultiplier(mult) {
    this.multiplier = Number(mult) || 1;
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.pausedAt = performance.now();
    } else {
      this.lastFrameTimestamp = performance.now();
    }
    return this.isPaused;
  }

  resetSession() {
    this.startTime = performance.now();
    this.lastFrameTimestamp = performance.now();
    this.virtualElapsedSeconds = 0;
    this.isPaused = false;
  }

  /**
   * Advance simulation time
   */
  updateTime(now) {
    if (this.isPaused) {
      return this.virtualElapsedSeconds;
    }

    const deltaMs = now - this.lastFrameTimestamp;
    this.lastFrameTimestamp = now;

    // Advance virtual seconds taking speed multiplier into account
    this.virtualElapsedSeconds += (deltaMs / 1000) * this.multiplier;
    return this.virtualElapsedSeconds;
  }

  // --- Mathematical & Conversion Helpers ---

  getExchangeRate() {
    return TICKS_DATA.CURRENCIES[this.currency].rate;
  }

  getCurrencySymbol() {
    return TICKS_DATA.CURRENCIES[this.currency].symbol;
  }

  convertAmount(usdAmount) {
    return usdAmount * this.getExchangeRate();
  }

  convertFromCurrentCurrency(amount) {
    return amount / this.getExchangeRate();
  }

  getBillionaireAnnualVelocity(b) {
    return this.mode === 'ttm' ? b.annualVelocityTTM : b.annualVelocity5yr;
  }

  getBillionairePerSecond(b) {
    const annualUsd = this.getBillionaireAnnualVelocity(b);
    const converted = this.convertAmount(annualUsd);
    return converted / TICKS_DATA.SECONDS_IN_YEAR;
  }

  getCombinedAnnualVelocity() {
    return TICKS_DATA.BILLIONAIRES.reduce((sum, b) => {
      return sum + this.getBillionaireAnnualVelocity(b);
    }, 0);
  }

  getCombinedPerSecond() {
    const annualUsd = this.getCombinedAnnualVelocity();
    return this.convertAmount(annualUsd) / TICKS_DATA.SECONDS_IN_YEAR;
  }

  getParitySeconds(billionaire, targetAnnualUSD) {
    const annualGrowthUSD = this.getBillionaireAnnualVelocity(billionaire);
    if (annualGrowthUSD <= 0) return 0;
    const ratePerSecUSD = annualGrowthUSD / TICKS_DATA.SECONDS_IN_YEAR;
    return targetAnnualUSD / ratePerSecUSD;
  }

  // --- High-Performance Formatting Routines ---

  formatCurrency(amount, decimals = 2) {
    const sym = this.getCurrencySymbol();
    if (isNaN(amount) || amount === null) return `${sym}0.00`;

    const parts = Number(amount).toFixed(decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${sym}${parts.join('.')}`;
  }

  formatMicroCurrency(amount) {
    const sym = this.getCurrencySymbol();
    if (isNaN(amount) || amount === null) return `${sym}0.0000`;

    if (amount >= 100) {
      return this.formatCurrency(amount, 2);
    } else if (amount >= 1) {
      return this.formatCurrency(amount, 2);
    } else if (amount >= 0.01) {
      return `${sym}${Number(amount).toFixed(4)}`;
    } else {
      return `${sym}${Number(amount).toFixed(5)}`;
    }
  }

  formatCompact(amount) {
    const sym = this.getCurrencySymbol();
    const abs = Math.abs(amount);
    if (abs >= 1e12) {
      return `${sym}${(amount / 1e12).toFixed(2)}T`;
    }
    if (abs >= 1e9) {
      return `${sym}${(amount / 1e9).toFixed(1)}B`;
    }
    if (abs >= 1e6) {
      return `${sym}${(amount / 1e6).toFixed(1)}M`;
    }
    if (abs >= 1e3) {
      return `${sym}${(amount / 1e3).toFixed(1)}k`;
    }
    return `${sym}${amount.toFixed(0)}`;
  }

  formatSessionTime(totalSecs) {
    const sec = Math.floor(totalSecs);
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    const tenths = Math.floor((totalSecs % 1) * 10);

    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${tenths}`;
  }

  formatSecondsDuration(seconds) {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    } else if (seconds < 3600) {
      const m = Math.floor(seconds / 60);
      const s = Math.round(seconds % 60);
      return `${m}m ${s}s`;
    } else {
      const h = Math.floor(seconds / 3600);
      const m = Math.round((seconds % 3600) / 60);
      return `${h}h ${m}m`;
    }
  }

  onTick(callback) {
    this.tickCallbacks.push(callback);
  }
}

window.engine = new TicksEngine();
