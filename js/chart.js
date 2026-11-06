/**
 * TICKS // Comparative Velocity Scale Visualizer
 * Zero-dependency SVG logarithmic and linear scale visualizer comparing
 * socioeconomic tiers to billionaire velocity.
 */

class ScaleChart {
  constructor() {
    this.scaleMode = 'log'; // 'log' or 'linear'
    this.container = null;
  }

  init() {
    this.container = document.getElementById('scale-chart-container');
    const toggleLog = document.getElementById('chart-scale-log');
    const toggleLinear = document.getElementById('chart-scale-linear');

    if (toggleLog && toggleLinear) {
      toggleLog.addEventListener('click', () => {
        this.scaleMode = 'log';
        toggleLog.classList.add('bg-zinc-800', 'text-zinc-100');
        toggleLog.classList.remove('text-zinc-400');
        toggleLinear.classList.remove('bg-zinc-800', 'text-zinc-100');
        toggleLinear.classList.add('text-zinc-400');
        this.render();
      });

      toggleLinear.addEventListener('click', () => {
        this.scaleMode = 'linear';
        toggleLinear.classList.add('bg-zinc-800', 'text-zinc-100');
        toggleLinear.classList.remove('text-zinc-400');
        toggleLog.classList.remove('bg-zinc-800', 'text-zinc-100');
        toggleLog.classList.add('text-zinc-400');
        this.render();
      });
    }

    this.render();
  }

  render() {
    if (!this.container) return;

    // Build data list: socioeconomic tiers + featured billionaires
    const items = [
      ...TICKS_DATA.SOCIOECONOMIC_TIERS.map(t => ({
        id: t.id,
        name: t.tier,
        category: 'Class Benchmark',
        annualUSD: t.annualUSD,
        color: t.color,
        isBillionaire: false
      })),
      ...TICKS_DATA.BILLIONAIRES.map(b => ({
        id: b.id,
        name: b.name,
        category: b.companies[0],
        annualUSD: window.engine.getBillionaireAnnualVelocity(b),
        color: b.accentColor,
        isBillionaire: true
      }))
    ];

    // Sort ascending by annualUSD
    items.sort((a, b) => a.annualUSD - b.annualUSD);

    const minVal = items[0].annualUSD;
    const maxVal = items[items.length - 1].annualUSD;

    const width = 800;
    const rowHeight = 36;
    const height = items.length * rowHeight + 40;

    let barsHtml = '';

    items.forEach((item, index) => {
      const y = index * rowHeight + 10;
      let percent = 0;

      if (this.scaleMode === 'log') {
        const logMin = Math.log10(minVal);
        const logMax = Math.log10(maxVal);
        percent = ((Math.log10(item.annualUSD) - logMin) / (logMax - logMin)) * 82 + 5;
      } else {
        percent = (item.annualUSD / maxVal) * 85;
        if (percent < 0.5) percent = 0.5; // keep visible
      }

      const convertedAnnual = window.engine.convertAmount(item.annualUSD);
      const perSec = convertedAnnual / TICKS_DATA.SECONDS_IN_YEAR;
      const formattedPerSec = window.engine.formatMicroCurrency(perSec);
      const formattedAnnual = window.engine.formatCompact(convertedAnnual);

      barsHtml += `
        <div class="flex items-center gap-3 group py-1.5 transition-colors hover:bg-zinc-900/40 px-2 rounded-lg" data-chart-item="${item.id}">
          <div class="w-36 md:w-44 truncate text-xs font-medium text-zinc-300 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full inline-block shrink-0" style="background-color: ${item.color}"></span>
            <span class="truncate">${item.name}</span>
          </div>

          <div class="flex-1 h-6 bg-zinc-900/80 rounded-md overflow-hidden relative border border-zinc-800/80 flex items-center">
            <div class="h-full rounded-md transition-all duration-500 relative flex items-center justify-end pr-2" 
                 style="width: ${percent.toFixed(1)}%; background: linear-gradient(90deg, ${item.color}22, ${item.color}cc)">
            </div>
            <span class="absolute left-2 text-[11px] font-mono font-medium text-zinc-300">
              ${formattedAnnual}/yr <span class="text-zinc-500 text-[10px]">(${formattedPerSec}/s)</span>
            </span>
          </div>
        </div>
      `;
    });

    this.container.innerHTML = `
      <div class="space-y-1">
        ${barsHtml}
      </div>
    `;
  }
}

window.scaleChart = new ScaleChart();
