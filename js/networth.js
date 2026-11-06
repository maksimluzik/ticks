/**
 * TICKS // Net Worth Rank Calculator
 * Estimates where a given net worth sits in the world (and US) wealth
 * distribution, then ties it back to billionaire wealth velocity.
 *
 * The anchor tables are rounded approximations assembled from public
 * sources (UBS Global Wealth Report, Federal Reserve SCF 2022, Forbes).
 * They are meant for scale, not precision.
 */

class NetWorthRank {
  constructor() {
    this.WORLD_ADULTS = 5.3e9;
    this.US_HOUSEHOLDS = 132e6;

    // [net worth USD, % of population with MORE than this (the "top %")]
    this.WORLD = [
      [1000, 73], [5000, 57], [8700, 50], [10000, 48], [25000, 36],
      [50000, 25], [100000, 15], [250000, 7], [500000, 3.2], [1e6, 1.1],
      [5e6, 0.12], [1e7, 0.05], [5e7, 0.005], [1e9, 0.00005]
    ];
    // Share below $1,000 (including negative net worth): linear 0 -> 1000
    this.WORLD_AT_ZERO_TOP = 88; // ~12% have zero or negative net worth

    this.US = [
      [10000, 76], [50000, 64], [100000, 57], [193000, 50], [500000, 35],
      [1e6, 25], [1.9e6, 10], [3.4e6, 5], [1.1e7, 1], [5e7, 0.1], [1e9, 0.0006]
    ];
    this.US_AT_ZERO_TOP = 91;

    this.nodes = null;
    this.valueUSD = null;
  }

  init() {
    this.nodes = {
      input: document.getElementById('networth-input'),
      result: document.getElementById('networth-result'),
      empty: document.getElementById('networth-empty'),
      headline: document.getElementById('networth-headline'),
      sub: document.getElementById('networth-sub'),
      marker: document.getElementById('networth-marker'),
      richer: document.getElementById('networth-richer'),
      us: document.getElementById('networth-us'),
      velocity: document.getElementById('networth-velocity')
    };

    this.labelPresets();
    if (this.nodes.input) {
      this.nodes.input.addEventListener('input', () => this.update());
    }

    document.querySelectorAll('[data-networth-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const usd = Number(btn.getAttribute('data-networth-preset'));
        if (this.nodes.input) {
          this.nodes.input.value = Math.round(window.engine.convertAmount(usd));
        }
        this.update();
      });
    });
  }

  /** Percentage of population richer than `usd` (the "top %"). */
  topPercent(usd, table, zeroTop) {
    if (usd <= 0) return Math.min(99.9, zeroTop + (usd < 0 ? 1 : 0));
    const [firstX, firstTop] = table[0];
    if (usd < firstX) {
      return zeroTop + (usd / firstX) * (firstTop - zeroTop);
    }

    // Log-log interpolation of the tail (Pareto-like)
    let i = 0;
    while (i < table.length - 2 && usd > table[i + 1][0]) i++;
    const [x0, t0] = table[i];
    const [x1, t1] = table[i + 1];
    const slope = (Math.log(t1) - Math.log(t0)) / (Math.log(x1) - Math.log(x0));
    return Math.exp(Math.log(t0) + slope * (Math.log(usd) - Math.log(x0)));
  }

  formatTop(pct) {
    if (pct >= 10) return `${pct.toFixed(0)}%`;
    if (pct >= 1) return `${pct.toFixed(1)}%`;
    if (pct >= 0.01) return `${pct.toFixed(2)}%`;
    return `${pct.toPrecision(2)}%`;
  }

  formatPeople(n) {
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)} billion`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)} million`;
    if (n >= 1e3) return `${Math.round(n / 1e3).toLocaleString('en-US')} thousand`;
    return Math.max(1, Math.round(n)).toLocaleString('en-US');
  }

  update() {
    const n = this.nodes;
    if (!n || !n.input) return;

    const raw = n.input.value.trim();
    if (raw === '' || isNaN(Number(raw))) {
      this.valueUSD = null;
      if (n.result) n.result.classList.add('hidden');
      if (n.empty) n.empty.classList.remove('hidden');
      return;
    }

    const usd = window.engine.convertFromCurrentCurrency(Number(raw));
    this.valueUSD = usd;
    if (n.result) n.result.classList.remove('hidden');
    if (n.empty) n.empty.classList.add('hidden');

    // World
    const minTop = (1 / this.WORLD_ADULTS) * 100;
    const worldTop = Math.max(minTop, this.topPercent(usd, this.WORLD, this.WORLD_AT_ZERO_TOP));
    const worldBelow = 100 - worldTop;
    const oneIn = Math.max(1, Math.round(100 / worldTop));
    const peopleAhead = (worldTop / 100) * this.WORLD_ADULTS;

    n.headline.textContent = `Top ${this.formatTop(worldTop)} of the world`;
    n.sub.textContent = worldTop <= 1
      ? `Only 1 in ${oneIn.toLocaleString('en-US')} adults is wealthier than you.`
      : `Richer than ${worldBelow.toFixed(worldBelow > 99 ? 2 : 0)}% of the world's adults.`;

    // Marker position = wealth percentile (left = poorest, right = richest),
    // so the top 2.7% lands at 97.3% on the green side.
    const pos = Math.min(99.5, Math.max(0.5, worldBelow));
    n.marker.style.left = `${pos.toFixed(1)}%`;

    n.richer.textContent = `About ${this.formatPeople(peopleAhead)} adults have more than you; ${this.formatPeople((worldBelow / 100) * this.WORLD_ADULTS)} have less.`;

    // US
    const usTop = Math.max(0.0001, this.topPercent(usd, this.US, this.US_AT_ZERO_TOP));
    n.us.textContent = `Among US households you'd be in the top ${this.formatTop(usTop)}.`;

    // Billionaire velocity: how fast do they gain your whole net worth?
    if (usd <= 0) {
      n.velocity.innerHTML = `<div class="text-xs text-zinc-500 italic">Enter a positive net worth to see how quickly each billionaire gains that amount.</div>`;
    } else {
      n.velocity.innerHTML = TICKS_DATA.BILLIONAIRES.map(b => {
        const secs = window.engine.getParitySeconds(b, usd);
        return `
          <div class="flex items-center justify-between text-xs py-1.5 border-b border-zinc-800/60 last:border-0">
            <span class="text-zinc-300">${b.name}</span>
            <span class="font-mono font-semibold text-amber-400">${window.engine.formatSecondsDuration(secs)}</span>
          </div>`;
      }).join('');
    }
  }

  labelPresets() {
    document.querySelectorAll('[data-networth-preset]').forEach(btn => {
      const usd = Number(btn.getAttribute('data-networth-preset'));
      btn.textContent = usd === 0 ? window.engine.formatCurrency(0, 0) : window.engine.formatCompact(window.engine.convertAmount(usd));
    });
  }

  /** Re-render on currency/mode change (values depend on both). */
  refresh() {
    this.labelPresets();
    this.update();
  }
}

window.netWorthRank = new NetWorthRank();
