/**
 * TICKS // "What It Buys" - Tangible Wealth Translator
 * Converts a billionaire's wealth velocity over a chosen time window into
 * things people can picture: houses, cars, lifetimes of work, stacks of cash.
 * All prices are rough US averages, used for scale only.
 */

class TangibleWealth {
  constructor() {
    this.billionaireId = 'musk';
    this.windowId = 'arrived'; // 'arrived' or a key of WINDOWS

    this.WINDOWS = {
      second: { label: '1 second', secs: 1 },
      minute: { label: '1 minute', secs: 60 },
      hour: { label: '1 hour', secs: 3600 },
      day: { label: '1 day', secs: 86400 },
      week: { label: '1 week', secs: 604800 },
      year: { label: '1 year', secs: 31536000 }
    };

    this.WORKING_LIFETIME_USD = 59384 * 40; // median US worker, 40-year career

    // priceUSD is an approximate US average
    this.ITEMS = [
      { id: 'coffee', icon: 'coffee', singular: 'coffee', plural: 'coffees', priceUSD: 6 },
      { id: 'pizza', icon: 'pizza', singular: 'family pizza night', plural: 'family pizza nights', priceUSD: 45 },
      { id: 'rent', icon: 'calendar', singular: 'month of rent', plural: 'months of rent', priceUSD: 1850 },
      { id: 'car', icon: 'car', singular: 'new car', plural: 'new cars', priceUSD: 38000 },
      { id: 'degree', icon: 'graduation-cap', singular: 'college degree', plural: 'college degrees', priceUSD: 42000 },
      { id: 'teacher', icon: 'book-open', singular: 'teacher salary (1 yr)', plural: 'teacher-years of salary', priceUSD: 66000 },
      { id: 'house', icon: 'home', singular: 'house, paid in cash', plural: 'houses, paid in cash', priceUSD: 420000 }
    ];

    // Height landmarks for the "stack of $100 bills" visual
    this.LANDMARKS = [
      { name: 'a tall person', m: 1.8 },
      { name: 'a giraffe', m: 5.5 },
      { name: 'the Statue of Liberty', m: 93 },
      { name: 'the Eiffel Tower', m: 330 },
      { name: 'the Burj Khalifa', m: 828 },
      { name: 'Mount Everest', m: 8849 },
      { name: 'the edge of space', m: 100000 },
      { name: 'the distance to the Moon', m: 384400000 }
    ];
    this.BILL_THICKNESS_M = 0.000109; // a $100 bill is ~0.109 mm thick

    this.nodes = null;
  }

  init() {
    this.render();
    this.bindControls();
    this.updateFrame(window.engine.virtualElapsedSeconds);
  }

  bindControls() {
    const bSelect = document.getElementById('tangible-billionaire-select');
    if (bSelect) {
      bSelect.addEventListener('change', (e) => {
        this.billionaireId = e.target.value;
        this.refresh();
      });
    }

    const wSelect = document.getElementById('tangible-window-select');
    if (wSelect) {
      wSelect.addEventListener('change', (e) => {
        this.windowId = e.target.value;
        this.refresh();
      });
    }
  }

  getBillionaire() {
    return TICKS_DATA.BILLIONAIRES.find(b => b.id === this.billionaireId) || TICKS_DATA.BILLIONAIRES[0];
  }

  /** Rebuild after data/currency/mode changes */
  refresh() {
    this.render();
    this.updateFrame(window.engine.virtualElapsedSeconds);
  }

  render() {
    const container = document.getElementById('tangible-items');
    if (!container) return;
    const b = this.getBillionaire();
    const perSecUSD = window.engine.getBillionaireAnnualVelocity(b) / TICKS_DATA.SECONDS_IN_YEAR;

    container.innerHTML = this.ITEMS.map(item => {
      const everySecs = item.priceUSD / perSecUSD;
      const price = window.engine.formatCompact(window.engine.convertAmount(item.priceUSD));
      return `
        <div class="rounded-xl bg-zinc-900/60 border border-zinc-800/90 p-4 flex flex-col gap-1.5">
          <div class="flex items-center justify-between text-zinc-500">
            <i data-lucide="${item.icon}" class="w-4 h-4 text-emerald-400"></i>
            <span class="text-[10px] font-mono">${price} each</span>
          </div>
          <div id="tangible-count-${item.id}" class="text-3xl font-mono font-extrabold tabular-nums text-zinc-100">0</div>
          <div id="tangible-label-${item.id}" class="text-xs text-zinc-400">${item.plural}</div>
          <div class="text-[11px] text-amber-400/90 font-mono mt-auto pt-1">one every ${window.engine.formatSecondsDuration(everySecs)}</div>
        </div>`;
    }).join('');

    this.nodes = {
      headline: document.getElementById('tangible-headline'),
      amount: document.getElementById('tangible-amount'),
      lifetimes: document.getElementById('tangible-lifetimes'),
      stackHeight: document.getElementById('tangible-stack-height'),
      stackCompare: document.getElementById('tangible-stack-compare'),
      stackBar: document.getElementById('tangible-stack-bar'),
      counts: this.ITEMS.map(item => ({
        item,
        count: document.getElementById(`tangible-count-${item.id}`),
        label: document.getElementById(`tangible-label-${item.id}`)
      }))
    };

    if (window.lucide) window.lucide.createIcons({ root: container });
  }

  formatCount(n) {
    if (n >= 100) return Math.floor(n).toLocaleString('en-US');
    if (n >= 10) return n.toFixed(1);
    return n.toFixed(2);
  }

  formatLength(m) {
    if (m < 0.01) return `${(m * 1000).toFixed(2)} mm`;
    if (m < 1) return `${(m * 100).toFixed(1)} cm`;
    if (m < 1000) return `${m.toFixed(1)} m`;
    if (m < 1e6) return `${(m / 1000).toFixed(1)} km`;
    return `${Math.round(m / 1000).toLocaleString('en-US')} km`;
  }

  /** Called every frame (cheap: ~10 text nodes) */
  updateFrame(elapsedSecs) {
    if (!this.nodes) return;
    const b = this.getBillionaire();
    const perSecUSD = window.engine.getBillionaireAnnualVelocity(b) / TICKS_DATA.SECONDS_IN_YEAR;

    const isLive = this.windowId === 'arrived';
    const secs = isLive ? elapsedSecs : (this.WINDOWS[this.windowId] || this.WINDOWS.day).secs;
    const usd = perSecUSD * secs;

    const windowLabel = isLive
      ? `${window.engine.formatSessionTime(elapsedSecs).slice(0, 8)} on this page`
      : this.WINDOWS[this.windowId].label;

    if (this.nodes.headline) {
      this.nodes.headline.textContent = `In ${windowLabel}, ${b.name} gains`;
    }
    if (this.nodes.amount) {
      this.nodes.amount.textContent = window.engine.formatCurrency(window.engine.convertAmount(usd), 2);
    }

    // Working lifetimes
    if (this.nodes.lifetimes) {
      const lifetimes = usd / this.WORKING_LIFETIME_USD;
      let text;
      if (lifetimes < 0.01) {
        text = `${(lifetimes * 100).toFixed(2)}% of a typical 40-year working career`;
      } else if (lifetimes < 1) {
        text = `${(lifetimes * 100).toFixed(0)}% of a typical 40-year working career`;
      } else {
        text = `${this.formatCount(lifetimes)} full working lifetimes of a typical US worker`;
      }
      this.nodes.lifetimes.textContent = text;
    }

    // Item counts
    this.nodes.counts.forEach(({ item, count }) => {
      if (count) count.textContent = this.formatCount(usd / item.priceUSD);
    });

    // Stack of $100 bills
    const height = (usd / 100) * this.BILL_THICKNESS_M;
    if (this.nodes.stackHeight) this.nodes.stackHeight.textContent = this.formatLength(height);

    if (this.nodes.stackCompare) {
      let landmark = null;
      for (const l of this.LANDMARKS) if (height >= l.m) landmark = l;
      if (!landmark) {
        this.nodes.stackCompare.textContent = 'and growing... keep watching';
      } else {
        const times = height / landmark.m;
        this.nodes.stackCompare.textContent = times < 1.5
          ? `about as tall as ${landmark.name}`
          : `${times.toFixed(1)}x the height of ${landmark.name}`;
      }
    }

    if (this.nodes.stackBar) {
      // Log-scaled progress from 1 mm to the Moon distance
      const lo = Math.log10(0.001);
      const hi = Math.log10(384400000);
      const pct = Math.max(0, Math.min(100, ((Math.log10(Math.max(height, 0.001)) - lo) / (hi - lo)) * 100));
      this.nodes.stackBar.style.width = `${pct.toFixed(1)}%`;
    }
  }
}

window.tangibleWealth = new TangibleWealth();

