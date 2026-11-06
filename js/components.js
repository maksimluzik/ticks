/**
 * TICKS // UI Components Builder
 * Socioeconomic Benchmarks, Billionaire Velocity Cards, Class Parity Clocks,
 * Methodology Modal, and Snapshot Generator.
 */

class UIComponents {
  constructor() {
    this.sortBy = 'velocity'; // 'velocity', 'networth', 'name'
    this.billionaireElements = new Map();
    this.socioElements = new Map();
    this.activeParityBillionaire = 'musk';
  }

  init() {
    this.renderSocioeconomicRails();
    this.renderBillionaireCards();
    this.bindControls();
    this.cacheDomNodes();
  }

  bindControls() {
    // Sort buttons
    const sortSelect = document.getElementById('billionaire-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.renderBillionaireCards();
        this.cacheDomNodes();
      });
    }

    // Parity reference billionaire toggle in Human Scale rail
    const parityBillionaireSelect = document.getElementById('human-scale-billionaire-select');
    if (parityBillionaireSelect) {
      parityBillionaireSelect.addEventListener('change', (e) => {
        this.activeParityBillionaire = e.target.value;
        this.updateHumanScaleParities();
      });
    }
  }

  // --- 1. Socioeconomic Class Rail ("The Human Scale") ---

  renderSocioeconomicRails() {
    const container = document.getElementById('socioeconomic-rail');
    if (!container) return;

    let html = '';

    TICKS_DATA.SOCIOECONOMIC_TIERS.forEach(tier => {
      const annualConverted = window.engine.convertAmount(tier.annualUSD);
      const perSec = annualConverted / TICKS_DATA.SECONDS_IN_YEAR;
      const hourly = annualConverted / 2080;
      const daily = annualConverted / 365;

      html += `
        <div class="relative bg-zinc-900/60 rounded-xl p-5 border border-zinc-800/90 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/80 group"
             data-tier-id="${tier.id}">
          <!-- Header -->
          <div class="flex items-start justify-between gap-3 mb-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${tier.color}"></span>
                <h3 class="text-base font-semibold text-zinc-100">${tier.tier}</h3>
              </div>
              <p class="text-xs text-zinc-400 mt-0.5">${tier.subtitle}</p>
            </div>
            <span class="inline-block px-2.5 py-1 text-xs font-mono font-medium rounded-full ${tier.badgeClass} border">
              ${window.engine.formatCompact(annualConverted)}/yr
            </span>
          </div>

          <!-- Description -->
          <p class="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-2">
            ${tier.description}
          </p>

          <!-- Live Session Accumulation for this class -->
          <div class="bg-black/40 rounded-lg p-3 border border-zinc-800/80 mb-3.5">
            <div class="text-[11px] uppercase tracking-wider text-zinc-500 font-medium mb-1 flex items-center justify-between">
              <span>Earned in this session</span>
              <span class="text-[10px] text-zinc-600 font-mono">1x real-time</span>
            </div>
            <div class="text-xl md:text-2xl font-mono font-bold text-zinc-200 tracking-tight tabular-nums"
                 id="socio-live-${tier.id}">
              ${window.engine.formatMicroCurrency(0)}
            </div>
          </div>

          <!-- Rates breakdown -->
          <div class="grid grid-cols-3 gap-2 py-2 border-t border-b border-zinc-800/70 mb-3 text-center">
            <div>
              <div class="text-[10px] uppercase text-zinc-500">Per Second</div>
              <div class="text-xs font-mono font-medium text-zinc-300 tabular-nums" id="socio-sec-${tier.id}">
                ${window.engine.formatMicroCurrency(perSec)}
              </div>
            </div>
            <div>
              <div class="text-[10px] uppercase text-zinc-500">Per Work-Hr</div>
              <div class="text-xs font-mono font-medium text-zinc-300 tabular-nums" id="socio-hr-${tier.id}">
                ${window.engine.formatCurrency(hourly)}
              </div>
            </div>
            <div>
              <div class="text-[10px] uppercase text-zinc-500">Per Day</div>
              <div class="text-xs font-mono font-medium text-zinc-300 tabular-nums" id="socio-day-${tier.id}">
                ${window.engine.formatCurrency(daily)}
              </div>
            </div>
          </div>

          <!-- Contrast Callout: Seconds for billionaire to earn this annual income -->
          <div class="rounded-lg bg-zinc-950/70 p-2.5 border border-zinc-800/80 text-xs">
            <div class="flex items-center justify-between text-zinc-400">
              <span class="text-[11px] text-zinc-400 flex items-center gap-1.5">
                <i data-lucide="zap" class="w-3.5 h-3.5 text-amber-400"></i>
                <span id="parity-name-${tier.id}">Elon Musk</span> surpasses in:
              </span>
              <span class="font-mono font-bold text-amber-400 text-xs" id="parity-time-${tier.id}">
                --
              </span>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    this.updateHumanScaleParities();
  }

  updateHumanScaleParities() {
    const b = TICKS_DATA.BILLIONAIRES.find(item => item.id === this.activeParityBillionaire) || TICKS_DATA.BILLIONAIRES[0];
    
    TICKS_DATA.SOCIOECONOMIC_TIERS.forEach(tier => {
      const nameElem = document.getElementById(`parity-name-${tier.id}`);
      const timeElem = document.getElementById(`parity-time-${tier.id}`);

      if (nameElem) nameElem.textContent = b.name;

      if (timeElem) {
        const secs = window.engine.getParitySeconds(b, tier.annualUSD);
        timeElem.textContent = window.engine.formatSecondsDuration(secs);
      }
    });
  }

  // --- 2. Billionaire Leaderboard & Velocity Cards ---

  getSortedBillionaires() {
    const list = [...TICKS_DATA.BILLIONAIRES];

    if (this.sortBy === 'velocity') {
      list.sort((a, b) => {
        const velA = window.engine.getBillionaireAnnualVelocity(a);
        const velB = window.engine.getBillionaireAnnualVelocity(b);
        return velB - velA;
      });
    } else if (this.sortBy === 'networth') {
      list.sort((a, b) => b.netWorth - a.netWorth);
    } else if (this.sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }

  renderBillionaireCards() {
    const container = document.getElementById('billionaire-cards-grid');
    if (!container) return;

    const list = this.getSortedBillionaires();
    let html = '';

    list.forEach((b, index) => {
      const netWorthConverted = window.engine.convertAmount(b.netWorth);
      const annualVelocityConverted = window.engine.convertAmount(window.engine.getBillionaireAnnualVelocity(b));
      const perSec = annualVelocityConverted / TICKS_DATA.SECONDS_IN_YEAR;
      const perMin = annualVelocityConverted / (365 * 24 * 60);
      const perHr = annualVelocityConverted / (365 * 24);
      const perDay = annualVelocityConverted / 365;

      // Parity seconds for class benchmarks
      const lowerSecs = window.engine.getParitySeconds(b, 30000);
      const middleSecs = window.engine.getParitySeconds(b, 75000);
      const upperSecs = window.engine.getParitySeconds(b, 160000);

      html += `
        <div class="relative bg-zinc-900/60 rounded-xl p-5 border border-zinc-800/90 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/80 group flex flex-col justify-between"
             id="b-card-${b.id}"
             style="--accent: ${b.accentColor}">
          
          <!-- Top Row: Avatar, Identity, Net Worth Badge -->
          <div>
            <div class="flex items-start justify-between gap-3 mb-4">
              <div class="flex items-center gap-3">
                <!-- Avatar with fallback initials -->
                <div class="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 shrink-0 group-hover:border-zinc-500 transition-colors">
                  <img src="${b.avatar}" 
                       alt="${b.name}" 
                       class="w-full h-full object-cover object-top"
                       loading="lazy"
                       onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                  <div class="hidden w-full h-full items-center justify-center font-bold text-sm text-zinc-300 bg-gradient-to-br ${b.gradient}">
                    ${b.fallbackInitials}
                  </div>
                </div>

                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-base font-bold text-zinc-100 group-hover:text-white transition-colors">${b.name}</h3>
                    <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-semibold">#${index + 1}</span>
                  </div>
                  <p class="text-xs text-zinc-400 mt-0.5">${b.primaryEquity}</p>
                </div>
              </div>

              <!-- Net Worth Badge -->
              <div class="text-right">
                <div class="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Net Worth</div>
                <div class="text-sm font-mono font-bold text-zinc-200">
                  ${window.engine.formatCompact(netWorthConverted)}
                </div>
              </div>
            </div>

            <!-- Live Session Accumulation Display -->
            <div class="bg-black/50 rounded-xl p-3.5 border border-zinc-800/90 mb-4 relative overflow-hidden">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[11px] uppercase tracking-wider text-zinc-400 font-medium flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Accumulated In This Session
                </span>
                <span class="text-[10px] text-zinc-500 font-mono" id="b-rate-sec-label-${b.id}">
                  +${window.engine.formatCurrency(perSec)}/sec
                </span>
              </div>
              <div class="text-2xl md:text-3xl font-mono font-extrabold text-emerald-400 tracking-tight tabular-nums"
                   id="b-counter-${b.id}">
                ${window.engine.formatCurrency(0)}
              </div>
              
              <!-- Subtle bottom velocity indicator bar -->
              <div class="w-full h-1 bg-zinc-800/60 rounded-full mt-2.5 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300 rounded-full"
                     id="b-session-meter-${b.id}"
                     style="width: 0%"></div>
              </div>
            </div>

            <!-- Rate Velocity Matrix: Sec, Min, Hour, Day -->
            <div class="grid grid-cols-4 gap-1.5 py-2.5 px-2 bg-zinc-950/40 rounded-lg border border-zinc-800/60 mb-4 text-center">
              <div>
                <div class="text-[10px] uppercase text-zinc-500">Per Sec</div>
                <div class="text-xs font-mono font-semibold text-zinc-200 tabular-nums" id="b-rate-sec-${b.id}">
                  ${window.engine.formatCurrency(perSec)}
                </div>
              </div>
              <div>
                <div class="text-[10px] uppercase text-zinc-500">Per Min</div>
                <div class="text-xs font-mono font-semibold text-zinc-200 tabular-nums" id="b-rate-min-${b.id}">
                  ${window.engine.formatCompact(perMin)}
                </div>
              </div>
              <div>
                <div class="text-[10px] uppercase text-zinc-500">Per Hour</div>
                <div class="text-xs font-mono font-semibold text-zinc-200 tabular-nums" id="b-rate-hr-${b.id}">
                  ${window.engine.formatCompact(perHr)}
                </div>
              </div>
              <div>
                <div class="text-[10px] uppercase text-zinc-500">Per Day</div>
                <div class="text-xs font-mono font-semibold text-zinc-200 tabular-nums" id="b-rate-day-${b.id}">
                  ${window.engine.formatCompact(perDay)}
                </div>
              </div>
            </div>

            <!-- Class Parity Clock Section -->
            <div class="space-y-2 mb-4 bg-zinc-950/70 p-3 rounded-lg border border-zinc-800/70">
              <div class="text-[11px] font-medium text-zinc-400 flex items-center justify-between">
                <span class="flex items-center gap-1.5">
                  <i data-lucide="timer" class="w-3.5 h-3.5 text-cyan-400"></i>
                  Class Parity Clock
                </span>
                <span class="text-[10px] text-zinc-500">Time to earn 1 year</span>
              </div>

              <!-- Lower Class Parity -->
              <div class="flex items-center justify-between text-xs">
                <span class="text-zinc-400 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  Lower Class (${window.engine.formatCompact(window.engine.convertAmount(30000))}):
                </span>
                <span class="font-mono font-semibold text-zinc-200" id="b-parity-lower-${b.id}">
                  ${window.engine.formatSecondsDuration(lowerSecs)}
                </span>
              </div>

              <!-- Middle Class Parity -->
              <div class="flex items-center justify-between text-xs">
                <span class="text-zinc-400 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                  Middle Class (${window.engine.formatCompact(window.engine.convertAmount(75000))}):
                </span>
                <span class="font-mono font-semibold text-cyan-400" id="b-parity-middle-${b.id}">
                  ${window.engine.formatSecondsDuration(middleSecs)}
                </span>
              </div>

              <!-- Upper-Middle Class Parity -->
              <div class="flex items-center justify-between text-xs">
                <span class="text-zinc-400 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Upper-Middle (${window.engine.formatCompact(window.engine.convertAmount(160000))}):
                </span>
                <span class="font-mono font-semibold text-emerald-400" id="b-parity-upper-${b.id}">
                  ${window.engine.formatSecondsDuration(upperSecs)}
                </span>
              </div>
            </div>
          </div>

          <!-- Card Footer: Context Fact -->
          <div class="text-[11px] text-zinc-400 border-t border-zinc-800/70 pt-2.5 italic">
            💡 ${b.funFact}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    if (window.lucide) {
      window.lucide.createIcons({ root: container });
    }
  }

  // --- 3. DOM Cache for 60fps Animation Loop ---

  cacheDomNodes() {
    this.cachedNodes = {
      heroTime: document.getElementById('hero-elapsed-time'),
      heroTotalCombined: document.getElementById('hero-total-combined'),
      heroCombinedSecRate: document.getElementById('hero-combined-sec-rate'),
      heroMiddleClassEquiv: document.getElementById('hero-middle-class-equiv'),
      heroMinWageEquiv: document.getElementById('hero-minwage-equiv'),
      
      // Billionaires map
      billionaires: TICKS_DATA.BILLIONAIRES.map(b => ({
        id: b.id,
        rawBillionaire: b,
        counterElem: document.getElementById(`b-counter-${b.id}`),
        meterElem: document.getElementById(`b-session-meter-${b.id}`)
      })),

      // Socioeconomic tiers map
      socioTiers: TICKS_DATA.SOCIOECONOMIC_TIERS.map(t => ({
        id: t.id,
        rawTier: t,
        liveElem: document.getElementById(`socio-live-${t.id}`)
      }))
    };
  }

  /**
   * Called every RAF frame to update live billionaire counters and hero
   */
  updateFrame(elapsedSecs) {
    if (!this.cachedNodes) return;

    // 1. Hero timer update
    if (this.cachedNodes.heroTime) {
      this.cachedNodes.heroTime.textContent = window.engine.formatSessionTime(elapsedSecs);
    }

    // 2. Hero Combined Total
    const combinedRatePerSec = window.engine.getCombinedPerSecond();
    const combinedAccumulated = combinedRatePerSec * elapsedSecs;

    if (this.cachedNodes.heroTotalCombined) {
      this.cachedNodes.heroTotalCombined.textContent = window.engine.formatCurrency(combinedAccumulated, 2);
    }

    if (this.cachedNodes.heroCombinedSecRate) {
      this.cachedNodes.heroCombinedSecRate.textContent = `+${window.engine.formatCurrency(combinedRatePerSec)}/sec`;
    }

    // Combined Equivalency metrics
    const middleClassAnnual = window.engine.convertAmount(75000);
    const middleEquiv = combinedAccumulated / middleClassAnnual;
    if (this.cachedNodes.heroMiddleClassEquiv) {
      this.cachedNodes.heroMiddleClassEquiv.textContent = `${middleEquiv.toFixed(1)}x`;
    }

    const minWageAnnual = window.engine.convertAmount(15080);
    const minWageEquiv = combinedAccumulated / minWageAnnual;
    if (this.cachedNodes.heroMinWageEquiv) {
      this.cachedNodes.heroMinWageEquiv.textContent = `${minWageEquiv.toFixed(1)}x`;
    }

    // 3. Socioeconomic live counters
    this.cachedNodes.socioTiers.forEach(item => {
      if (item.liveElem) {
        const annualConverted = window.engine.convertAmount(item.rawTier.annualUSD);
        const perSec = annualConverted / TICKS_DATA.SECONDS_IN_YEAR;
        const accumulated = perSec * elapsedSecs;
        item.liveElem.textContent = window.engine.formatMicroCurrency(accumulated);
      }
    });

    // 4. Billionaires live counters & meters
    this.cachedNodes.billionaires.forEach(item => {
      const perSec = window.engine.getBillionairePerSecond(item.rawBillionaire);
      const accumulated = perSec * elapsedSecs;

      if (item.counterElem) {
        item.counterElem.textContent = window.engine.formatCurrency(accumulated, 2);
      }

      // Session meter loop relative to Middle Class Salary ($75k)
      if (item.meterElem) {
        const target = window.engine.convertAmount(75000);
        const cycleProgress = (accumulated % target) / target;
        item.meterElem.style.width = `${(cycleProgress * 100).toFixed(1)}%`;
      }
    });
  }

  refreshAllTextForCurrencyOrMode() {
    this.renderSocioeconomicRails();
    this.renderBillionaireCards();
    this.cacheDomNodes();
    if (window.tangibleWealth) window.tangibleWealth.refresh();
    if (window.netWorthRank) window.netWorthRank.refresh();
  }
}

window.uiComponents = new UIComponents();
