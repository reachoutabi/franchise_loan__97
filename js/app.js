/**
 * EquiCapital - Global Core Application Logic
 * Themes, RTL, Mobile Menu, Toasts, Modals, Counters & Formatters
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  init() {
    this.initTheme();
    this.initDirection();
    this.initMobileNav();
    this.initModals();
    this.initCounters();
    this.initSessionNav();
    this.initFooterHandlers();
    this.initFaqAccordion();
    this.initScrollAnimations();
  },

  // Theme Management (Light / Dark)
  initTheme() {
    const savedTheme = localStorage.getItem('equifund_theme_preference') || 'light';
    this.setTheme(savedTheme);

    const toggles = document.querySelectorAll('.theme-toggle-btn');
    toggles.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
      });
    });
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('equifund_theme_preference', theme);

    // Update icons
    const toggleIcons = document.querySelectorAll('.theme-toggle-icon');
    toggleIcons.forEach(icon => {
      if (theme === 'dark') {
        icon.className = 'bi bi-sun-fill theme-toggle-icon text-amber-400';
      } else {
        icon.className = 'bi bi-moon-stars-fill theme-toggle-icon text-slate-600';
      }
    });

    // Dispatch event for charts
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  },

  // Direction Management (LTR / RTL)
  initDirection() {
    const savedDir = localStorage.getItem('equifund_dir_preference') || 'ltr';
    this.setDirection(savedDir);

    const rtlToggles = document.querySelectorAll('.rtl-toggle-btn');
    rtlToggles.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
        const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
        this.setDirection(newDir);
        this.showToast(
          newDir === 'rtl' ? 'RTL Layout Enabled' : 'LTR Layout Enabled',
          newDir === 'rtl' ? 'Switched to Right-to-Left orientation for Arabic/Hebrew.' : 'Switched to Left-to-Right orientation.',
          'info'
        );
      });
    });
  },

  setDirection(dir) {
    document.documentElement.setAttribute('dir', dir);
    localStorage.setItem('equifund_dir_preference', dir);

    const rtlBtns = document.querySelectorAll('.rtl-toggle-btn');
    rtlBtns.forEach(btn => {
      btn.setAttribute('title', dir === 'rtl' ? 'Switch to Left-to-Right (LTR)' : 'Switch to Right-to-Left (RTL)');
      if (dir === 'rtl') {
        btn.classList.add('border-emerald-500', 'text-emerald-500');
      } else {
        btn.classList.remove('border-emerald-500', 'text-emerald-500');
      }
    });

    const drawer = document.getElementById('mobile-menu-drawer');
    if (drawer && !drawer.classList.contains('mobile-menu-open')) {
      const prevTransition = drawer.style.transition;
      drawer.style.transition = 'none';
      if (dir === 'rtl') {
        drawer.classList.remove('translate-x-full');
        drawer.classList.add('-translate-x-full');
      } else {
        drawer.classList.remove('-translate-x-full');
        drawer.classList.add('translate-x-full');
      }
      void drawer.offsetWidth;
      setTimeout(() => {
        drawer.style.transition = prevTransition;
      }, 50);
    }

    const sidebar = document.getElementById('dashboard-sidebar');
    if (sidebar) {
      const prevTrans = sidebar.style.transition;
      sidebar.style.transition = 'none';
      void sidebar.offsetWidth;
      setTimeout(() => {
        sidebar.style.transition = prevTrans;
      }, 50);
    }

    this.normalizeBidiPunctuation(dir);

    window.dispatchEvent(new CustomEvent('directionChanged', { detail: { dir } }));
  },

  // Normalization for punctuation, symbols, asterisks, hashtags and stars across directions
  normalizeBidiPunctuation(dir) {
    // 1. Mandatory asterisks in form labels
    const requiredLabels = document.querySelectorAll('label');
    requiredLabels.forEach(label => {
      const roseSpans = label.querySelectorAll('.text-rose-500, [class*="rose"], .required-symbol, .mandatory-symbol');
      roseSpans.forEach(span => {
        if (span.textContent.includes('*')) {
          span.classList.add('mandatory-star');
          span.setAttribute('dir', 'ltr');
        }
      });
    });

    // 2. Star rating containers
    const starContainers = document.querySelectorAll('.glass-card .text-amber-400, .rating-stars, .review-stars, [class*="bi-star-fill"]');
    starContainers.forEach(el => {
      const flexParent = el.closest('.flex');
      if (flexParent) {
        if (dir === 'rtl') {
          flexParent.setAttribute('data-dir-aligned', 'rtl');
        } else {
          flexParent.removeAttribute('data-dir-aligned');
        }
      }
    });

    // 3. FAQ Accordion headers and answer alignment across directions
    const faqSummaries = document.querySelectorAll('#home-faq-accordion summary, details.glass-card summary, #home2-faq-accordion button, #contact-faq-accordion button');
    faqSummaries.forEach(summary => {
      const span = summary.querySelector('span');
      const icon = summary.querySelector('i');
      if (span && icon) {
        if (dir === 'rtl') {
          summary.style.flexDirection = 'row-reverse';
          summary.style.justifyContent = 'space-between';
          summary.style.textAlign = 'right';
          span.style.textAlign = 'right';
          span.style.marginLeft = '1.25rem';
          span.style.marginRight = '0';
        } else {
          summary.style.flexDirection = '';
          summary.style.justifyContent = '';
          summary.style.textAlign = '';
          span.style.textAlign = '';
          span.style.marginLeft = '';
          span.style.marginRight = '';
        }
      }
    });

    const faqAnswers = document.querySelectorAll('#home-faq-accordion details > div, #home2-faq-accordion .glass-card > div, details.glass-card > div, #contact-faq-accordion .faq-answer');
    faqAnswers.forEach(answer => {
      if (dir === 'rtl') {
        answer.style.textAlign = 'right';
      } else {
        answer.style.textAlign = '';
      }
    });
  },

  // Mobile Navigation Drawer
  initMobileNav() {
    const openBtn = document.getElementById('mobile-menu-btn') || document.getElementById('mobile-menu-open-btn');
    const closeBtn = document.getElementById('mobile-menu-close') || document.getElementById('mobile-menu-close-btn');
    const drawer = document.getElementById('mobile-menu-drawer');
    const backdrop = document.getElementById('mobile-menu-backdrop');

    if (!drawer) return;

    const openMenu = () => {
      drawer.classList.remove('translate-x-full', '-translate-x-full');
      drawer.classList.add('mobile-menu-open');
      backdrop?.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
      drawer.classList.remove('mobile-menu-open');
      drawer.classList.add(isRtl ? '-translate-x-full' : 'translate-x-full');
      backdrop?.classList.add('hidden');
      document.body.style.overflow = '';
    };

    openBtn?.addEventListener('click', openMenu);
    closeBtn?.addEventListener('click', closeMenu);
    backdrop?.addEventListener('click', closeMenu);

    // Mobile Home Dropdown Toggle
    const homeToggle = document.getElementById('mobile-home-toggle');
    const homeMenu = document.getElementById('mobile-home-menu');
    const homeIcon = document.getElementById('mobile-home-icon');
    homeToggle?.addEventListener('click', (e) => {
      e.preventDefault();
      if (!homeMenu) return;
      homeMenu.classList.toggle('hidden');
      homeIcon?.classList.toggle('rotate-180');
    });
  },

  // Modal Controllers
  initModals() {
    document.addEventListener('click', (e) => {
      // Trigger modal open
      const trigger = e.target.closest('[data-modal-target]');
      if (trigger) {
        e.preventDefault();
        const targetId = trigger.getAttribute('data-modal-target');
        this.openModal(targetId);
      }

      // Trigger modal close
      const closeBtn = e.target.closest('[data-modal-close]');
      if (closeBtn) {
        e.preventDefault();
        const modal = closeBtn.closest('.modal-backdrop');
        if (modal) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
    });

    // Close on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.active, .drawer-backdrop.active').forEach(el => {
          el.classList.remove('active');
        });
        document.body.style.overflow = '';
      }
    });
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  // Animated Number Counters with Smooth Easing & Decimal Precision
  initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const animate = (counter) => {
      const target = parseFloat(counter.getAttribute('data-counter'));
      const prefix = counter.getAttribute('data-prefix') || '';
      const suffix = counter.getAttribute('data-suffix') || '';
      const decimals = parseInt(counter.getAttribute('data-decimals') || '0', 10);
      const duration = 1800;
      let startTime = null;

      const update = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // easeOutCubic curve for realistic deceleration
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = target * ease;

        if (decimals > 0) {
          counter.textContent = prefix + current.toFixed(decimals) + suffix;
        } else {
          counter.textContent = prefix + Math.floor(current).toLocaleString('en-US') + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          if (decimals > 0) {
            counter.textContent = prefix + target.toFixed(decimals) + suffix;
          } else {
            counter.textContent = prefix + target.toLocaleString('en-US') + suffix;
          }
          counter.classList.add('counter-popped');
          setTimeout(() => counter.classList.remove('counter-popped'), 600);
        }
      };

      requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          animate(entry.target);
        }
      });
    }, { threshold: 0.25 });

    counters.forEach(c => observer.observe(c));
  },

  // Scroll Entrance Animations Observer
  initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .stat-card-animated, .trust-badge-card, .partner-marquee-container');
    if (!animatedElements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    animatedElements.forEach(el => observer.observe(el));
  },

  // Session-Aware Navbar Buttons
  initSessionNav() {
    const user = window.storage ? window.storage.getCurrentUser() : null;

    // Dedicated Dashboard Links
    const dashboardLinks = document.querySelectorAll('.dashboard-nav-link');
    dashboardLinks.forEach(link => {
      link.href = 'dashboard.html';
      link.innerHTML = `Dashboard`;
      link.title = user && user.name ? `Signed in as ${user.name} - View Dashboard` : 'Dashboard';
    });

    // Sign In Links (Always keep Sign In option accessible)
    const authLinks = document.querySelectorAll('.auth-nav-link');
    authLinks.forEach(link => {
      link.href = 'login.html';
      link.innerHTML = `Sign In`;
      link.title = 'Sign In to your Account';
    });

    const mobileAuthLinks = document.querySelectorAll('.mobile-auth-link');
    mobileAuthLinks.forEach(link => {
      link.href = 'login.html';
      link.innerHTML = `<i class="bi bi-person-circle"></i> Sign In`;
    });
  },

  // Newsletter Subscription Form Handler
  handleNewsletterSubmit(form) {
    const input = form.querySelector('input[type="email"]');
    if (!input || !input.value) return;
    const email = input.value.trim();
    this.showToast('Subscription Confirmed', `Thank you! ${email} has been subscribed to market intelligence updates.`, 'success');
    input.value = '';
  },

  // Toast System
  showToast(title, message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;

    let iconClass = 'bi-check-circle-fill text-emerald-500';
    if (type === 'error') iconClass = 'bi-exclamation-triangle-fill text-rose-500';
    if (type === 'warning') iconClass = 'bi-exclamation-circle-fill text-amber-500';
    if (type === 'info') iconClass = 'bi-info-circle-fill text-blue-500';

    toast.innerHTML = `
      <i class="bi ${iconClass} text-xl flex-shrink-0 mt-0.5"></i>
      <div class="flex-1">
        <h4 class="font-semibold text-sm leading-snug">${title}</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">${message}</p>
      </div>
      <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm ml-2" onclick="this.parentElement.remove()">
        <i class="bi bi-x-lg"></i>
      </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4200);
  },

  // Footer Actions: Newsletter, Disclosures & Modals
  initFooterHandlers() {
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        if (input && input.value) {
          this.showToast('Subscribed to Market Briefing!', `We have registered ${input.value} for weekly equipment financing rate updates.`, 'success');
          input.value = '';
        }
      });
    });
  },

  // FAQ Accordion (Single-Open Exclusive Behavior)
  initFaqAccordion() {
    // 1. Details-based accordions (e.g. index.html)
    const faqDetailsContainers = document.querySelectorAll('#home-faq-accordion, [data-accordion="details"]');
    faqDetailsContainers.forEach(container => {
      const detailsList = container.querySelectorAll('details');
      detailsList.forEach(detail => {
        detail.addEventListener('toggle', () => {
          if (detail.open) {
            detailsList.forEach(other => {
              if (other !== detail && other.open) {
                other.open = false;
              }
            });
          }
        });
      });
    });

    // 2. Custom button-based accordions (e.g. home-2.html, contact.html)
    const faqButtonContainers = document.querySelectorAll('#home2-faq-accordion, #contact-faq-accordion, [data-accordion="buttons"]');
    faqButtonContainers.forEach(container => {
      const cards = container.querySelectorAll('.glass-card, .faq-item');
      cards.forEach(card => {
        const btn = card.querySelector('button');
        const answer = card.querySelector('.faq-answer');
        const icon = card.querySelector('.faq-chevron, i.bi-chevron-down, button > i:last-child');

        if (!btn || !answer) return;

        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const isCurrentlyOpen = !answer.classList.contains('hidden');

          // Close all FAQ items in this container
          cards.forEach(otherCard => {
            const otherAnswer = otherCard.querySelector('.faq-answer');
            const otherIcon = otherCard.querySelector('.faq-chevron, i.bi-chevron-down, button > i:last-child');
            const otherBtn = otherCard.querySelector('button');
            if (otherAnswer) otherAnswer.classList.add('hidden');
            if (otherIcon) otherIcon.classList.remove('rotate-180');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          });

          // If the clicked item was closed, open it now (exclusive single-open)
          if (!isCurrentlyOpen) {
            answer.classList.remove('hidden');
            if (icon) icon.classList.add('rotate-180');
            btn.setAttribute('aria-expanded', 'true');
          }
        });
      });
    });
  },

  // Utility Currency Formatter
  formatCurrency(amount, currency = '$') {
    return currency + Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }
};

window.App = App;
