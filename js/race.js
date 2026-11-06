/**
 * TICKS // Interactive "Race Your Salary & Class" Visualizer
 * Dual accumulation racers, custom presets, real-time parity calculations,
 * and contextual milestone pop-ins with celebratory sound/confetti.
 */

class RaceVisualizer {
  constructor() {
    this.userAnnualUSD = 75000; // default to Middle Class
    this.userType = 'annual'; // 'annual', 'monthly', 'hourly'
    this.selectedBillionaireId = 'musk';
    
    // Milestones state tracking for unlocks during current session
    this.unlockedMilestones = new Set();
    this.milestoneHistory = [];
  }

  init() {
    this.bindEvents();
    this.syncPresetActiveState();
    this.updateUserRateDisplay();
  }

  bindEvents() {
    // Preset buttons
    const presetContainer = document.getElementById('race-presets');
    if (presetContainer) {
      presetContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-preset-id]');
        if (btn) {
          const presetId = btn.getAttribute('data-preset-id');
          this.applyPreset(presetId);
        }
      });
    }

    // Custom salary input
    const salaryInput = document.getElementById('custom-salary-input');
    if (salaryInput) {
      salaryInput.addEventListener('input', (e) => {
        const rawVal = parseFloat(e.target.value) || 0;
        this.setCustomSalary(rawVal);
      });
    }

    // Custom period selector (Annual, Monthly, Hourly)
    const periodSelect = document.getElementById('custom-salary-period');
    if (periodSelect) {
      periodSelect.addEventListener('change', (e) => {
        this.userType = e.target.value;
        const rawVal = parseFloat(document.getElementById('custom-salary-input').value) || 0;
        this.setCustomSalary(rawVal);
      });
    }

    // Billionaire select dropdown
    const billionaireSelect = document.getElementById('race-billionaire-select');
    if (billionaireSelect) {
      billionaireSelect.addEventListener('change', (e) => {
        this.selectedBillionaireId = e.target.value;
        this.resetMilestones();
        this.updateStaticComparisons();
      });
    }
  }

  getSelectedBillionaire() {
    return TICKS_DATA.BILLIONAIRES.find(b => b.id === this.selectedBillionaireId) || TICKS_DATA.BILLIONAIRES[0];
  }

  applyPreset(presetId) {
    const preset = TICKS_DATA.PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    this.userAnnualUSD = preset.annualUSD;
    this.userType = 'annual';

    const input = document.getElementById('custom-salary-input');
    const periodSelect = document.getElementById('custom-salary-period');
    if (input) {
      const converted = Math.round(window.engine.convertAmount(this.userAnnualUSD));
      input.value = converted;
    }
    if (periodSelect) {
      periodSelect.value = 'annual';
    }

    this.syncPresetActiveState(presetId);
    this.resetMilestones();
    this.updateUserRateDisplay();
    this.updateStaticComparisons();
  }

  setCustomSalary(value) {
    // Convert input back to USD annual equivalent
    const inUSD = window.engine.convertFromCurrentCurrency(value);
    if (this.userType === 'hourly') {
      this.userAnnualUSD = inUSD * 2080;
    } else if (this.userType === 'monthly') {
      this.userAnnualUSD = inUSD * 12;
    } else {
      this.userAnnualUSD = inUSD;
    }

    this.syncPresetActiveState(null);
    this.resetMilestones();
    this.updateUserRateDisplay();
    this.updateStaticComparisons();
  }

  syncPresetActiveState(activeId) {
    const buttons = document.querySelectorAll('#race-presets button');
    buttons.forEach(btn => {
      const id = btn.getAttribute('data-preset-id');
      if (id === activeId) {
        btn.classList.add('bg-cyan-500/20', 'border-cyan-500', 'text-cyan-300');
        btn.classList.remove('bg-zinc-900/60', 'border-zinc-800', 'text-zinc-400');
      } else {
        btn.classList.remove('bg-cyan-500/20', 'border-cyan-500', 'text-cyan-300');
        btn.classList.add('bg-zinc-900/60', 'border-zinc-800', 'text-zinc-400');
      }
    });
  }

  resetMilestones() {
    this.unlockedMilestones.clear();
    this.milestoneHistory = [];
    const feed = document.getElementById('milestone-feed');
    if (feed) {
      feed.innerHTML = `
        <div class="text-xs text-zinc-500 italic py-2 text-center" id="empty-milestone-msg">
          Live milestones unlock automatically as seconds tick...
        </div>
      `;
    }
  }

  updateUserRateDisplay() {
    const rateElem = document.getElementById('user-rate-per-sec');
    const annualConverted = window.engine.convertAmount(this.userAnnualUSD);
    const perSec = annualConverted / TICKS_DATA.SECONDS_IN_YEAR;
    if (rateElem) {
      rateElem.textContent = `${window.engine.formatMicroCurrency(perSec)}/sec`;
    }

    const hrElem = document.getElementById('user-rate-per-hr');
    if (hrElem) {
      const perHr = annualConverted / 2080;
      hrElem.textContent = `${window.engine.formatCurrency(perHr)}/work-hr`;
    }
  }

  updateStaticComparisons() {
    const b = this.getSelectedBillionaire();
    const annualGrowthUSD = window.engine.getBillionaireAnnualVelocity(b);
    const bRatePerSecUSD = annualGrowthUSD / TICKS_DATA.SECONDS_IN_YEAR;
    const userRatePerSecUSD = (this.userAnnualUSD || 1) / TICKS_DATA.SECONDS_IN_YEAR;

    const ratio = bRatePerSecUSD / userRatePerSecUSD;
    const ratioElem = document.getElementById('race-ratio-badge');
    if (ratioElem) {
      ratioElem.textContent = `${Math.round(ratio).toLocaleString()}x FASTER`;
    }

    // Time to match annual salary
    const timeForAnnual = this.userAnnualUSD / bRatePerSecUSD;
    const annualTimeElem = document.getElementById('time-for-user-annual');
    if (annualTimeElem) {
      annualTimeElem.textContent = window.engine.formatSecondsDuration(timeForAnnual);
    }

    // Time to match monthly salary
    const timeForMonthly = (this.userAnnualUSD / 12) / bRatePerSecUSD;
    const monthlyTimeElem = document.getElementById('time-for-user-monthly');
    if (monthlyTimeElem) {
      monthlyTimeElem.textContent = window.engine.formatSecondsDuration(timeForMonthly);
    }

    // Time to match 40-year career
    const careerUSD = this.userAnnualUSD * 40;
    const timeForCareer = careerUSD / bRatePerSecUSD;
    const careerTimeElem = document.getElementById('time-for-user-career');
    if (careerTimeElem) {
      careerTimeElem.textContent = window.engine.formatSecondsDuration(timeForCareer);
    }
  }

  /**
   * Called every RAF frame with elapsed simulation seconds
   */
  updateFrame(elapsedSecs) {
    const b = this.getSelectedBillionaire();
    const bRatePerSec = window.engine.getBillionairePerSecond(b);
    const userAnnualConverted = window.engine.convertAmount(this.userAnnualUSD);
    const userRatePerSec = userAnnualConverted / TICKS_DATA.SECONDS_IN_YEAR;

    const userAccumulated = userRatePerSec * elapsedSecs;
    const bAccumulated = bRatePerSec * elapsedSecs;

    // Update numbers
    const userAccElem = document.getElementById('race-user-accumulated');
    if (userAccElem) {
      userAccElem.textContent = window.engine.formatMicroCurrency(userAccumulated);
    }

    const bAccElem = document.getElementById('race-billionaire-accumulated');
    if (bAccElem) {
      bAccElem.textContent = window.engine.formatCurrency(bAccumulated, 2);
    }

    // Animated progress bars
    // Benchmark reference: User's annual salary
    const targetScale = Math.max(userAnnualConverted, 1);
    const userPercent = Math.min((userAccumulated / targetScale) * 100, 100);
    const bPercent = Math.min((bAccumulated / targetScale) * 100, 100);

    const userBar = document.getElementById('race-user-progress-bar');
    if (userBar) {
      userBar.style.width = `${userPercent.toFixed(2)}%`;
    }

    const bBar = document.getElementById('race-billionaire-progress-bar');
    if (bBar) {
      bBar.style.width = `${bPercent.toFixed(2)}%`;
    }

    // Check milestones
    this.checkMilestones(bAccumulated, elapsedSecs, b);
  }

  checkMilestones(bAccumulatedConverted, elapsedSecs, billionaire) {
    const userAnnualConverted = window.engine.convertAmount(this.userAnnualUSD);

    // Dynamic list of milestones relative to user & world
    const milestonesToCheck = [
      {
        id: 'user_hourly',
        name: 'Your Hourly Pay',
        amount: userAnnualConverted / 2080,
        icon: 'clock',
        color: 'text-cyan-400'
      },
      {
        id: 'user_monthly_rent',
        name: 'Average Monthly Rent',
        amount: window.engine.convertAmount(1850),
        icon: 'home',
        color: 'text-amber-400'
      },
      {
        id: 'user_monthly_salary',
        name: 'Your Entire Monthly Pay',
        amount: userAnnualConverted / 12,
        icon: 'calendar',
        color: 'text-emerald-400'
      },
      {
        id: 'groceries_annual',
        name: '1 Year of Groceries',
        amount: window.engine.convertAmount(5400),
        icon: 'shopping-cart',
        color: 'text-teal-400'
      },
      {
        id: 'new_vehicle',
        name: 'Brand New Automobile',
        amount: window.engine.convertAmount(38000),
        icon: 'car',
        color: 'text-blue-400'
      },
      {
        id: 'user_annual_salary',
        name: 'Your Entire Annual Salary',
        amount: userAnnualConverted,
        icon: 'award',
        color: 'text-indigo-400'
      },
      {
        id: 'university_tuition',
        name: '4-Year College Tuition',
        amount: window.engine.convertAmount(42000),
        icon: 'graduation-cap',
        color: 'text-purple-400'
      },
      {
        id: 'home_downpayment',
        name: '20% Home Down Payment',
        amount: window.engine.convertAmount(84000),
        icon: 'key',
        color: 'text-rose-400'
      },
      {
        id: 'full_house',
        name: 'Median Home Purchased Cash',
        amount: window.engine.convertAmount(420000),
        icon: 'building',
        color: 'text-emerald-300'
      },
      {
        id: 'user_career',
        name: 'Your Entire 40-Year Career',
        amount: userAnnualConverted * 40,
        icon: 'sparkles',
        color: 'text-yellow-400'
      }
    ];

    // Merge relatable life-expense milestones from the curated dataset
    const knownIds = new Set(milestonesToCheck.map(m => m.id));
    (TICKS_DATA.RELATABLE_MILESTONES || []).forEach(rm => {
      if (knownIds.has(rm.id)) return;
      milestonesToCheck.push({
        id: rm.id,
        name: rm.name.replace(/\s*\(\$[\d,]+\)\s*$/, ''),
        amount: window.engine.convertAmount(rm.amountUSD),
        icon: rm.icon || 'star',
        color: 'text-amber-300'
      });
    });

    // Sort by threshold amount
    milestonesToCheck.sort((a, b) => a.amount - b.amount);

    for (const m of milestonesToCheck) {
      if (bAccumulatedConverted >= m.amount && !this.unlockedMilestones.has(m.id)) {
        this.unlockedMilestones.add(m.id);
        this.triggerMilestoneUnlock(m, elapsedSecs, billionaire);
      }
    }
  }

  triggerMilestoneUnlock(milestone, elapsedSecs, billionaire) {
    // Sound & celebratory effect
    if (window.soundEngine) {
      window.soundEngine.playMilestoneChime();
    }

    if (typeof confetti === 'function' && elapsedSecs < 120) {
      try {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.75 },
          colors: ['#10b981', '#06b6d4', '#f59e0b']
        });
      } catch (e) {
        // Safe fallback
      }
    }

    // Add to live milestone feed
    const feed = document.getElementById('milestone-feed');
    if (!feed) return;

    const emptyMsg = document.getElementById('empty-milestone-msg');
    if (emptyMsg) emptyMsg.remove();

    const formattedAmount = window.engine.formatCurrency(milestone.amount);
    const formattedTime = window.engine.formatSecondsDuration(elapsedSecs);

    const badge = document.createElement('div');
    badge.className = 'milestone-badge flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 shadow-md backdrop-blur-md animate-fade-in-up';
    badge.innerHTML = `
      <div class="flex items-center gap-2.5">
        <span class="p-1 rounded bg-zinc-800/80 ${milestone.color}">
          <i data-lucide="${milestone.icon}" class="w-3.5 h-3.5"></i>
        </span>
        <div>
          <div class="font-medium text-zinc-200">${milestone.name}</div>
          <div class="text-[11px] text-zinc-500 font-mono">${formattedAmount}</div>
        </div>
      </div>
      <div class="text-right">
        <span class="inline-flex items-center gap-1 font-mono font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px]">
          ⚡ ${formattedTime}
        </span>
      </div>
    `;

    feed.prepend(badge);

    // Keep max 6 visible milestones
    while (feed.children.length > 6) {
      feed.removeChild(feed.lastChild);
    }

    if (window.lucide) {
      window.lucide.createIcons({ root: badge });
    }
  }
}

window.raceVisualizer = new RaceVisualizer();
