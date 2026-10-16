/**
 * EquiCapital - Financial Calculator Engine
 * Comprehensive Loan, Lease, Working Capital & Affordability Math with Chart.js Integration
 */

class LoanCalculatorEngine {
  constructor() {
    this.currentMode = 'equipment-loan'; // 'equipment-loan' | 'equipment-lease' | 'working-capital' | 'affordability'
    this.currencySymbol = '$';
    this.amortizationChart = null;
    this.breakdownChart = null;
    this.scheduleView = 'yearly'; // 'yearly' | 'monthly'

    this.presets = {
      'heavy-machinery': { rate: 6.25, term: 60, downPct: 15 },
      'commercial-trucks': { rate: 6.99, term: 48, downPct: 15 },
      'medical-dental': { rate: 5.75, term: 72, downPct: 10 },
      'manufacturing-cnc': { rate: 6.45, term: 60, downPct: 15 },
      'kitchen-restaurant': { rate: 7.25, term: 36, downPct: 10 },
      'agriculture': { rate: 5.95, term: 60, downPct: 15 },
      'general-business': { rate: 7.50, term: 36, downPct: 5 }
    };

    this.init();
  }

  init() {
    this.bindInputs();
    this.bindTabs();
    this.bindTaxShield();
    this.bindActions();

    // Check URL parameters for preset mode
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type') || urlParams.get('mode') || urlParams.get('solution');
    if (typeParam === 'lease' || typeParam === 'equipment-lease') {
      this.setMode('equipment-lease');
    } else if (typeParam === 'working-capital' || typeParam === 'capital') {
      this.setMode('working-capital');
    } else if (typeParam === 'affordability') {
      this.setMode('affordability');
    } else {
      this.calculate();
    }

    // Listen to theme change to re-color charts
    window.addEventListener('themeChanged', () => {
      this.renderCharts();
    });
  }

  bindTaxShield() {
    const taxBracketBtns = document.querySelectorAll('.tax-bracket-btn');
    taxBracketBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        taxBracketBtns.forEach(b => {
          b.classList.remove('active', 'bg-emerald-500', 'text-white', 'shadow-sm');
          b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
        });
        btn.classList.add('active', 'bg-emerald-500', 'text-white', 'shadow-sm');
        btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
        if (this.latestData) {
          this.updateTaxShield(this.latestData.rawAmount);
        }
      });
    });
  }

  updateTaxShield(rawAmount) {
    const taxBracketBtns = document.querySelectorAll('.tax-bracket-btn');
    let currentRate = 0.21;
    taxBracketBtns.forEach(btn => {
      if (btn.classList.contains('active')) {
        currentRate = parseFloat(btn.dataset.rate) || 0.21;
      }
    });

    const maxLimit = 1220000; // 2024 IRS Section 179 Cap
    const deduction = Math.min(rawAmount, maxLimit);
    const savings = Math.round(deduction * currentRate);
    const netCost = Math.max(0, rawAmount - savings);

    const elDeduction = document.getElementById('tax-deduction-val');
    const elSavings = document.getElementById('tax-savings-val');
    const elNetCost = document.getElementById('tax-net-cost-val');
    const elNetBar = document.getElementById('tax-net-bar');
    const elSavingsBar = document.getElementById('tax-savings-bar');
    const elNetPct = document.getElementById('tax-net-pct');
    const elSavingsPct = document.getElementById('tax-savings-pct');

    if (elDeduction) elDeduction.textContent = this.currencySymbol + Math.round(deduction).toLocaleString('en-US');
    if (elSavings) elSavings.textContent = this.currencySymbol + Math.round(savings).toLocaleString('en-US');
    if (elNetCost) elNetCost.textContent = this.currencySymbol + Math.round(netCost).toLocaleString('en-US');

    if (rawAmount > 0) {
      const savingsPct = Math.round((savings / rawAmount) * 100);
      const netPct = 100 - savingsPct;
      if (elNetBar) elNetBar.style.width = `${netPct}%`;
      if (elSavingsBar) elSavingsBar.style.width = `${savingsPct}%`;
      if (elNetPct) elNetPct.textContent = `${netPct}%`;
      if (elSavingsPct) elSavingsPct.textContent = `${savingsPct}%`;
    }
  }

  bindTabs() {
    const tabs = document.querySelectorAll('.calc-mode-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        this.setMode(tab.dataset.mode);
      });
    });
  }

  setMode(mode) {
    if (!mode) return;
    this.currentMode = mode;
    const tabs = document.querySelectorAll('.calc-mode-tab');
    tabs.forEach(t => {
      const isMatch = t.dataset.mode === mode;
      if (isMatch) {
        t.classList.add('active', 'border-emerald-500', 'text-emerald-600', 'dark:text-emerald-400');
        t.classList.remove('border-transparent', 'text-slate-500', 'dark:text-slate-400', 'text-slate-700');
        if (t.classList.contains('mobile-mode-card')) {
          t.classList.add('bg-emerald-500/10', 'border-emerald-500', 'border-2');
          t.classList.remove('bg-white', 'dark:bg-slate-900', 'border-slate-200', 'dark:border-slate-800', 'border');
        }
      } else {
        t.classList.remove('active', 'border-emerald-500', 'text-emerald-600', 'dark:text-emerald-400');
        t.classList.add('border-transparent', 'text-slate-500');
        if (t.classList.contains('mobile-mode-card')) {
          t.classList.add('bg-white', 'dark:bg-slate-900', 'border-slate-200', 'dark:border-slate-800', 'text-slate-700', 'dark:text-slate-300', 'border');
          t.classList.remove('bg-emerald-500/10', 'border-emerald-500', 'border-2', 'border-transparent');
        }
      }
    });

    this.updateModeUI();
    this.calculate();
  }

  updateModeUI() {
    const leaseOptions = document.getElementById('calc-lease-options');
    const loanAmountGroup = document.getElementById('calc-loan-amount-group');
    const affordabilityGroup = document.getElementById('calc-affordability-group');

    if (leaseOptions) {
      const isLease = this.currentMode === 'equipment-lease';
      leaseOptions.style.display = isLease ? 'block' : 'none';
      const freqCol = document.getElementById('payment-frequency-col');
      if (freqCol) {
        if (isLease) {
          freqCol.className = 'col-span-1';
        } else {
          freqCol.className = 'col-span-1 sm:col-span-2';
        }
      }
    }

    if (affordabilityGroup && loanAmountGroup) {
      if (this.currentMode === 'affordability') {
        affordabilityGroup.style.display = 'block';
        loanAmountGroup.style.display = 'none';
      } else {
        affordabilityGroup.style.display = 'none';
        loanAmountGroup.style.display = 'block';
      }
    }
  }

  bindInputs() {
    // Sync slider & number inputs
    const pairs = [
      { range: 'amount-range', number: 'amount-number' },
      { range: 'down-range', number: 'down-number' },
      { range: 'rate-range', number: 'rate-number' },
      { range: 'term-range', number: 'term-number' },
      { range: 'target-payment-range', number: 'target-payment-number' }
    ];

    pairs.forEach(pair => {
      const rangeEl = document.getElementById(pair.range);
      const numEl = document.getElementById(pair.number);

      if (rangeEl && numEl) {
        rangeEl.addEventListener('input', () => {
          numEl.value = rangeEl.value;
          this.calculate();
        });

        numEl.addEventListener('input', () => {
          rangeEl.value = numEl.value;
          this.calculate();
        });
      }
    });

    // Preset selector
    const presetSelect = document.getElementById('equipment-preset');
    if (presetSelect) {
      presetSelect.addEventListener('change', () => {
        const val = presetSelect.value;
        if (this.presets[val]) {
          const p = this.presets[val];
          const rateRange = document.getElementById('rate-range');
          const rateNum = document.getElementById('rate-number');
          const termRange = document.getElementById('term-range');
          const termNum = document.getElementById('term-number');

          if (rateRange && rateNum) {
            rateRange.value = p.rate;
            rateNum.value = p.rate;
          }
          if (termRange && termNum) {
            termRange.value = p.term;
            termNum.value = p.term;
          }
          this.calculate();
        }
      });
    }

    // Payment frequency
    const freqSelect = document.getElementById('payment-frequency');
    if (freqSelect) {
      freqSelect.addEventListener('change', () => this.calculate());
    }

    // Down payment mode ($ or %)
    const downToggleBtns = document.querySelectorAll('.down-payment-toggle');
    downToggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        downToggleBtns.forEach(b => b.classList.remove('bg-emerald-500', 'text-white'));
        btn.classList.add('bg-emerald-500', 'text-white');
        this.downPaymentMode = btn.dataset.mode; // 'pct' or 'dollar'
        this.calculate();
      });
    });

    // Lease buyout type
    const leaseTypeSelect = document.getElementById('lease-buyout-type');
    if (leaseTypeSelect) {
      leaseTypeSelect.addEventListener('change', () => this.calculate());
    }

    // Schedule view toggle (yearly / monthly)
    const scheduleToggleBtns = document.querySelectorAll('.schedule-toggle-btn');
    scheduleToggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        scheduleToggleBtns.forEach(b => b.classList.remove('bg-emerald-500', 'text-white'));
        btn.classList.add('bg-emerald-500', 'text-white');
        this.scheduleView = btn.dataset.view;
        this.renderScheduleTable();
      });
    });
  }

  bindActions() {
    // Apply With These Terms
    const applyBtn = document.getElementById('calc-apply-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const terms = this.getCalculationData();
        // Save to draft application in LocalStorage
        if (window.storage) {
          window.storage.saveDraftApplication({
            financingType: this.currentMode === 'equipment-lease' ? 'Equipment Leasing' : 'Equipment Financing',
            amount: terms.financedAmount,
            downPayment: terms.downPayment,
            termMonths: terms.termMonths,
            equipmentCategory: document.getElementById('equipment-preset')?.value || 'Commercial Equipment'
          });
        }
        window.App?.showToast('Terms Applied!', 'Your calculated parameters were saved to the application wizard.', 'success');

        // Redirect directly to dashboard application
        setTimeout(() => {
          window.location.href = 'dashboard.html#new-application';
        }, 800);
      });
    }

    // Save Scenario
    const saveBtn = document.getElementById('calc-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const data = this.getCalculationData();
        const titlePrompt = prompt('Enter a title for this financing scenario:', `${data.modeName} - $${data.financedAmount.toLocaleString('en-US')}`);
        if (titlePrompt) {
          if (window.storage) {
            window.storage.saveCalculation({
              title: titlePrompt,
              type: data.modeName,
              loanAmount: data.financedAmount,
              downPayment: data.downPayment,
              apr: data.annualRate,
              termMonths: data.termMonths,
              paymentFrequency: data.frequency,
              monthlyPayment: data.periodicPayment,
              totalInterest: data.totalInterest,
              totalCost: data.totalCost
            });
            window.App?.showToast('Scenario Saved!', `"${titlePrompt}" is saved to your saved calculations.`, 'success');
          }
        }
      });
    }

    // Compare Scenarios Modal
    const compareBtn = document.getElementById('calc-compare-btn');
    if (compareBtn) {
      compareBtn.addEventListener('click', () => {
        this.openCompareModal();
      });
    }

    // Download/Print Summary
    const printBtn = document.getElementById('calc-download-btn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Reset Form
    const resetBtn = document.getElementById('calc-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetDefaults();
      });
    }

    // Amortization Schedule Table Horizontal Scroll Controls
    const tableContainer = document.getElementById('amortization-table-container');
    const scrollLeftButtons = [
      document.getElementById('table-scroll-left-btn'),
      document.getElementById('table-scroll-left-top')
    ];
    const scrollRightButtons = [
      document.getElementById('table-scroll-right-btn'),
      document.getElementById('table-scroll-right-top')
    ];

    const updateTableScrollState = () => {
      if (!tableContainer) return;
      const canScrollLeft = tableContainer.scrollLeft > 8;
      const canScrollRight = tableContainer.scrollLeft < (tableContainer.scrollWidth - tableContainer.clientWidth - 8);

      scrollLeftButtons.forEach(btn => {
        if (btn) btn.disabled = !canScrollLeft;
      });
      scrollRightButtons.forEach(btn => {
        if (btn) btn.disabled = !canScrollRight;
      });
    };

    if (tableContainer) {
      scrollLeftButtons.forEach(btn => {
        if (btn) {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            tableContainer.scrollBy({ left: -240, behavior: 'smooth' });
          });
        }
      });

      scrollRightButtons.forEach(btn => {
        if (btn) {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            tableContainer.scrollBy({ left: 240, behavior: 'smooth' });
          });
        }
      });

      tableContainer.addEventListener('scroll', updateTableScrollState, { passive: true });
      window.addEventListener('resize', updateTableScrollState, { passive: true });
      this.updateTableScrollState = updateTableScrollState;
      setTimeout(updateTableScrollState, 400);
    }
  }

  resetDefaults() {
    const defaultVals = {
      'amount-range': 250000,
      'amount-number': 250000,
      'down-range': 25000,
      'down-number': 25000,
      'rate-range': 6.5,
      'rate-number': 6.5,
      'term-range': 60,
      'term-number': 60,
      'target-payment-range': 4500,
      'target-payment-number': 4500
    };

    Object.entries(defaultVals).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    });

    this.calculate();
    window.App?.showToast('Calculator Reset', 'Inputs have been reset to default values.', 'info');
  }

  getCalculationData() {
    let rawAmount = parseFloat(document.getElementById('amount-number')?.value) || 250000;
    const downAmount = parseFloat(document.getElementById('down-number')?.value) || 0;
    const annualRate = parseFloat(document.getElementById('rate-number')?.value) || 6.5;
    const termMonths = parseInt(document.getElementById('term-number')?.value, 10) || 60;
    const frequency = document.getElementById('payment-frequency')?.value || 'Monthly';
    const targetPayment = parseFloat(document.getElementById('target-payment-number')?.value) || 4500;

    // Handle Affordability Mode
    if (this.currentMode === 'affordability') {
      // Backwards calculation from target payment
      const r = (annualRate / 100) / 12;
      const n = termMonths;
      let calculatedPrincipal = 0;
      if (r > 0) {
        calculatedPrincipal = targetPayment * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
      } else {
        calculatedPrincipal = targetPayment * n;
      }
      rawAmount = Math.round(calculatedPrincipal);
    }

    // Financed Amount
    const financedAmount = Math.max(0, rawAmount - downAmount);

    // Frequency factor
    let periodsPerYear = 12;
    if (frequency === 'Bi-Weekly') periodsPerYear = 26;
    if (frequency === 'Weekly') periodsPerYear = 52;

    const totalPeriods = Math.round((termMonths / 12) * periodsPerYear);
    const periodicRate = (annualRate / 100) / periodsPerYear;

    // Lease buyout logic
    let residualValue = 0;
    if (this.currentMode === 'equipment-lease') {
      const leaseType = document.getElementById('lease-buyout-type')?.value || 'fmv';
      if (leaseType === 'dollar') residualValue = 1;
      else if (leaseType === 'put10') residualValue = financedAmount * 0.10;
      else if (leaseType === 'fmv') residualValue = financedAmount * 0.20; // 20% estimated FMV residual
    }

    // Standard Amortization Formula: P * [ r(1+r)^n ] / [ (1+r)^n - 1 ]
    let periodicPayment = 0;
    if (periodicRate === 0) {
      periodicPayment = (financedAmount - residualValue) / totalPeriods;
    } else {
      // Lease with residual value PV formula
      const pvAnnuityFactor = (1 - Math.pow(1 + periodicRate, -totalPeriods)) / periodicRate;
      const pvResidual = residualValue * Math.pow(1 + periodicRate, -totalPeriods);
      periodicPayment = (financedAmount - pvResidual) / pvAnnuityFactor;
    }

    // Origination fee estimated at 1%
    const originationFee = Math.round(financedAmount * 0.01);
    const totalPayments = periodicPayment * totalPeriods;
    const totalInterest = Math.max(0, totalPayments + residualValue - financedAmount);
    const totalCost = financedAmount + totalInterest + originationFee;
    const ltcPercentage = rawAmount > 0 ? ((financedAmount / rawAmount) * 100).toFixed(1) : '100';

    return {
      rawAmount,
      downPayment: downAmount,
      financedAmount,
      annualRate,
      termMonths,
      frequency,
      periodsPerYear,
      totalPeriods,
      periodicRate,
      periodicPayment: Math.round(periodicPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      originationFee,
      residualValue,
      ltcPercentage,
      modeName: this.getModeDisplayName()
    };
  }

  getModeDisplayName() {
    switch (this.currentMode) {
      case 'equipment-lease': return 'Equipment Lease';
      case 'working-capital': return 'Working Capital Loan';
      case 'affordability': return 'Affordability Capacity';
      default: return 'Equipment Loan';
    }
  }

  calculate() {
    const data = this.getCalculationData();
    this.latestData = data;

    // Update Output Displays
    const elPayment = document.getElementById('calc-output-payment');
    const elInterest = document.getElementById('calc-output-interest');
    const elTotalCost = document.getElementById('calc-output-total-cost');
    const elLTC = document.getElementById('calc-output-ltc');
    const elFinanced = document.getElementById('calc-output-financed');
    const elFreqLabel = document.getElementById('calc-output-freq-label');

    if (elPayment) elPayment.textContent = this.currencySymbol + data.periodicPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (elInterest) elInterest.textContent = this.currencySymbol + Math.round(data.totalInterest).toLocaleString('en-US');
    if (elTotalCost) elTotalCost.textContent = this.currencySymbol + Math.round(data.totalCost).toLocaleString('en-US');
    if (elLTC) elLTC.textContent = data.ltcPercentage + '%';
    if (elFinanced) elFinanced.textContent = this.currencySymbol + Math.round(data.financedAmount).toLocaleString('en-US');
    if (elFreqLabel) elFreqLabel.textContent = `per ${data.frequency.toLowerCase().replace('-weekly', ' 2-weeks')}`;

    // Render Charts
    this.renderCharts();

    // Render Amortization Schedule
    this.renderScheduleTable();

    // Update Section 179 Tax Shield
    this.updateTaxShield(data.rawAmount);
  }

  renderCharts() {
    const data = this.latestData;
    if (!data) return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#94A3B8' : '#64748B';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

    // 1. Amortization Line Chart
    const amortCtx = document.getElementById('amortization-chart')?.getContext('2d');
    if (amortCtx && typeof Chart !== 'undefined') {
      const schedule = this.generateAmortizationSchedule(data);
      const labels = schedule.yearly.map(y => `Yr ${y.year}`);
      const balances = schedule.yearly.map(y => y.remainingBalance);
      const cumulativeInterests = schedule.yearly.map(y => y.cumulativeInterest);

      if (this.amortizationChart) {
        this.amortizationChart.destroy();
      }

      this.amortizationChart = new Chart(amortCtx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Remaining Principal Balance',
              data: balances,
              borderColor: '#2AAECE',
              backgroundColor: 'rgba(42, 174, 206, 0.12)',
              fill: true,
              tension: 0.3,
              pointRadius: 4,
              pointBackgroundColor: '#2AAECE'
            },
            {
              label: 'Cumulative Interest Paid',
              data: cumulativeInterests,
              borderColor: '#F59E0B',
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              fill: true,
              tension: 0.3,
              pointRadius: 4,
              pointBackgroundColor: '#F59E0B'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 12 } }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${this.currencySymbol}${Math.round(ctx.parsed.y).toLocaleString('en-US')}`
              }
            }
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: textColor }
            },
            y: {
              grid: { color: gridColor },
              ticks: {
                color: textColor,
                callback: (val) => this.currencySymbol + (val >= 1000 ? (val / 1000) + 'k' : val)
              }
            }
          }
        }
      });
    }

    // 2. Breakdown Doughnut Chart
    const doughnutCtx = document.getElementById('breakdown-chart')?.getContext('2d');
    if (doughnutCtx && typeof Chart !== 'undefined') {
      if (this.breakdownChart) {
        this.breakdownChart.destroy();
      }

      this.breakdownChart = new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
          labels: ['Principal Financed', 'Total Interest', 'Est. Origination Fee'],
          datasets: [
            {
              data: [data.financedAmount, data.totalInterest, data.originationFee],
              backgroundColor: ['#2AAECE', '#F59E0B', '#3B82F6'],
              borderWidth: 2,
              borderColor: isDark ? '#0F172A' : '#FFFFFF'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 12 } }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.label}: ${this.currencySymbol}${Math.round(ctx.parsed).toLocaleString('en-US')}`
              }
            }
          }
        }
      });
    }
  }

  generateAmortizationSchedule(data) {
    let balance = data.financedAmount;
    let cumulativeInterest = 0;
    let cumulativePrincipal = 0;
    const monthlySchedule = [];
    const yearlyMap = {};

    for (let p = 1; p <= data.totalPeriods; p++) {
      const interestPmt = balance * data.periodicRate;
      let principalPmt = data.periodicPayment - interestPmt;

      // Final period adjustment
      if (p === data.totalPeriods) {
        principalPmt = balance;
        balance = 0;
      } else {
        balance = Math.max(0, balance - principalPmt);
      }

      cumulativeInterest += interestPmt;
      cumulativePrincipal += principalPmt;

      const yearIndex = Math.ceil(p / data.periodsPerYear);

      monthlySchedule.push({
        period: p,
        year: yearIndex,
        payment: data.periodicPayment,
        principal: principalPmt,
        interest: interestPmt,
        cumulativeInterest: cumulativeInterest,
        remainingBalance: balance
      });

      if (!yearlyMap[yearIndex]) {
        yearlyMap[yearIndex] = {
          year: yearIndex,
          totalPayment: 0,
          totalPrincipal: 0,
          totalInterest: 0,
          remainingBalance: balance,
          cumulativeInterest: 0
        };
      }

      yearlyMap[yearIndex].totalPayment += data.periodicPayment;
      yearlyMap[yearIndex].totalPrincipal += principalPmt;
      yearlyMap[yearIndex].totalInterest += interestPmt;
      yearlyMap[yearIndex].remainingBalance = balance;
      yearlyMap[yearIndex].cumulativeInterest = cumulativeInterest;
    }

    return {
      monthly: monthlySchedule,
      yearly: Object.values(yearlyMap)
    };
  }

  renderScheduleTable() {
    const tableBody = document.getElementById('amortization-schedule-body');
    if (!tableBody || !this.latestData) return;

    const schedule = this.generateAmortizationSchedule(this.latestData);
    let rowsHTML = '';

    if (this.scheduleView === 'yearly') {
      schedule.yearly.forEach(item => {
        rowsHTML += `
          <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
            <td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">Year ${item.year}</td>
            <td class="py-3 px-4 text-right font-tabular text-slate-700 dark:text-slate-300">${this.currencySymbol}${Math.round(item.totalPayment).toLocaleString('en-US')}</td>
            <td class="py-3 px-4 text-right font-tabular text-emerald-600 dark:text-emerald-400 font-medium">${this.currencySymbol}${Math.round(item.totalPrincipal).toLocaleString('en-US')}</td>
            <td class="py-3 px-4 text-right font-tabular text-amber-600 dark:text-amber-400">${this.currencySymbol}${Math.round(item.totalInterest).toLocaleString('en-US')}</td>
            <td class="py-3 px-4 text-right font-tabular text-slate-500">${this.currencySymbol}${Math.round(item.cumulativeInterest).toLocaleString('en-US')}</td>
            <td class="py-3 px-4 text-right font-tabular font-semibold text-slate-900 dark:text-slate-100">${this.currencySymbol}${Math.round(item.remainingBalance).toLocaleString('en-US')}</td>
          </tr>
        `;
      });
    } else {
      // Monthly (show first 36 months if long, with note)
      schedule.monthly.forEach(item => {
        rowsHTML += `
          <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors text-sm">
            <td class="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200">Period ${item.period}</td>
            <td class="py-2.5 px-4 text-right font-tabular text-slate-700 dark:text-slate-300">${this.currencySymbol}${item.payment.toFixed(2)}</td>
            <td class="py-2.5 px-4 text-right font-tabular text-emerald-600 dark:text-emerald-400">${this.currencySymbol}${item.principal.toFixed(2)}</td>
            <td class="py-2.5 px-4 text-right font-tabular text-amber-600 dark:text-amber-400">${this.currencySymbol}${item.interest.toFixed(2)}</td>
            <td class="py-2.5 px-4 text-right font-tabular text-slate-500">${this.currencySymbol}${Math.round(item.cumulativeInterest).toLocaleString('en-US')}</td>
            <td class="py-2.5 px-4 text-right font-tabular font-semibold text-slate-900 dark:text-slate-100">${this.currencySymbol}${Math.round(item.remainingBalance).toLocaleString('en-US')}</td>
          </tr>
        `;
      });
    }

    tableBody.innerHTML = rowsHTML;
    if (typeof this.updateTableScrollState === 'function') {
      setTimeout(() => this.updateTableScrollState(), 50);
    }
  }

  openCompareModal() {
    const list = window.storage ? window.storage.getCalculations() : [];
    const container = document.getElementById('compare-scenarios-content');

    if (!list.length) {
      window.App?.showToast('No Saved Scenarios', 'Save at least one calculation scenario using "Save Scenario" first.', 'warning');
      return;
    }

    if (container) {
      const items = list.slice(0, 3); // Compare up to 3
      let html = `<div class="grid grid-cols-1 md:grid-cols-${items.length} gap-4">`;

      items.forEach(sc => {
        html += `
          <div class="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-slate-50 dark:bg-slate-900/60">
            <div class="text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">${sc.type}</div>
            <h4 class="font-bold text-base text-slate-900 dark:text-white mb-3">${sc.title}</h4>
            <div class="space-y-2.5 text-sm border-t border-slate-200 dark:border-slate-800 pt-3">
              <div class="flex justify-between"><span class="text-slate-500">Loan Amount:</span> <span class="font-semibold">${this.currencySymbol}${sc.loanAmount.toLocaleString('en-US')}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">APR Rate:</span> <span class="font-semibold">${sc.apr}%</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Term:</span> <span class="font-semibold">${sc.termMonths} Months</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Payment:</span> <span class="font-bold text-emerald-600 dark:text-emerald-400">${this.currencySymbol}${sc.monthlyPayment.toLocaleString('en-US')}/mo</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Total Interest:</span> <span class="font-semibold">${this.currencySymbol}${sc.totalInterest.toLocaleString('en-US')}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Total Cost:</span> <span class="font-semibold">${this.currencySymbol}${sc.totalCost.toLocaleString('en-US')}</span></div>
            </div>
          </div>
        `;
      });
      html += `</div>`;
      container.innerHTML = html;
      window.App?.openModal('modal-compare-scenarios');
    }
  }
}

// Instantiate on Calculator Page
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('loan-calculator-app')) {
    window.loanCalculator = new LoanCalculatorEngine();
  }
});
