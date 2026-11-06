/**
 * TICKS // Application Orchestrator & State Controller
 * Binds global header controls, RAF animation loop, modal drawers,
 * and keyboard shortcuts.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Core Systems
  window.engine.init();
  window.uiComponents.init();
  window.raceVisualizer.init();
  window.scaleChart.init();

  // Populate Billionaire Select Options in Race Arena
  populateBillionaireDropdowns();

  // Bind Global Header & Navigation Controls
  bindGlobalControls();

  // Bind Methodology Drawer & Snapshot Modal
  bindModals();

  // Bind Keyboard Shortcuts
  bindKeyboardShortcuts();

  // Start 60fps Animation Loop
  startAnimationLoop();

  // Render KaTeX Formulas in Methodology drawer
  renderMathFormulas();

  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Hook into Dynamic Live Data Sync
  if (window.liveSyncService) {
    window.liveSyncService.onSync(() => {
      populateBillionaireDropdowns();
      window.uiComponents.refreshAllTextForCurrencyOrMode();
      if (window.lucide) window.lucide.createIcons();
    });
    // Trigger live data fetch from reliable internet sources
    window.liveSyncService.syncAll();
  }
});

function populateBillionaireDropdowns() {
  const raceSelect = document.getElementById('race-billionaire-select');
  const humanScaleSelect = document.getElementById('human-scale-billionaire-select');

  if (raceSelect) {
    raceSelect.innerHTML = TICKS_DATA.BILLIONAIRES.map(b => `
      <option value="${b.id}">${b.name} (${b.companies[0]})</option>
    `).join('');
  }

  if (humanScaleSelect) {
    humanScaleSelect.innerHTML = TICKS_DATA.BILLIONAIRES.map(b => `
      <option value="${b.id}">${b.name}</option>
    `).join('');
  }
}

function bindGlobalControls() {
  // 1. Currency Toggle
  const currencyBtn = document.getElementById('btn-toggle-currency');
  if (currencyBtn) {
    currencyBtn.addEventListener('click', () => {
      const nextCurrency = window.engine.currency === 'USD' ? 'EUR' : 'USD';
      window.engine.setCurrency(nextCurrency);
      updateCurrencyButtonUi();
      window.uiComponents.refreshAllTextForCurrencyOrMode();
    });
  }

  // 2. Calculation Mode Toggle (5-Year Annualized vs TTM)
  const modeBtn = document.getElementById('btn-toggle-mode');
  const mode5yrTab = document.getElementById('mode-tab-5yr');
  const modeTtmTab = document.getElementById('mode-tab-ttm');

  if (mode5yrTab && modeTtmTab) {
    mode5yrTab.addEventListener('click', () => {
      setModeUI('5yr');
    });

    modeTtmTab.addEventListener('click', () => {
      setModeUI('ttm');
    });
  }

  // 3. Speed Multipliers
  const speedContainer = document.getElementById('speed-multipliers');
  if (speedContainer) {
    speedContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-multiplier]');
      if (btn) {
        const mult = parseFloat(btn.getAttribute('data-multiplier'));
        window.engine.setMultiplier(mult);

        // Update active styling
        const buttons = speedContainer.querySelectorAll('button');
        buttons.forEach(b => {
          b.classList.remove('bg-emerald-500/20', 'border-emerald-500', 'text-emerald-300');
          b.classList.add('bg-zinc-900', 'border-zinc-800', 'text-zinc-400');
        });
        btn.classList.add('bg-emerald-500/20', 'border-emerald-500', 'text-emerald-300');
        btn.classList.remove('bg-zinc-900', 'border-zinc-800', 'text-zinc-400');
      }
    });
  }

  // 4. Pause / Resume Session
  const pauseBtn = document.getElementById('btn-pause-session');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      const isPaused = window.engine.togglePause();
      updatePauseButtonUi(isPaused);
    });
  }

  // 5. Reset Session
  const resetBtn = document.getElementById('btn-reset-session');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      window.engine.resetSession();
      window.raceVisualizer.resetMilestones();
      updatePauseButtonUi(false);
    });
  }

  // 6. Sound Toggle
  const soundBtn = document.getElementById('btn-toggle-sound');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const enabled = window.soundEngine.toggle();
      updateSoundButtonUi(enabled);
    });
  }
}

function setModeUI(mode) {
  window.engine.setMode(mode);
  const mode5yrTab = document.getElementById('mode-tab-5yr');
  const modeTtmTab = document.getElementById('mode-tab-ttm');

  if (mode === '5yr') {
    mode5yrTab.classList.add('bg-zinc-800', 'text-emerald-400', 'shadow');
    mode5yrTab.classList.remove('text-zinc-400');
    modeTtmTab.classList.remove('bg-zinc-800', 'text-emerald-400', 'shadow');
    modeTtmTab.classList.add('text-zinc-400');
  } else {
    modeTtmTab.classList.add('bg-zinc-800', 'text-emerald-400', 'shadow');
    modeTtmTab.classList.remove('text-zinc-400');
    mode5yrTab.classList.remove('bg-zinc-800', 'text-emerald-400', 'shadow');
    mode5yrTab.classList.add('text-zinc-400');
  }

  window.uiComponents.refreshAllTextForCurrencyOrMode();
}

function updateCurrencyButtonUi() {
  const label = document.getElementById('currency-btn-label');
  if (label) {
    label.textContent = window.engine.currency === 'USD' ? 'USD ($)' : 'EUR (â‚¬)';
  }
}

function updatePauseButtonUi(isPaused) {
  const pauseBtn = document.getElementById('btn-pause-session');
  if (pauseBtn) {
    pauseBtn.innerHTML = isPaused
      ? `<i data-lucide="play" class="w-3.5 h-3.5 text-emerald-400"></i><span>Resume</span>`
      : `<i data-lucide="pause" class="w-3.5 h-3.5 text-amber-400"></i><span>Pause</span>`;
    if (window.lucide) window.lucide.createIcons({ root: pauseBtn });
  }
}

function updateSoundButtonUi(enabled) {
  const icon = document.getElementById('sound-icon');
  const label = document.getElementById('sound-label');
  if (icon && label) {
    if (enabled) {
      icon.innerHTML = `<i data-lucide="volume-2" class="w-4 h-4 text-emerald-400"></i>`;
      label.textContent = 'Audio On';
      label.classList.add('text-emerald-400');
      label.classList.remove('text-zinc-400');
    } else {
      icon.innerHTML = `<i data-lucide="volume-x" class="w-4 h-4 text-zinc-400"></i>`;
      label.textContent = 'Audio Off';
      label.classList.remove('text-emerald-400');
      label.classList.add('text-zinc-400');
    }
    if (window.lucide) window.lucide.createIcons({ root: icon });
  }
}

function bindModals() {
  // Methodology Drawer
  const methodBtn = document.getElementById('btn-open-methodology');
  const closeMethodBtn = document.getElementById('btn-close-methodology');
  const methodDrawer = document.getElementById('methodology-drawer');
  const methodBackdrop = document.getElementById('methodology-backdrop');

  const openMethodology = () => {
    if (methodDrawer && methodBackdrop) {
      methodDrawer.classList.remove('translate-x-full');
      methodBackdrop.classList.remove('hidden');
      setTimeout(() => methodBackdrop.classList.add('opacity-100'), 10);
    }
  };

  const closeMethodology = () => {
    if (methodDrawer && methodBackdrop) {
      methodDrawer.classList.add('translate-x-full');
      methodBackdrop.classList.remove('opacity-100');
      setTimeout(() => methodBackdrop.classList.add('hidden'), 300);
    }
  };

  if (methodBtn) methodBtn.addEventListener('click', openMethodology);
  if (closeMethodBtn) closeMethodBtn.addEventListener('click', closeMethodology);
  if (methodBackdrop) methodBackdrop.addEventListener('click', closeMethodology);

  // Snapshot Modal
  const snapshotBtn = document.getElementById('btn-share-snapshot');
  const closeSnapshotBtn = document.getElementById('btn-close-snapshot');
  const snapshotModal = document.getElementById('snapshot-modal');
  const snapshotBackdrop = document.getElementById('snapshot-backdrop');
  const copySnapshotBtn = document.getElementById('btn-copy-snapshot-text');

  const openSnapshot = () => {
    populateSnapshotPreview();
    if (snapshotModal && snapshotBackdrop) {
      snapshotModal.classList.remove('hidden');
      snapshotBackdrop.classList.remove('hidden');
    }
  };

  const closeSnapshot = () => {
    if (snapshotModal && snapshotBackdrop) {
      snapshotModal.classList.add('hidden');
      snapshotBackdrop.classList.add('hidden');
    }
  };

  if (snapshotBtn) snapshotBtn.addEventListener('click', openSnapshot);
  if (closeSnapshotBtn) closeSnapshotBtn.addEventListener('click', closeSnapshot);
  if (snapshotBackdrop) snapshotBackdrop.addEventListener('click', closeSnapshot);

  if (copySnapshotBtn) {
    copySnapshotBtn.addEventListener('click', () => {
      const text = generateSnapshotText();
      navigator.clipboard.writeText(text).then(() => {
        copySnapshotBtn.textContent = 'Copied to Clipboard! âœ“';
        setTimeout(() => {
          copySnapshotBtn.textContent = 'Copy Text Snapshot';
        }, 2000);
      });
    });
  }
}

function populateSnapshotPreview() {
  const elapsed = window.engine.virtualElapsedSeconds;
  const timeStr = window.engine.formatSessionTime(elapsed);
  const combined = window.engine.getCombinedPerSecond() * elapsed;
  const combinedStr = window.engine.formatCurrency(combined);

  const preview = document.getElementById('snapshot-preview-content');
  if (preview) {
    preview.innerHTML = `
      <div class="space-y-3 font-mono text-xs">
        <div class="text-zinc-400">â± Session Duration: <span class="text-white font-bold">${timeStr}</span></div>
        <div class="text-zinc-400">ðŸ’° Combined Billionaires Accumulated: <span class="text-emerald-400 font-bold">${combinedStr}</span></div>
        <div class="border-t border-zinc-800 pt-2 text-zinc-400">
          In this visit alone:
          <ul class="list-disc list-inside mt-1 space-y-1 text-zinc-300">
            <li>Elon Musk earned: <span class="text-white">${window.engine.formatCurrency(window.engine.getBillionairePerSecond(TICKS_DATA.BILLIONAIRES[0]) * elapsed)}</span></li>
            <li>A middle-class worker earned: <span class="text-cyan-400">${window.engine.formatMicroCurrency((window.engine.convertAmount(75000) / TICKS_DATA.SECONDS_IN_YEAR) * elapsed)}</span></li>
          </ul>
        </div>
        <div class="text-zinc-500 text-[11px] pt-1">
          Source: ticks.maksimluzik.com // Live Wealth Velocity Engine
        </div>
      </div>
    `;
  }
}

function generateSnapshotText() {
  const elapsed = window.engine.virtualElapsedSeconds;
  const timeStr = window.engine.formatSessionTime(elapsed);
  const combined = window.engine.getCombinedPerSecond() * elapsed;
  const combinedStr = window.engine.formatCurrency(combined);
  const musk = window.engine.formatCurrency(window.engine.getBillionairePerSecond(TICKS_DATA.BILLIONAIRES[0]) * elapsed);
  const middle = window.engine.formatMicroCurrency((window.engine.convertAmount(75000) / TICKS_DATA.SECONDS_IN_YEAR) * elapsed);

  return `â± In the ${timeStr} I spent on ticks.maksimluzik.com:
â€¢ The top 7 billionaires accumulated ${combinedStr} combined.
â€¢ Elon Musk made ${musk}.
â€¢ A middle-class household earned ${middle}.

Track real-time wealth velocity live: https://ticks.maksimluzik.com`;
}

function bindKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // Avoid shortcuts if user is typing in custom input
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
      return;
    }

    const click = (id) => {
      const el = document.getElementById(id);
      if (el) el.click();
    };

    if (e.code === 'Space') {
      e.preventDefault();
      const isPaused = window.engine.togglePause();
      updatePauseButtonUi(isPaused);
    } else if (e.key === 'Escape') {
      const drawer = document.getElementById('methodology-drawer');
      if (drawer && !drawer.classList.contains('translate-x-full')) click('btn-close-methodology');
      const modal = document.getElementById('snapshot-modal');
      if (modal && !modal.classList.contains('hidden')) click('btn-close-snapshot');
    } else if (e.key === '?') {
      click('btn-open-methodology');
    } else if (e.key === 'c' || e.key === 'C') {
      click('btn-toggle-currency');
    } else if (e.key === 'm' || e.key === 'M') {
      setModeUI(window.engine.mode === '5yr' ? 'ttm' : '5yr');
    } else if (e.key === 's' || e.key === 'S') {
      click('btn-toggle-sound');
    } else if (e.key === 'p' || e.key === 'P') {
      click('btn-share-snapshot');
    } else if (e.key === 'r' || e.key === 'R') {
      click('btn-reset-session');
    } else if (/^[1-5]$/.test(e.key)) {
      const mults = [1, 5, 10, 60, 3600];
      const btn = document.querySelector(`#speed-multipliers [data-multiplier="${mults[Number(e.key) - 1]}"]`);
      if (btn) btn.click();
    }
  });
}
function renderMathFormulas() {
  if (typeof katex !== 'undefined') {
    const formulaContainer = document.getElementById('katex-formula');
    if (formulaContainer) {
      katex.render(
        "\\text{Velocity per Second} = \\frac{\\Delta \\text{Net Worth}}{\\text{Seconds in Year} \\ (31{,}536{,}000)}",
        formulaContainer,
        { displayMode: true, throwOnError: false }
      );
    }

    const parityContainer = document.getElementById('katex-parity-formula');
    if (parityContainer) {
      katex.render(
        "\\text{Class Parity Time (s)} = \\frac{\\text{Annual Class Income}}{\\text{Velocity per Second}}",
        parityContainer,
        { displayMode: true, throwOnError: false }
      );
    }
  }
}

// --- High Performance 60fps Animation Loop ---
function startAnimationLoop() {
  let lastTickSoundSecond = 0;

  function frame(now) {
    const elapsedSecs = window.engine.updateTime(now);

    // Update UI components
    window.uiComponents.updateFrame(elapsedSecs);
    window.raceVisualizer.updateFrame(elapsedSecs);

    // Trigger subtle audio tick every full second elapsed
    const currentFloorSec = Math.floor(elapsedSecs);
    if (currentFloorSec > lastTickSoundSecond) {
      lastTickSoundSecond = currentFloorSec;
      if (window.soundEngine) {
        window.soundEngine.playSubtleTick();
      }
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
