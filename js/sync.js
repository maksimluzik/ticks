/**
 * TICKS // Dynamic Live Data Sync Engine
 * Fetches real-time exchange rates (open.er-api.com) and Forbes Real-Time Billionaires
 * daily history time series (komed3/rtb-api) directly client-side.
 */

class LiveSyncService {
  constructor() {
    this.status = 'idle'; // 'idle', 'syncing', 'synced', 'error'
    this.lastSyncTimestamp = null;
    this.syncSource = 'Forbes RTB & Open Exchange';
    this.onSyncCallbacks = [];
  }

  onSync(callback) {
    this.onSyncCallbacks.push(callback);
  }

  notify() {
    this.onSyncCallbacks.forEach(cb => {
      try { cb(this); } catch (e) { console.error('Sync callback error:', e); }
    });
  }

  async syncAll() {
    this.status = 'syncing';
    this.updateStatusBadge();

    let fxSuccess = false;
    let rtbSuccess = false;

    // 1. Fetch live currency rates
    try {
      const fxRes = await fetch('https://open.er-api.com/v6/latest/USD');
      if (fxRes.ok) {
        const fxData = await fxRes.json();
        if (fxData && fxData.rates && fxData.rates.EUR) {
          const liveEurRate = fxData.rates.EUR;
          TICKS_DATA.CURRENCIES.EUR.rate = liveEurRate;
          fxSuccess = true;
        }
      }
    } catch (e) {
      console.warn('Currency live sync failed, using fallback exchange rate:', e);
    }

    // 2. Fetch live Forbes RTB data for each featured billionaire
    try {
      const fetchPromises = TICKS_DATA.BILLIONAIRES.map(async (b) => {
        if (!b.rtbId) return null;
        try {
          const url = `https://raw.githubusercontent.com/komed3/rtb-api/main/api/profile/${b.rtbId}/history`;
          const res = await fetch(url);
          if (!res.ok) return null;

          const text = await res.text();
          const lines = text.trim().split('\n');
          if (lines.length === 0) return null;

          const parsed = lines.map(line => {
            const parts = line.split(' ');
            return {
              date: parts[0],
              rank: parseInt(parts[1], 10),
              worthUSD: parseFloat(parts[2]) * 1e6 // Millions to USD
            };
          });

          const latest = parsed[parsed.length - 1];
          if (!latest || isNaN(latest.worthUSD)) return null;

          // Compute TTM (1 year ago) delta
          const d1 = new Date(latest.date);
          d1.setFullYear(d1.getFullYear() - 1);
          const iso1 = d1.toISOString().slice(0, 10);
          const item1 = parsed.slice().reverse().find(x => x.date <= iso1) || parsed[0];

          // Compute 5-Year (5 years ago) delta
          const d5 = new Date(latest.date);
          d5.setFullYear(d5.getFullYear() - 5);
          const iso5 = d5.toISOString().slice(0, 10);
          const item5 = parsed.slice().reverse().find(x => x.date <= iso5) || parsed[0];

          const ttmGrowth = Math.max(latest.worthUSD - item1.worthUSD, 500000000);
          const fiveYearGrowth = Math.max((latest.worthUSD - item5.worthUSD) / 5, 1000000000);

          return {
            id: b.id,
            netWorth: latest.worthUSD,
            rank: latest.rank,
            annualVelocityTTM: ttmGrowth,
            annualVelocity5yr: fiveYearGrowth,
            latestDate: latest.date
          };
        } catch (err) {
          console.warn(`Failed to sync profile ${b.id}:`, err);
          return null;
        }
      });

      const results = await Promise.all(fetchPromises);
      let updatedCount = 0;

      results.forEach(res => {
        if (!res) return;
        const target = TICKS_DATA.BILLIONAIRES.find(b => b.id === res.id);
        if (target) {
          target.netWorth = res.netWorth;
          target.annualVelocityTTM = res.annualVelocityTTM;
          target.annualVelocity5yr = res.annualVelocity5yr;
          target.latestSyncedDate = res.latestDate;
          target.rank = res.rank;
          updatedCount++;
        }
      });

      if (updatedCount > 0) {
        rtbSuccess = true;
      }
    } catch (e) {
      console.warn('Billionaire live sync error:', e);
    }

    if (fxSuccess || rtbSuccess) {
      this.status = 'synced';
      this.lastSyncTimestamp = new Date();
    } else {
      this.status = 'cached';
    }

    this.updateStatusBadge();
    this.notify();
  }

  updateStatusBadge() {
    const badgeContainer = document.getElementById('live-sync-indicator');
    if (!badgeContainer) return;

    if (this.status === 'syncing') {
      badgeContainer.innerHTML = `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono">
          <svg class="animate-spin -ml-0.5 mr-1 h-3 w-3 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          Syncing Live Data...
        </span>
      `;
    } else if (this.status === 'synced') {
      const timeStr = this.lastSyncTimestamp ? this.lastSyncTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live';
      badgeContainer.innerHTML = `
        <button id="btn-manual-sync" 
                title="Data synced directly from Forbes Real-Time Billionaires & Open Exchange Rates. Click to refresh."
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono hover:bg-emerald-900/80 hover:border-emerald-400 transition-colors">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Live Synced (${timeStr})</span>
          <i data-lucide="refresh-cw" class="w-2.5 h-2.5 ml-0.5 opacity-70"></i>
        </button>
      `;
      const btn = document.getElementById('btn-manual-sync');
      if (btn) btn.addEventListener('click', () => this.syncAll());
      if (window.lucide) window.lucide.createIcons({ root: badgeContainer });
    } else {
      badgeContainer.innerHTML = `
        <button id="btn-manual-sync" 
                title="Using verified historical baselines. Click to try syncing live."
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 text-[11px] font-mono hover:text-zinc-200 transition-colors">
          <span class="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
          <span>Cached Benchmarks</span>
          <i data-lucide="refresh-cw" class="w-2.5 h-2.5 ml-0.5 opacity-70"></i>
        </button>
      `;
      const btn = document.getElementById('btn-manual-sync');
      if (btn) btn.addEventListener('click', () => this.syncAll());
      if (window.lucide) window.lucide.createIcons({ root: badgeContainer });
    }
  }
}

window.liveSyncService = new LiveSyncService();

