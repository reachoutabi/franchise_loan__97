/**
 * EquiCapital - Business Client Dashboard Engine
 * Multi-View Routing, Wizard, Approval Tracker Drawer, Document Upload, Offers & Messaging
 */

class DashboardController {
  constructor() {
    this.currentView = 'overview';
    this.wizardStep = 1;
    this.pipelineChart = null;
    this.activeApplicationDrawerId = null;

    this.init();
  }

  init() {
    this.checkSession();
    this.initSidebarNavigation();
    this.initTopbar();
    this.initWizard();
    this.initDocumentUploader();
    this.initMessaging();
    this.initOffers();
    this.initApplicationsTable();
    this.initProfileSettings();

    // Check hash for direct view routing
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      this.switchView(hash);
    } else {
      this.renderOverview();
    }

    // Theme changes update charts
    window.addEventListener('themeChanged', () => {
      this.renderPipelineChart();
    });
  }

  checkSession() {
    const user = window.storage?.getCurrentUser() || {
      id: 'usr-98102',
      name: 'Alexander Vance',
      email: 'user@equicapital.com',
      businessName: 'Vance Heavy Hauling & Excavation LLC'
    };

    // Populate client profile headers
    const nameEls = document.querySelectorAll('.user-display-name');
    nameEls.forEach(el => el.textContent = user.name || 'Alexander Vance');

    const businessEls = document.querySelectorAll('.user-display-business');
    businessEls.forEach(el => el.textContent = user.businessName || 'EquiCapital Client');

    const emailEls = document.querySelectorAll('.user-display-email');
    emailEls.forEach(el => el.textContent = user.email || 'user@equicapital.com');
  }

  initSidebarNavigation() {
    const navItems = document.querySelectorAll('.dashboard-nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = item.dataset.view;
        if (targetView === 'logout') {
          this.handleLogout();
          return;
        }
        this.switchView(targetView);

        // On mobile, close sidebar drawer
        const sidebar = document.getElementById('dashboard-sidebar');
        const backdrop = document.getElementById('dashboard-sidebar-backdrop');
        if (sidebar && window.innerWidth < 1024) {
          sidebar.classList.add('-translate-x-full');
          backdrop?.classList.add('hidden');
        }
      });
    });

    // Mobile sidebar toggle
    const toggleBtn = document.getElementById('dashboard-menu-toggle');
    const sidebar = document.getElementById('dashboard-sidebar');
    const backdrop = document.getElementById('dashboard-sidebar-backdrop');

    toggleBtn?.addEventListener('click', () => {
      sidebar?.classList.toggle('-translate-x-full');
      backdrop?.classList.toggle('hidden');
    });

    backdrop?.addEventListener('click', () => {
      sidebar?.classList.add('-translate-x-full');
      backdrop?.classList.add('hidden');
    });
  }

  switchView(viewName) {
    this.currentView = viewName;
    window.location.hash = viewName;

    // Update active nav styling
    const navItems = document.querySelectorAll('.dashboard-nav-item');
    navItems.forEach(item => {
      if (item.dataset.view === viewName) {
        item.classList.add('bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400', 'font-semibold');
        item.classList.remove('text-slate-600', 'dark:text-slate-400');
      } else {
        item.classList.remove('bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400', 'font-semibold');
        item.classList.add('text-slate-600', 'dark:text-slate-400');
      }
    });

    // Toggle view containers
    const views = document.querySelectorAll('.dashboard-view');
    views.forEach(v => {
      v.classList.add('hidden');
      if (v.id === `view-${viewName}`) {
        v.classList.remove('hidden');
      }
    });

    // Trigger render logic per view
    switch (viewName) {
      case 'overview':
        this.renderOverview();
        break;
      case 'applications':
        this.renderApplicationsList();
        break;
      case 'documents':
        this.renderDocumentsCenter();
        break;
      case 'offers':
        this.renderOffersView();
        break;
      case 'messages':
        this.renderMessagesView();
        break;
      case 'saved-calculations':
        this.renderSavedCalculations();
        break;
      case 'settings':
        this.populateSettings();
        break;
      case 'new-application':
        this.resetWizardIfDraft();
        break;
    }
  }

  initTopbar() {
    // Notification dropdown toggle
    const notifBtn = document.getElementById('notif-bell-btn');
    const notifPanel = document.getElementById('notif-dropdown-panel');
    notifBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      notifPanel?.classList.toggle('hidden');
      this.renderNotifications();
    });

    // Mark all read button
    const markReadBtn = document.getElementById('notif-mark-read-btn');
    markReadBtn?.addEventListener('click', () => {
      window.storage?.markAllNotificationsRead();
      this.renderNotifications();
      window.App?.showToast('Notifications Marked Read', 'All alerts have been cleared.', 'info');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!notifPanel?.contains(e.target) && e.target !== notifBtn) {
        notifPanel?.classList.add('hidden');
      }
    });

    // Topbar search input
    const searchInput = document.getElementById('dashboard-topbar-search');
    searchInput?.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (query.length > 1) {
        // Switch to applications view and filter
        if (this.currentView !== 'applications') {
          this.switchView('applications');
        }
        const appSearch = document.getElementById('app-search-input');
        if (appSearch) {
          appSearch.value = query;
          this.renderApplicationsList(query);
        }
      }
    });

    // Simulator button in topbar for reviewers
    const simBtn = document.getElementById('demo-simulate-status-btn');
    simBtn?.addEventListener('click', () => {
      const apps = window.storage?.getApplications() || [];
      if (apps.length) {
        const target = apps[0];
        const updated = window.storage.advanceApplicationStatus(target.id);
        window.App?.showToast(
          'Simulation: Status Advanced!',
          `Application ${updated.id} advanced to "${updated.status}" (Stage ${updated.stageNumber}/5).`,
          'success'
        );
        this.renderOverview();
        if (this.currentView === 'applications') this.renderApplicationsList();
        if (this.activeApplicationDrawerId === target.id) this.openApplicationDrawer(target.id);
      }
    });
  }

  renderNotifications() {
    const list = window.storage ? window.storage.getNotifications() : [];
    const container = document.getElementById('notif-items-container');
    const badge = document.getElementById('notif-unread-badge');

    const unreadCount = list.filter(n => !n.read).length;
    if (badge) {
      badge.textContent = unreadCount;
      badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    if (!container) return;

    if (!list.length) {
      container.innerHTML = '<div class="p-4 text-center text-xs text-slate-400">No new notifications</div>';
      return;
    }

    container.innerHTML = list.map(item => `
      <div class="p-3.5 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${!item.read ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''}">
        <div class="flex items-start justify-between gap-2">
          <h5 class="text-xs font-bold text-slate-900 dark:text-white">${item.title}</h5>
          <span class="text-[10px] text-slate-400 whitespace-nowrap">${item.timestamp}</span>
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">${item.message}</p>
      </div>
    `).join('');
  }

  renderOverview() {
    const apps = window.storage?.getApplications() || [];
    const docs = window.storage?.getDocuments() || [];
    const user = window.storage?.getCurrentUser();

    // 1. Stats Counter Cards
    const totalApps = apps.length;
    const totalRequested = apps.reduce((acc, a) => acc + (a.amount || 0), 0);
    const approvedApps = apps.filter(a => a.status === 'Approved' || a.status === 'Offer Issued' || a.status === 'Funded');
    const approvedTotal = approvedApps.reduce((acc, a) => acc + (a.amount || 0), 0);
    const pendingDocs = docs.filter(d => d.status === 'Not Uploaded' || d.status === 'Rejected').length;

    const elTotalApps = document.getElementById('stat-total-apps');
    const elTotalRequested = document.getElementById('stat-total-requested');
    const elApprovedTotal = document.getElementById('stat-approved-total');
    const elPendingDocs = document.getElementById('stat-pending-docs');

    if (elTotalApps) elTotalApps.textContent = totalApps;
    if (elTotalRequested) elTotalRequested.textContent = '$' + (totalRequested / 1000).toFixed(0) + 'k';
    if (elApprovedTotal) elApprovedTotal.textContent = '$' + (approvedTotal / 1000).toFixed(0) + 'k';
    if (elPendingDocs) elPendingDocs.textContent = pendingDocs;

    // 2. Active Application Visual Stepper (Most recent active app)
    const activeApp = apps[0] || null;
    this.renderActiveAppTracker(activeApp);

    // 3. Status Pipeline Chart
    this.renderPipelineChart();

    // 4. Broker Info Card
    if (user?.assignedBroker) {
      const b = user.assignedBroker;
      const bName = document.getElementById('overview-broker-name');
      const bTitle = document.getElementById('overview-broker-title');
      const bPhone = document.getElementById('overview-broker-phone');
      const bEmail = document.getElementById('overview-broker-email');
      const bAvatar = document.getElementById('overview-broker-avatar');

      if (bName) bName.textContent = b.name;
      if (bTitle) bTitle.textContent = b.title;
      if (bPhone) {
        bPhone.textContent = b.phone;
        if (bPhone.tagName === 'A') {
          bPhone.href = `tel:${b.phone.replace(/[^0-9+]/g, '')}`;
        }
      }
      if (bEmail) {
        bEmail.textContent = b.email;
        if (bEmail.tagName === 'A') {
          bEmail.href = `mailto:${b.email}`;
          bEmail.title = b.email;
        }
      }
      if (bAvatar) bAvatar.src = b.avatar;
    }
  }

  renderActiveAppTracker(app) {
    const container = document.getElementById('overview-active-tracker-container');
    if (!container || !app) return;

    const stages = [
      { num: 1, name: 'Submitted' },
      { num: 2, name: 'Under Review' },
      { num: 3, name: 'Underwriting' },
      { num: 4, name: 'Approved / Offers' },
      { num: 5, name: 'Funded' }
    ];

    let stepperHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 pb-5 border-b border-slate-100 dark:border-slate-800 min-w-0">
        <div class="min-w-0 flex-1">
          <span class="text-[10px] sm:text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">Primary Application Tracking</span>
          <h3 class="text-base sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5 truncate" title="${app.id} &mdash; ${app.equipmentDescription}">${app.id} &mdash; ${app.equipmentDescription}</h3>
          <p class="text-xs sm:text-sm text-slate-500 mt-1 truncate">Requested: <strong class="text-slate-800 dark:text-slate-200 font-tabular">$${app.amount.toLocaleString('en-US')}</strong> &bull; Submitted: ${app.submittedDate}</p>
        </div>
        <div class="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          <span class="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shrink-0 inline-flex items-center justify-center ${this.getStatusBadgeClass(app.status)}">${app.status}</span>
          <button class="btn-secondary text-xs py-1.5 sm:py-2 px-3 sm:px-3.5 whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 shadow-sm" onclick="dashboard.openApplicationDrawer('${app.id}')">
            <i class="bi bi-box-arrow-up-right text-[11px]"></i> <span>View File &amp; Tracker</span>
          </button>
        </div>
      </div>

      <!-- 5-Stage Stepper: Smooth Horizontal Scroll on Mobile, 5 Columns on Desktop -->
      <div class="flex sm:grid sm:grid-cols-5 gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-2 pt-1 -mx-1 px-1">
    `;

    stages.forEach(st => {
      const isPast = st.num < app.stageNumber;
      const isCurrent = st.num === app.stageNumber;

      stepperHTML += `
        <div class="min-w-[125px] sm:min-w-0 flex-1 shrink-0 flex flex-col items-center text-center p-3 rounded-xl border ${isCurrent ? 'border-emerald-500 bg-emerald-500/10' : (isPast ? 'border-emerald-200 dark:border-emerald-950/60 bg-slate-50 dark:bg-slate-900/40' : 'border-slate-200 dark:border-slate-800 opacity-60')}">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-all ${isCurrent ? 'bg-emerald-500 text-white shadow-glow stepper-stage-current ring-4 ring-emerald-500/25' : (isPast ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300')}">
            ${isPast ? '<i class="bi bi-check-lg"></i>' : st.num}
          </div>
          <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate w-full">${st.name}</span>
          <span class="text-[10px] text-slate-400 mt-0.5 truncate w-full">${isCurrent ? 'Current Phase' : (isPast ? 'Completed' : 'Pending')}</span>
        </div>
      `;
    });

    stepperHTML += `</div>`;

    if (app.brokerNotes) {
      stepperHTML += `
        <div class="mt-5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <i class="bi bi-info-circle-fill text-emerald-500 text-base mt-0.5"></i>
          <div>
            <h5 class="text-xs font-bold text-slate-800 dark:text-slate-200">Advisor Underwriting Log</h5>
            <p class="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">${app.brokerNotes}</p>
          </div>
        </div>
      `;
    }

    container.innerHTML = stepperHTML;
  }

  renderPipelineChart() {
    const ctx = document.getElementById('pipeline-chart')?.getContext('2d');
    if (!ctx || typeof Chart === 'undefined') return;

    const apps = window.storage?.getApplications() || [];
    const counts = {
      'Submitted': 0,
      'Under Review': 0,
      'Underwriting': 0,
      'Offer Issued': 0,
      'Funded': 0
    };

    apps.forEach(a => {
      if (counts[a.status] !== undefined) counts[a.status]++;
      else if (a.status === 'Approved') counts['Offer Issued']++;
    });

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#94A3B8' : '#64748B';

    if (this.pipelineChart) this.pipelineChart.destroy();

    this.pipelineChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Submitted', 'Under Review', 'Underwriting', 'Offers Ready', 'Funded'],
        datasets: [{
          label: 'Application Count',
          data: [counts['Submitted'], counts['Under Review'], counts['Underwriting'], counts['Offer Issued'], counts['Funded']],
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(147, 51, 234, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(42, 174, 206, 0.85)',
            'rgba(30, 148, 177, 0.95)'
          ],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: { size: 11 } }
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, color: textColor },
            grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }
          }
        }
      }
    });
  }

  // =========================================================================
  // 6-Step Loan Application Wizard
  // =========================================================================
  initWizard() {
    this.wizardData = {};
    const nextBtn = document.getElementById('wizard-next-btn');
    const backBtn = document.getElementById('wizard-back-btn');
    const saveDraftBtn = document.getElementById('wizard-save-draft-btn');

    nextBtn?.addEventListener('click', () => this.handleWizardNext());
    backBtn?.addEventListener('click', () => this.handleWizardBack());
    saveDraftBtn?.addEventListener('click', () => {
      this.collectWizardStepData(this.wizardStep);
      window.storage?.saveDraftApplication(this.wizardData);
      window.App?.showToast('Draft Saved', 'Your application progress has been preserved in LocalStorage.', 'info');
    });

    // Populate draft if exists
    this.resetWizardIfDraft();
    this.setWizardStep(1, 'none');
  }

  resetWizardIfDraft() {
    const draft = window.storage?.getDraftApplication();
    if (draft) {
      this.wizardData = draft;
      if (draft.financingType) {
        const typeRadio = document.querySelector(`input[name="wizard-financing-type"][value="${draft.financingType}"]`);
        if (typeRadio) typeRadio.checked = true;
      }
      if (draft.amount) {
        const amtInput = document.getElementById('wizard-amount');
        if (amtInput) amtInput.value = draft.amount;
      }
    }
  }

  setWizardStep(step, direction = null) {
    const prevStep = this.wizardStep || 1;
    if (!direction) {
      direction = step > prevStep ? 'forward' : (step < prevStep ? 'backward' : 'none');
    }
    this.wizardStep = step;
    if (!this.maxReachedStep || step > this.maxReachedStep) {
      this.maxReachedStep = step;
    }

    // Update Progress Pill
    const percent = Math.round((step / 6) * 100);
    const pill = document.getElementById('wizard-progress-pill');
    if (pill) {
      pill.innerHTML = `Step ${step} of 6 &bull; ${percent}% Complete`;
    }

    // Update step indicator nodes, labels, and connector lines
    for (let i = 1; i <= 6; i++) {
      const stepEl = document.getElementById(`wizard-step-node-${i}`);
      const labelEl = document.getElementById(`wizard-step-label-${i}`);
      const itemEl = document.getElementById(`wizard-step-item-${i}`);
      const formEl = document.getElementById(`wizard-form-step-${i}`);

      if (stepEl) {
        // Clear transient animation classes
        stepEl.classList.remove('just-completed', 'animate-node-activate', 'is-active', 'is-completed');

        if (i < step) {
          // Completed step
          const wasJustCompleted = (i === prevStep && direction === 'forward');
          stepEl.className = 'wizard-node w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs bg-emerald-500 text-white shadow-sm is-completed';
          if (wasJustCompleted) {
            stepEl.classList.add('just-completed');
          }
          stepEl.innerHTML = '<i class="bi bi-check-lg text-sm wizard-node-check"></i>';

          if (labelEl) {
            labelEl.className = 'wizard-label text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors is-completed';
          }
          if (itemEl) {
            itemEl.classList.add('is-clickable');
            itemEl.title = `Step ${i}: Completed (Click to review)`;
          }
        } else if (i === step) {
          // Active step
          stepEl.className = 'wizard-node w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs bg-emerald-500 text-white shadow-glow is-active';
          if (direction === 'forward' || direction === 'backward') {
            stepEl.classList.add('animate-node-activate');
          }
          stepEl.innerHTML = i;

          if (labelEl) {
            labelEl.className = 'wizard-label text-xs font-extrabold text-slate-900 dark:text-white is-active transition-colors';
          }
          if (itemEl) {
            itemEl.classList.add('is-clickable');
            itemEl.title = `Current Step ${i}`;
          }
        } else {
          // Upcoming step
          stepEl.className = 'wizard-node w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs bg-slate-200 dark:bg-slate-700 text-slate-500';
          stepEl.innerHTML = i;

          if (labelEl) {
            labelEl.className = 'wizard-label text-xs font-bold text-slate-400 dark:text-slate-500 transition-colors';
          }
          if (itemEl) {
            const isClickable = i <= this.maxReachedStep;
            itemEl.classList.toggle('is-clickable', isClickable);
            itemEl.title = isClickable ? `Jump to Step ${i}` : `Step ${i} (Complete prior steps)`;
          }
        }
      }

      // Update connector line i (line between node i and node i+1)
      if (i < 6) {
        const lineFill = document.getElementById(`wizard-step-line-${i}`);
        if (lineFill) {
          lineFill.style.width = i < step ? '100%' : '0%';
        }
      }

      // Smooth panel switching with slide & fade
      if (formEl) {
        formEl.classList.remove('panel-slide-forward', 'panel-slide-backward');
        if (i === step) {
          formEl.classList.remove('hidden');
          if (direction === 'forward') {
            formEl.classList.add('panel-slide-forward');
          } else if (direction === 'backward') {
            formEl.classList.add('panel-slide-backward');
          }
        } else {
          formEl.classList.add('hidden');
        }
      }
    }

    // Toggle Back button
    const backBtn = document.getElementById('wizard-back-btn');
    if (backBtn) {
      backBtn.style.visibility = step === 1 ? 'hidden' : 'visible';
    }

    // Toggle Next / Submit button
    const nextBtn = document.getElementById('wizard-next-btn');
    if (nextBtn) {
      if (step === 6) {
        nextBtn.innerHTML = '<i class="bi bi-send-check-fill"></i> Submit Commercial Application';
        nextBtn.className = 'btn-primary px-8 shadow-glow';
        this.renderWizardReview();
      } else {
        nextBtn.innerHTML = 'Continue Step <i class="bi bi-arrow-right"></i>';
        nextBtn.className = 'btn-primary shadow-glow';
      }
    }
  }

  jumpToWizardStep(targetStep) {
    if (targetStep === this.wizardStep) return;
    if (targetStep < this.wizardStep) {
      this.setWizardStep(targetStep, 'backward');
    } else {
      if (targetStep <= (this.maxReachedStep || 1)) {
        this.setWizardStep(targetStep, 'forward');
      } else {
        if (!this.validateWizardStep(this.wizardStep)) return;
        this.collectWizardStepData(this.wizardStep);
        this.setWizardStep(targetStep, 'forward');
      }
    }
  }

  handleWizardNext() {
    if (!this.validateWizardStep(this.wizardStep)) return;
    this.collectWizardStepData(this.wizardStep);

    if (this.wizardStep === 6) {
      this.submitWizardApplication();
    } else {
      this.setWizardStep(this.wizardStep + 1, 'forward');
    }
  }

  handleWizardBack() {
    if (this.wizardStep > 1) {
      this.setWizardStep(this.wizardStep - 1, 'backward');
    }
  }

  validateWizardStep(step) {
    if (step === 1) {
      const selected = document.querySelector('input[name="wizard-financing-type"]:checked');
      if (!selected) {
        window.App?.showToast('Selection Required', 'Please select a financing solution to continue.', 'warning');
        return false;
      }
    } else if (step === 2) {
      const bizName = document.getElementById('wizard-biz-name')?.value.trim();
      const revenue = document.getElementById('wizard-biz-revenue')?.value.trim();
      if (!bizName || !revenue) {
        window.App?.showToast('Incomplete Fields', 'Please provide legal business name and approximate annual revenue.', 'warning');
        return false;
      }
    } else if (step === 3) {
      const amount = parseFloat(document.getElementById('wizard-amount')?.value);
      const desc = document.getElementById('wizard-equip-desc')?.value.trim();
      if (!amount || amount < 5000 || !desc) {
        window.App?.showToast('Invalid Amount / Asset', 'Please enter a valid funding amount ($5k+) and equipment description.', 'warning');
        return false;
      }
    } else if (step === 4) {
      const ownerName = document.getElementById('wizard-owner-name')?.value.trim();
      const ownerEmail = document.getElementById('wizard-owner-email')?.value.trim();
      if (!ownerName || !ownerEmail) {
        window.App?.showToast('Missing Owner Details', 'Please enter primary business owner name and direct email.', 'warning');
        return false;
      }
    } else if (step === 6) {
      const consent = document.getElementById('wizard-consent-check')?.checked;
      if (!consent) {
        window.App?.showToast('Authorization Required', 'Please check the box consenting to commercial credit evaluation.', 'warning');
        return false;
      }
    }
    return true;
  }

  collectWizardStepData(step) {
    if (step === 1) {
      this.wizardData.financingType = document.querySelector('input[name="wizard-financing-type"]:checked')?.value || 'Equipment Financing';
    } else if (step === 2) {
      this.wizardData.businessName = document.getElementById('wizard-biz-name')?.value;
      this.wizardData.entityType = document.getElementById('wizard-biz-entity')?.value;
      this.wizardData.industry = document.getElementById('wizard-biz-industry')?.value;
      this.wizardData.yearsInBusiness = document.getElementById('wizard-biz-years')?.value;
      this.wizardData.annualRevenue = document.getElementById('wizard-biz-revenue')?.value;
    } else if (step === 3) {
      this.wizardData.amount = parseFloat(document.getElementById('wizard-amount')?.value) || 150000;
      this.wizardData.downPayment = parseFloat(document.getElementById('wizard-down-payment')?.value) || 0;
      this.wizardData.termMonths = parseInt(document.getElementById('wizard-desired-term')?.value, 10) || 60;
      this.wizardData.equipmentCategory = document.getElementById('wizard-equip-category')?.value;
      this.wizardData.equipmentDescription = document.getElementById('wizard-equip-desc')?.value;
      this.wizardData.vendorName = document.getElementById('wizard-vendor-name')?.value || 'Authorized Dealer';
    } else if (step === 4) {
      this.wizardData.ownerName = document.getElementById('wizard-owner-name')?.value;
      this.wizardData.ownerEmail = document.getElementById('wizard-owner-email')?.value;
      this.wizardData.ownerPhone = document.getElementById('wizard-owner-phone')?.value;
      this.wizardData.ownerOwnership = document.getElementById('wizard-owner-pct')?.value || '100';
    }
  }

  renderWizardReview() {
    const d = this.wizardData;
    const summaryContainer = document.getElementById('wizard-review-summary');
    if (!summaryContainer) return;

    summaryContainer.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div class="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <div class="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
            <span class="font-bold text-slate-800 dark:text-slate-200">1. Solution & Facility</span>
            <button class="text-xs text-emerald-600 font-semibold" onclick="dashboard.setWizardStep(1)">Edit</button>
          </div>
          <div><span class="text-slate-500">Financing Type:</span> <strong class="text-slate-900 dark:text-white">${d.financingType}</strong></div>
          <div><span class="text-slate-500">Requested Amount:</span> <strong class="text-emerald-600 dark:text-emerald-400 font-tabular font-bold">$${(d.amount || 0).toLocaleString('en-US')}</strong></div>
          <div><span class="text-slate-500">Target Term:</span> <strong class="text-slate-900 dark:text-white">${d.termMonths || 60} Months</strong></div>
          <div><span class="text-slate-500">Down Payment:</span> <strong class="text-slate-900 dark:text-white">$${(d.downPayment || 0).toLocaleString('en-US')}</strong></div>
        </div>

        <div class="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <div class="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
            <span class="font-bold text-slate-800 dark:text-slate-200">2. Business Profile</span>
            <button class="text-xs text-emerald-600 font-semibold" onclick="dashboard.setWizardStep(2)">Edit</button>
          </div>
          <div><span class="text-slate-500">Legal Entity:</span> <strong class="text-slate-900 dark:text-white">${d.businessName || 'N/A'}</strong></div>
          <div><span class="text-slate-500">Structure:</span> <strong class="text-slate-900 dark:text-white">${d.entityType || 'LLC'}</strong></div>
          <div><span class="text-slate-500">Industry:</span> <strong class="text-slate-900 dark:text-white">${d.industry || 'General'}</strong></div>
          <div><span class="text-slate-500">Annual Revenue:</span> <strong class="text-slate-900 dark:text-white">${d.annualRevenue || 'N/A'}</strong></div>
        </div>

        <div class="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <div class="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
            <span class="font-bold text-slate-800 dark:text-slate-200">3. Equipment Asset</span>
            <button class="text-xs text-emerald-600 font-semibold" onclick="dashboard.setWizardStep(3)">Edit</button>
          </div>
          <div><span class="text-slate-500">Asset:</span> <strong class="text-slate-900 dark:text-white">${d.equipmentDescription || 'Equipment Assets'}</strong></div>
          <div><span class="text-slate-500">Vendor / Dealer:</span> <strong class="text-slate-900 dark:text-white">${d.vendorName || 'Authorized Dealer'}</strong></div>
          <div><span class="text-slate-500">Category:</span> <strong class="text-slate-900 dark:text-white">${d.equipmentCategory || 'Heavy Equipment'}</strong></div>
        </div>

        <div class="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <div class="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
            <span class="font-bold text-slate-800 dark:text-slate-200">4. Principal Guarantor</span>
            <button class="text-xs text-emerald-600 font-semibold" onclick="dashboard.setWizardStep(4)">Edit</button>
          </div>
          <div><span class="text-slate-500">Owner Name:</span> <strong class="text-slate-900 dark:text-white">${d.ownerName || 'Alexander Vance'}</strong></div>
          <div><span class="text-slate-500">Contact:</span> <strong class="text-slate-900 dark:text-white">${d.ownerEmail || 'client@demo.com'}</strong></div>
          <div><span class="text-slate-500">Equity Share:</span> <strong class="text-slate-900 dark:text-white">${d.ownerOwnership || '100'}%</strong></div>
        </div>
      </div>
    `;
  }

  submitWizardApplication() {
    const newApp = window.storage?.createApplication(this.wizardData);
    if (newApp) {
      window.App?.showToast(
        'Application Submitted!',
        `Your commercial financing request ${newApp.id} for $${newApp.amount.toLocaleString('en-US')} is now active.`,
        'success'
      );

      // Show confirmation view
      const wizardBox = document.getElementById('wizard-container');
      const confirmationBox = document.getElementById('wizard-confirmation-view');
      const confId = document.getElementById('conf-app-id');
      const confAmt = document.getElementById('conf-app-amount');

      if (confId) confId.textContent = newApp.id;
      if (confAmt) confAmt.textContent = '$' + newApp.amount.toLocaleString('en-US');

      wizardBox?.classList.add('hidden');
      confirmationBox?.classList.remove('hidden');
    }
  }

  // =========================================================================
  // Applications Table & Approval Tracking Drawer
  // =========================================================================
  initApplicationsTable() {
    const searchInput = document.getElementById('app-search-input');
    const filterSelect = document.getElementById('app-status-filter');

    searchInput?.addEventListener('input', (e) => {
      this.renderApplicationsList(e.target.value, filterSelect?.value);
    });

    filterSelect?.addEventListener('change', (e) => {
      this.renderApplicationsList(searchInput?.value, e.target.value);
    });

    // Drawer close buttons
    const closeDrawerBtn = document.getElementById('close-app-drawer-btn');
    const drawerBackdrop = document.getElementById('app-drawer-backdrop');

    closeDrawerBtn?.addEventListener('click', () => this.closeApplicationDrawer());
    drawerBackdrop?.addEventListener('click', (e) => {
      if (e.target === drawerBackdrop) this.closeApplicationDrawer();
    });
  }

  renderApplicationsList(searchQuery = '', statusFilter = 'All') {
    const list = window.storage ? window.storage.getApplications() : [];
    const tbody = document.getElementById('applications-table-body');
    if (!tbody) return;

    let filtered = list;
    if (statusFilter && statusFilter !== 'All') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.id.toLowerCase().includes(q) ||
        a.equipmentDescription.toLowerCase().includes(q) ||
        a.financingType.toLowerCase().includes(q)
      );
    }

    if (!filtered.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="py-12 text-center text-slate-400">
            <i class="bi bi-folder2-open text-4xl mb-2 inline-block"></i>
            <p class="text-sm">No applications matching your criteria.</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(app => `
      <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
        <td class="py-4 px-4 font-bold text-slate-900 dark:text-white font-tabular">${app.id}</td>
        <td class="py-4 px-4">
          <div class="font-semibold text-slate-800 dark:text-slate-200 text-sm">${app.financingType}</div>
          <div class="text-xs text-slate-400 truncate max-w-xs">${app.equipmentDescription}</div>
        </td>
        <td class="py-4 px-4 font-bold text-slate-900 dark:text-white font-tabular">$${app.amount.toLocaleString('en-US')}</td>
        <td class="py-4 px-4 text-xs text-slate-500 font-tabular">${app.submittedDate}</td>
        <td class="py-4 px-4">
          <div class="flex items-center gap-1.5">
            <div class="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div class="h-full bg-emerald-500 rounded-full" style="width: ${(app.stageNumber / 5) * 100}%"></div>
            </div>
            <span class="text-[11px] font-bold text-slate-500 font-tabular">${app.stageNumber}/5</span>
          </div>
        </td>
        <td class="py-4 px-4">
          <span class="px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap shrink-0 inline-flex items-center justify-center ${this.getStatusBadgeClass(app.status)}">${app.status}</span>
        </td>
        <td class="py-4 px-4 text-right">
          <div class="flex items-center justify-end gap-2">
            <button class="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white transition-colors text-xs font-semibold" title="View Details & Tracker" onclick="dashboard.openApplicationDrawer('${app.id}')">
              <i class="bi bi-eye-fill"></i> Details
            </button>
            <button class="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-white transition-colors text-xs" title="Advance Status (Demo)" onclick="dashboard.advanceStatusDemo('${app.id}')">
              <i class="bi bi-fast-forward-fill"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  advanceStatusDemo(appId) {
    const updated = window.storage?.advanceApplicationStatus(appId);
    if (updated) {
      window.App?.showToast('Simulation: Status Advanced!', `Application ${updated.id} status is now "${updated.status}" (Stage ${updated.stageNumber}/5).`, 'success');
      this.renderApplicationsList();
      if (this.activeApplicationDrawerId === appId) {
        this.openApplicationDrawer(appId);
      }
    }
  }

  openApplicationDrawer(appId) {
    this.activeApplicationDrawerId = appId;
    const app = window.storage?.getApplication(appId);
    if (!app) return;

    const drawer = document.getElementById('app-drawer-backdrop');
    const content = document.getElementById('app-drawer-content');

    const stages = [
      { num: 1, name: 'Application Submitted' },
      { num: 2, name: 'Document Verification' },
      { num: 3, name: 'Credit Underwriting' },
      { num: 4, name: 'Lender Term Sheet Issued' },
      { num: 5, name: 'Direct Funding Wire' }
    ];

    let stagesHTML = '<div class="space-y-4 my-6">';
    stages.forEach((st, idx) => {
      const isPast = st.num < app.stageNumber;
      const isCurrent = st.num === app.stageNumber;

      stagesHTML += `
        <div class="flex items-start gap-3.5">
          <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs transition-all ${isCurrent ? 'bg-emerald-500 text-white shadow-glow stepper-stage-current ring-4 ring-emerald-500/25' : (isPast ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500')}">
            ${isPast ? '<i class="bi bi-check-lg text-sm"></i>' : st.num}
          </div>
          <div class="flex-1 pb-4 ${idx < 4 ? 'border-b border-slate-100 dark:border-slate-800' : ''}">
            <div class="flex justify-between items-center">
              <h5 class="text-sm font-bold text-slate-900 dark:text-white">${st.name}</h5>
              <span class="text-[11px] font-semibold ${isCurrent ? 'text-emerald-500' : 'text-slate-400'}">${isCurrent ? 'In Progress' : (isPast ? 'Completed' : 'Upcoming')}</span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">${app.timeline[idx]?.date || 'Pending previous step'}</p>
          </div>
        </div>
      `;
    });
    stagesHTML += '</div>';

    if (content) {
      content.innerHTML = `
        <div>
          <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Application File</span>
              <h2 class="text-xl font-bold text-slate-900 dark:text-white">${app.id}</h2>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shrink-0 inline-flex items-center justify-center ${this.getStatusBadgeClass(app.status)}">${app.status}</span>
          </div>

          <!-- Quick Metrics -->
          <div class="grid grid-cols-2 gap-3 my-5">
            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span class="text-xs text-slate-500">Financed Amount</span>
              <div class="text-lg font-bold text-slate-900 dark:text-white font-tabular mt-0.5">$${app.amount.toLocaleString('en-US')}</div>
            </div>
            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span class="text-xs text-slate-500">Estimated Monthly</span>
              <div class="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-tabular mt-0.5">$${app.monthlyPayment.toLocaleString('en-US')}/mo</div>
            </div>
          </div>

          <!-- Progress Stepper -->
          <div class="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/40">
            <h4 class="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Live Underwriting Timeline</h4>
            ${stagesHTML}
          </div>

          <!-- Asset & Loan Details -->
          <div class="my-6 space-y-2.5 text-sm">
            <h4 class="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Facility Specifications</h4>
            <div class="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800"><span class="text-slate-500">Asset:</span> <span class="font-semibold text-slate-800 dark:text-slate-200">${app.equipmentDescription}</span></div>
            <div class="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800"><span class="text-slate-500">Equipment Vendor:</span> <span class="font-semibold text-slate-800 dark:text-slate-200">${app.vendorName}</span></div>
            <div class="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800"><span class="text-slate-500">Down Payment:</span> <span class="font-semibold text-slate-800 dark:text-slate-200">$${app.downPayment.toLocaleString('en-US')}</span></div>
            <div class="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800"><span class="text-slate-500">Term:</span> <span class="font-semibold text-slate-800 dark:text-slate-200">${app.termMonths} Months</span></div>
            <div class="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800"><span class="text-slate-500">Estimated Rate:</span> <span class="font-semibold text-emerald-600 dark:text-emerald-400">${app.rateEstimate}</span></div>
          </div>

          <!-- Broker Notes -->
          <div class="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-6">
            <h5 class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5">
              <i class="bi bi-chat-left-quote-fill text-emerald-500"></i> Broker Notes & Feedback
            </h5>
            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${app.brokerNotes}</p>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-2.5">
            <button class="btn-primary w-full text-sm py-2.5" onclick="dashboard.advanceStatusDemo('${app.id}')">
              <i class="bi bi-fast-forward-fill"></i> Simulate Next Underwriting Stage
            </button>
            <div class="flex gap-2">
              <button class="btn-secondary flex-1 text-xs py-2" onclick="window.print()">
                <i class="bi bi-printer"></i> Download / Print
              </button>
              <button class="btn-outline-navy flex-1 text-xs py-2 text-rose-500 border-rose-200 hover:bg-rose-50" onclick="dashboard.withdrawApplication('${app.id}')">
                <i class="bi bi-x-circle"></i> Withdraw
              </button>
            </div>
          </div>
        </div>
      `;
    }

    drawer?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeApplicationDrawer() {
    const drawer = document.getElementById('app-drawer-backdrop');
    drawer?.classList.remove('active');
    document.body.style.overflow = '';
  }

  withdrawApplication(appId) {
    if (confirm(`Are you sure you want to withdraw application ${appId}?`)) {
      window.storage?.withdrawApplication(appId);
      window.App?.showToast('Application Withdrawn', `Application ${appId} has been archived.`, 'warning');
      this.closeApplicationDrawer();
      this.renderApplicationsList();
      this.renderOverview();
    }
  }

  getStatusBadgeClass(status) {
    switch (status) {
      case 'Submitted': return 'badge-blue';
      case 'Under Review': return 'badge-gold';
      case 'Underwriting': return 'badge-gold';
      case 'Offer Issued': return 'badge-growth';
      case 'Approved': return 'badge-growth';
      case 'Funded': return 'bg-emerald-600 text-white';
      case 'Additional Documents Required': return 'badge-gold';
      case 'Withdrawn': return 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
      default: return 'badge-blue';
    }
  }

  // =========================================================================
  // Document Upload Center
  // =========================================================================
  initDocumentUploader() {
    const dropzone = document.getElementById('doc-dropzone');
    const fileInput = document.getElementById('doc-file-input');
    const browseBtn = document.getElementById('doc-browse-btn');

    browseBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      fileInput?.click();
    });

    fileInput?.addEventListener('change', (e) => {
      if (e.target.files?.length) {
        this.handleFileUpload(e.target.files[0]);
      }
    });

    if (dropzone) {
      ['dragenter', 'dragover'].forEach(name => {
        dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          dropzone.classList.add('border-emerald-500', 'bg-emerald-50/20');
        });
      });
      ['dragleave', 'drop'].forEach(name => {
        dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          dropzone.classList.remove('border-emerald-500', 'bg-emerald-50/20');
        });
      });
      dropzone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files?.length) {
          this.handleFileUpload(e.dataTransfer.files[0]);
        }
      });
    }
  }

  handleFileUpload(file) {
    // Validate type: PDF, JPG, PNG, XLSX, DOCX
    const validExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'xlsx', 'docx'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(ext)) {
      window.App?.showToast('Invalid File Type', 'Allowed file types are PDF, JPG, PNG, XLSX, and DOCX.', 'error');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      window.App?.showToast('File Too Large', 'Maximum file size is 25 MB.', 'error');
      return;
    }

    // Simulated upload progress animation
    const progressModal = document.getElementById('modal-upload-progress');
    const progressBar = document.getElementById('upload-progress-bar');
    const progressLabel = document.getElementById('upload-progress-label');

    window.App?.openModal('modal-upload-progress');
    let pct = 0;
    const interval = setInterval(() => {
      pct += 25;
      if (progressBar) progressBar.style.width = pct + '%';
      if (progressLabel) progressLabel.textContent = `Uploading ${file.name} (${pct}%)...`;

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          window.App?.closeModal('modal-upload-progress');
          window.storage?.addDocument({
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
            type: ext.toUpperCase(),
            category: document.getElementById('doc-category-select')?.value || 'Financial Document'
          });
          window.App?.showToast('Document Uploaded Successfully!', `"${file.name}" was uploaded and submitted for review.`, 'success');
          this.renderDocumentsCenter();
        }, 500);
      }
    }, 150);
  }

  renderDocumentsCenter() {
    const docs = window.storage ? window.storage.getDocuments() : [];
    const container = document.getElementById('documents-list-container');
    const ringEl = document.getElementById('doc-completeness-pct');
    const ringSvg = document.getElementById('doc-completeness-circle');

    if (!container) return;

    // Completeness calculation
    const acceptedCount = docs.filter(d => d.status === 'Accepted').length;
    const totalCount = Math.max(8, docs.length);
    const pct = Math.round((acceptedCount / totalCount) * 100);

    if (ringEl) ringEl.textContent = pct + '%';
    if (ringSvg) {
      const circumference = 2 * Math.PI * 40;
      ringSvg.style.strokeDashoffset = circumference - (circumference * pct) / 100;
    }

    container.innerHTML = docs.map(doc => {
      // Allow clean word breaks at underscores without altering filename
      const formattedName = (doc.name || '').replace(/_/g, '_<wbr>');

      return `
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:border-emerald-500/50 transition-colors gap-3.5 min-w-0">
        <div class="flex items-start gap-3.5 min-w-0 w-full sm:flex-1">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg shrink-0 mt-0.5">
            <i class="bi bi-file-earmark-text-fill"></i>
          </div>
          <div class="min-w-0 flex-1">
            <h5 class="text-sm font-bold text-slate-900 dark:text-white leading-snug [overflow-wrap:anywhere]" title="${doc.name}">${formattedName}</h5>
            <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mt-1">
              <span>${doc.category}</span>
              <span>&bull;</span>
              <span>${doc.size}</span>
              <span>&bull;</span>
              <span class="whitespace-nowrap">Uploaded ${doc.uploadedDate}</span>
            </div>
            ${doc.reviewNote ? `
              <div class="inline-flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/50 px-2.5 py-1.5 rounded-lg mt-2 leading-relaxed">
                <i class="bi bi-info-circle shrink-0 mt-0.5"></i>
                <span>${doc.reviewNote}</span>
              </div>
            ` : ''}
          </div>
        </div>
        <div class="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t border-slate-200/70 dark:border-slate-800 sm:border-0 mt-1 sm:mt-0">
          <span class="px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${this.getDocStatusBadge(doc.status)}">${doc.status}</span>
          <div class="flex items-center gap-1.5 shrink-0">
            <button class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white transition-colors text-xs font-semibold text-slate-700 dark:text-slate-200" title="Preview Document" onclick="dashboard.previewDocument('${doc.name}')">
              <i class="bi bi-eye"></i> <span class="text-[11px]">View</span>
            </button>
            <button class="p-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 hover:bg-rose-500 hover:text-white transition-colors text-xs text-slate-500 dark:text-slate-400" title="Delete" onclick="dashboard.deleteDoc('${doc.id}')">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    }).join('');
  }

  getDocStatusBadge(status) {
    switch (status) {
      case 'Accepted': return 'badge-growth';
      case 'Under Review': return 'badge-gold';
      case 'Uploaded': return 'badge-blue';
      case 'Rejected': return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400';
      default: return 'bg-slate-200 text-slate-600';
    }
  }

  previewDocument(docName) {
    const modalContent = document.getElementById('preview-doc-content');
    if (modalContent) {
      modalContent.innerHTML = `
        <div class="p-8 text-center">
          <i class="bi bi-file-earmark-pdf text-6xl text-emerald-500 mb-3 inline-block"></i>
          <h4 class="font-bold text-lg text-slate-900 dark:text-white mb-2">${docName}</h4>
          <p class="text-sm text-slate-500 max-w-md mx-auto mb-6">Encrypted document securely stored in demo local repository. In production, this previews via AWS S3 / Azure Private Vault.</p>
          <button class="btn-primary" onclick="App.closeModal('modal-doc-preview')">Close Preview</button>
        </div>
      `;
      window.App?.openModal('modal-doc-preview');
    }
  }

  deleteDoc(docId) {
    if (confirm('Are you sure you want to remove this document metadata?')) {
      window.storage?.deleteDocument(docId);
      window.App?.showToast('Document Removed', 'Document record has been deleted.', 'info');
      this.renderDocumentsCenter();
    }
  }

  // =========================================================================
  // Offers View
  // =========================================================================
  initOffers() {
    // Actions are handled via inline calls to dashboard.acceptOffer() / declineOffer()
  }

  renderOffersView() {
    const offers = window.storage ? window.storage.getOffers() : [];
    const container = document.getElementById('offers-cards-container');
    if (!container) return;

    if (!offers.length) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12 text-slate-400">
          <i class="bi bi-inbox text-5xl mb-2 inline-block"></i>
          <p class="text-sm">No lender offers issued yet. Check back once underwriting is complete.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = offers.map(o => `
      <div class="glass-card rounded-2xl p-6 flex flex-col justify-between border-2 ${o.status === 'Accepted' ? 'border-emerald-500' : 'border-slate-200 dark:border-slate-800'}">
        <div>
          <div class="flex items-start justify-between gap-3 mb-4">
            <div>
              <span class="text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">Application ${o.applicationId}</span>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white mt-0.5">${o.lenderName}</h3>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shrink-0 inline-flex items-center justify-center ${o.status === 'Accepted' ? 'badge-growth' : (o.status === 'Declined' ? 'bg-rose-100 text-rose-700' : 'badge-blue')}">${o.status}</span>
          </div>

          <!-- Highlight Figures -->
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 mb-5">
            <div class="flex justify-between items-baseline mb-2">
              <span class="text-xs text-slate-500">Approved Facility:</span>
              <span class="text-2xl font-extrabold text-slate-900 dark:text-white font-tabular">$${o.amount.toLocaleString('en-US')}</span>
            </div>
            <div class="flex justify-between items-baseline">
              <span class="text-xs text-slate-500">Monthly Payment:</span>
              <span class="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-tabular">$${o.monthlyPayment.toLocaleString('en-US')}/mo</span>
            </div>
          </div>

          <!-- Term Highlights -->
          <div class="space-y-2 text-xs border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <div class="flex justify-between"><span class="text-slate-500">Fixed Rate APR:</span> <strong class="text-slate-800 dark:text-slate-200">${o.apr}%</strong></div>
            <div class="flex justify-between"><span class="text-slate-500">Financing Term:</span> <strong class="text-slate-800 dark:text-slate-200">${o.termMonths} Months</strong></div>
            <div class="flex justify-between"><span class="text-slate-500">Origination Fee:</span> <strong class="text-slate-800 dark:text-slate-200">${o.originationFee}</strong></div>
            <div class="flex justify-between"><span class="text-slate-500">Prepayment:</span> <strong class="text-slate-800 dark:text-slate-200">${o.prepaymentPenalty}</strong></div>
          </div>

          <div class="space-y-1.5 mb-6">
            ${o.highlights.map(h => `<div class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"><i class="bi bi-check2 text-emerald-500"></i> ${h}</div>`).join('')}
          </div>
        </div>

        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          ${o.status === 'Available' ? `
            <button class="btn-primary flex-1 text-xs py-2.5" onclick="dashboard.acceptOfferAction('${o.id}')">
              <i class="bi bi-check-circle-fill"></i> Accept Offer
            </button>
            <button class="btn-secondary text-xs py-2.5 px-3" onclick="dashboard.requestChangesAction('${o.id}')">
              Request Terms
            </button>
          ` : `
            <div class="w-full text-center py-2 text-xs font-semibold text-slate-500">
              ${o.status === 'Accepted' ? '<i class="bi bi-check-all text-emerald-500 text-lg"></i> Offer Accepted &bull; Closing Scheduled' : 'Offer Declined'}
            </div>
          `}
        </div>
      </div>
    `).join('');
  }

  acceptOfferAction(offerId) {
    if (confirm('Accept this term sheet and instruct EquiCapital to dispatch closing contracts?')) {
      window.storage?.acceptOffer(offerId);
      window.App?.showToast('Financing Offer Accepted!', 'Your advisor has dispatched formal closing documentation.', 'success');
      this.renderOffersView();
      this.renderOverview();
    }
  }

  requestChangesAction(offerId) {
    const note = prompt('Describe the term changes or amortization adjustment you would like to request:');
    if (note) {
      window.storage?.sendMessage(`Requested changes on Offer ${offerId}: ${note}`);
      window.App?.showToast('Changes Dispatched to Advisor', 'David Vance was notified to negotiate revised terms with the lender.', 'info');
    }
  }

  // =========================================================================
  // Messaging View
  // =========================================================================
  initMessaging() {
    const sendBtn = document.getElementById('msg-send-btn');
    const input = document.getElementById('msg-input');

    const handleSend = () => {
      const text = input?.value.trim();
      if (!text) return;
      window.storage?.sendMessage(text);
      input.value = '';
      this.renderMessagesView();

      // Trigger auto-reply
      window.storage?.simulateBrokerReply(() => {
        this.renderMessagesView();
      });
    };

    sendBtn?.addEventListener('click', handleSend);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

  renderMessagesView() {
    const messages = window.storage ? window.storage.getMessages() : [];
    const container = document.getElementById('messages-conversation-container');
    if (!container) return;

    container.innerHTML = messages.map(msg => {
      const isClient = msg.sender === 'client';
      return `
        <div class="flex items-start gap-2.5 sm:gap-3 ${isClient ? 'flex-row-reverse ml-auto' : 'mr-auto'} max-w-[92%] sm:max-w-md w-fit">
          <img src="${msg.avatar}" alt="${msg.senderName}" class="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5">
          <div class="flex flex-col ${isClient ? 'items-end' : 'items-start'} min-w-0 flex-1">
            <div class="flex items-center gap-2 mb-1 ${isClient ? 'flex-row-reverse' : ''}">
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200">${msg.senderName}</span>
              <span class="text-[10px] text-slate-400 font-tabular">${msg.timestamp}</span>
            </div>
            <div class="p-3 sm:p-3.5 rounded-2xl text-xs leading-relaxed ${isClient ? 'bg-emerald-600 text-white rounded-tr-none text-left' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'}">
              ${msg.text}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  }

  // =========================================================================
  // Saved Calculations View
  // =========================================================================
  renderSavedCalculations() {
    const list = window.storage ? window.storage.getCalculations() : [];
    const container = document.getElementById('saved-calculations-container');
    if (!container) return;

    if (!list.length) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12 text-slate-400">
          <i class="bi bi-calculator text-5xl mb-2 inline-block"></i>
          <p class="text-sm">No saved calculations found. Explore the Loan Calculator to model scenarios.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(c => `
      <div class="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-start mb-3">
            <div>
              <span class="text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">${c.type}</span>
              <h4 class="font-bold text-base text-slate-900 dark:text-white">${c.title}</h4>
            </div>
            <button class="text-slate-400 hover:text-rose-500" onclick="dashboard.deleteCalculation('${c.id}')">
              <i class="bi bi-trash"></i>
            </button>
          </div>
          <div class="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
            <div class="flex justify-between"><span class="text-slate-500">Loan Amount:</span> <strong class="font-tabular">$${c.loanAmount.toLocaleString('en-US')}</strong></div>
            <div class="flex justify-between"><span class="text-slate-500">APR Rate:</span> <strong>${c.apr}%</strong></div>
            <div class="flex justify-between"><span class="text-slate-500">Term:</span> <strong>${c.termMonths} Months</strong></div>
            <div class="flex justify-between"><span class="text-slate-500">Monthly Payment:</span> <strong class="text-emerald-600 dark:text-emerald-400 font-tabular">$${c.monthlyPayment.toLocaleString('en-US')}/mo</strong></div>
          </div>
        </div>
        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
          <button class="btn-primary w-full text-xs py-2" onclick="dashboard.applyWithCalculation('${c.id}')">
            Apply With These Terms
          </button>
        </div>
      </div>
    `).join('');
  }

  deleteCalculation(id) {
    window.storage?.deleteCalculation(id);
    window.App?.showToast('Scenario Deleted', 'The saved calculation was removed.', 'info');
    this.renderSavedCalculations();
  }

  applyWithCalculation(id) {
    const calc = window.storage?.getCalculations().find(c => c.id === id);
    if (calc) {
      window.storage?.saveDraftApplication({
        financingType: calc.type.includes('Lease') ? 'Equipment Leasing' : 'Equipment Financing',
        amount: calc.loanAmount,
        downPayment: calc.downPayment,
        termMonths: calc.termMonths
      });
      window.App?.showToast('Terms Loaded', 'Draft updated. Directing to wizard.', 'success');
      this.switchView('new-application');
    }
  }

  // =========================================================================
  // Settings & Profile View
  // =========================================================================
  initProfileSettings() {
    const profileForm = document.getElementById('settings-profile-form');
    profileForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const updated = window.storage?.updateProfile({
        name: document.getElementById('settings-name')?.value,
        email: document.getElementById('settings-email')?.value,
        phone: document.getElementById('settings-phone')?.value,
        businessName: document.getElementById('settings-biz-name')?.value,
        annualRevenue: document.getElementById('settings-biz-revenue')?.value,
        address: document.getElementById('settings-biz-address')?.value
      });
      if (updated) {
        window.App?.showToast('Profile Updated', 'Business settings successfully saved.', 'success');
        this.checkSession();
      }
    });

    // Reset Demo Data Button
    const resetBtn = document.getElementById('settings-reset-demo-btn');
    resetBtn?.addEventListener('click', () => {
      if (confirm('Reset all demo applications, documents, offers, and messages to initial seed data?')) {
        window.storage?.resetDemoData();
        window.App?.showToast('Demo Data Reset', 'Initial clean state restored.', 'success');
        setTimeout(() => window.location.reload(), 600);
      }
    });
  }

  populateSettings() {
    const user = window.storage?.getCurrentUser();
    if (!user) return;

    const map = {
      'settings-name': user.name,
      'settings-email': user.email,
      'settings-phone': user.phone,
      'settings-biz-name': user.businessName,
      'settings-biz-revenue': user.annualRevenue,
      'settings-biz-address': user.address
    };

    Object.entries(map).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el && val) el.value = val;
    });
  }

  handleLogout() {
    if (confirm('Log out of EquiCapital client portal?')) {
      window.storage?.logout();
      window.location.href = 'index.html';
    }
  }
}

// Global Dashboard Instance
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('business-client-dashboard')) {
    window.dashboard = new DashboardController();
  }
});
