/**
 * SUGAR BLISS BAKERY — MAIN JAVASCRIPT
 * Premium Interactive Features & Utilities
 */

'use strict';

// ── ===========================
// THEME MANAGER
// =========================== //
const ThemeManager = {
  // Moon = shown in light mode (click to go dark), Sun = shown in dark mode (click to go light)
  icons: {
    moon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    sun: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
  },
  init() {
    const saved = localStorage.getItem('sugarbliss-theme') || 'light';
    this.apply(saved);
  },
  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sugarbliss-theme', theme);
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.innerHTML = theme === 'dark' ? this.icons.sun : this.icons.moon;
      btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }
  },
  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    this.apply(current === 'dark' ? 'light' : 'dark');
  }
};

// ── ===========================
// RTL MANAGER
// =========================== //
const RTLManager = {
  init() {
    const saved = localStorage.getItem('sugarbliss-dir') || 'ltr';
    this.apply(saved);
  },
  apply(dir) {
    document.documentElement.setAttribute('dir', dir);
    localStorage.setItem('sugarbliss-dir', dir);
    const btn = document.getElementById('rtl-toggle');
    if (btn) btn.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
  },
  toggle() {
    const current = document.documentElement.getAttribute('dir') || 'ltr';
    this.apply(current === 'rtl' ? 'ltr' : 'rtl');
  }
};

// ── ===========================
// NAVBAR
// =========================== //
const Navbar = {
  el: null,
  hamburger: null,
  mobileNav: null,

  init() {
    this.el = document.querySelector('.navbar');
    this.hamburger = document.querySelector('.hamburger');
    this.mobileNav = document.querySelector('.mobile-nav');

    if (!this.el) return;

    this.handleScroll();
    window.addEventListener('scroll', () => this.handleScroll(), { passive: true });

    if (this.hamburger) {
      this.hamburger.addEventListener('click', () => this.toggleMobile());
    }

    // Close mobile nav on link click
    document.querySelectorAll('.mobile-nav-link, .mobile-nav-sub a').forEach(link => {
      link.addEventListener('click', () => this.closeMobile());
    });

    // Mobile dropdowns
    document.querySelectorAll('.mobile-nav-link[data-toggle]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-toggle');
        const sub = document.getElementById(targetId);
        if (sub) {
          sub.classList.toggle('open');
          const icon = link.querySelector('.toggle-icon');
          if (icon) icon.textContent = sub.classList.contains('open') ? '−' : '+';
        }
      });
    });

    // Active link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || href === './' + currentPage) {
        link.classList.add('active');
      }
    });
  },

  handleScroll() {
    if (!this.el) return;
    if (window.scrollY > 50) {
      this.el.classList.add('scrolled');
      this.el.classList.remove('transparent');
    } else {
      if (this.el.classList.contains('is-transparent')) {
        this.el.classList.remove('scrolled');
        this.el.classList.add('transparent');
      }
    }
  },

  toggleMobile() {
    const isOpen = this.mobileNav?.classList.contains('open');
    if (isOpen) {
      this.closeMobile();
    } else {
      this.openMobile();
    }
  },

  openMobile() {
    this.mobileNav?.classList.add('open');
    this.hamburger?.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeMobile() {
    this.mobileNav?.classList.remove('open');
    this.hamburger?.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// ── ===========================
// HERO SLIDER
// =========================== //
const HeroSlider = {
  slides: [],
  dots: [],
  current: 0,
  timer: null,
  interval: 5000,

  init() {
    this.slides = Array.from(document.querySelectorAll('.hero-slide'));
    this.dots = Array.from(document.querySelectorAll('.hero-dot'));
    if (!this.slides.length) return;

    const prevBtn = document.querySelector('.hero-prev');
    const nextBtn = document.querySelector('.hero-next');

    prevBtn?.addEventListener('click', () => this.prev());
    nextBtn?.addEventListener('click', () => this.next());

    this.dots.forEach((dot, i) => {
      dot.addEventListener('click', () => this.goTo(i));
    });

    this.goTo(0);
    this.startAuto();

    // Pause on hover
    const hero = document.querySelector('.hero');
    hero?.addEventListener('mouseenter', () => this.stopAuto());
    hero?.addEventListener('mouseleave', () => this.startAuto());

    // Touch swipe
    let startX = 0;
    hero?.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    hero?.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? this.next() : this.prev();
    });
  },

  goTo(index) {
    this.slides[this.current]?.classList.remove('active');
    this.dots[this.current]?.classList.remove('active');
    this.current = (index + this.slides.length) % this.slides.length;
    this.slides[this.current]?.classList.add('active');
    this.dots[this.current]?.classList.add('active');
  },

  next() { this.goTo(this.current + 1); this.resetAuto(); },
  prev() { this.goTo(this.current - 1); this.resetAuto(); },

  startAuto() {
    this.timer = setInterval(() => this.next(), this.interval);
  },

  stopAuto() {
    clearInterval(this.timer);
  },

  resetAuto() {
    this.stopAuto();
    this.startAuto();
  }
};

// ── ===========================
// SCROLL REVEAL
// =========================== //
const ScrollReveal = {
  observer: null,

  init() {
    const options = {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          this.observer.unobserve(entry.target);
        }
      });
    }, options);

    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children');
    els.forEach(el => this.observer.observe(el));
  }
};

// ── ===========================
// FAQ ACCORDION
// =========================== //
const FAQ = {
  init() {
    document.querySelectorAll('.faq-question').forEach(question => {
      question.addEventListener('click', () => this.toggle(question));
      // Keyboard support (div-based buttons don't fire click on Enter/Space)
      question.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggle(question);
        }
      });
    });
  },

  toggle(question) {
    const item = question.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    // Close all + sync aria
    document.querySelectorAll('.faq-item').forEach(el => {
      el.classList.remove('open');
      el.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
    });

    // Open clicked if it was closed
    if (!isOpen) {
      item.classList.add('open');
      question.setAttribute('aria-expanded', 'true');
    }
  }
};

// ── ===========================
// THEME FILTERS (Gallery)
// =========================== //
const ThemeFilter = {
  init() {
    const container = document.querySelector('.filter-container');
    if (!container) return;

    const buttons = container.querySelectorAll('.filter-btn');
    const items = container.querySelectorAll('.filter-item');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');

        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        items.forEach(item => {
          const cat = item.getAttribute('data-category');
          if (filter === 'all' || cat === filter) {
            item.style.display = '';
            item.style.opacity = '1';
            item.style.transform = 'none';
            item.style.animation = 'none';
            item.offsetHeight; // reflow
            item.style.animation = 'slideInUp 0.4s ease';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }
};

// ── ===========================
// CAKE SIZE SELECTOR
// =========================== //
const SizeSelector = {
  init() {
    const sizeInputs = document.querySelectorAll('.size-option input');
    if (!sizeInputs.length) return;

    sizeInputs.forEach(input => {
      input.addEventListener('change', () => {
        const price = input.closest('.size-option').querySelector('.size-price')?.textContent || '';
        const priceDisplay = document.querySelector('.selected-price');
        if (priceDisplay) {
          priceDisplay.textContent = price;
          priceDisplay.style.animation = 'none';
          priceDisplay.offsetHeight;
          priceDisplay.style.animation = 'bounce 0.4s ease';
        }
      });
    });
  }
};

// ── ===========================
// FORM VALIDATION
// =========================== //
const FormValidation = {
  init() {
    document.querySelectorAll('form[data-validate]').forEach(form => {
      form.addEventListener('submit', (e) => this.handleSubmit(e, form));

      form.querySelectorAll('.form-control[required]').forEach(input => {
        input.addEventListener('blur', () => this.validateField(input));
        input.addEventListener('input', () => this.clearError(input));
      });
    });
  },

  handleSubmit(e, form) {
    e.preventDefault();
    let isValid = true;

    form.querySelectorAll('.form-control[required]').forEach(input => {
      if (!this.validateField(input)) isValid = false;
    });

    // Auth-specific checks (login / signup only — frontend-only, no backend)
    if (isValid && (form.id === 'register-form' || form.id === 'signup-form')) {
      const pw = form.querySelector('input[type="password"]');
      const confirm = form.querySelector('[data-confirm-password]');
      if (confirm && pw && confirm.value !== pw.value) {
        isValid = false;
        confirm.classList.add('error');
        const err = confirm.parentElement?.querySelector('.form-error');
        if (err) { err.textContent = 'Passwords do not match.'; err.classList.add('visible'); }
      }
      const terms = form.querySelector('[data-terms]');
      if (terms && !terms.checked) {
        isValid = false;
        Toast.show('Please agree to the Terms & Conditions and Privacy Policy.', 'error');
      }
    }

    if (isValid) {
      // Standalone auth flows — frontend only
      if (form.id === 'login-form') {
        try { localStorage.setItem('sugarbliss-user', (form.querySelector('input[type="email"]')?.value || '').trim()); } catch (_) {}
        Toast.show('Welcome back! Signing you in…', 'success');
        const btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.textContent = 'Signing In…'; }
        setTimeout(() => { window.location.href = 'index.html'; }, 1100);
        return;
      }
      if (form.id === 'register-form' || form.id === 'signup-form') {
        Toast.show('Account created! Please sign in to continue.', 'success');
        const btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.textContent = 'Creating Account…'; }
        setTimeout(() => { window.location.href = 'login.html'; }, 1200);
        return;
      }
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.innerHTML = '<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px;"><polyline points="20 6 9 17 4 12"/></svg> Sent!';
        btn.style.background = 'linear-gradient(135deg, var(--mint-dark), #5FA890)';
        setTimeout(() => {
          btn.innerHTML = btn.getAttribute('data-original') || 'Submit';
          btn.style.background = '';
          form.reset();
        }, 3000);
      }
      Toast.show('Message sent successfully! We\'ll be in touch soon.', 'success');
    }
  },

  validateField(input) {
    const value = input.value.trim();
    const type = input.type;
    let valid = true;
    let message = 'This field is required.';

    if (!value) {
      valid = false;
    } else if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      valid = false;
      message = 'Please enter a valid email address.';
    } else if (type === 'tel' && !/^[\d\s\+\-\(\)]{7,15}$/.test(value)) {
      valid = false;
      message = 'Please enter a valid phone number.';
    } else if (input.hasAttribute('minlength') && value.length < parseInt(input.getAttribute('minlength'), 10)) {
      valid = false;
      message = `Please enter at least ${input.getAttribute('minlength')} characters.`;
    }

    const errorEl = input.nextElementSibling;
    if (!valid) {
      input.classList.add('error');
      input.classList.remove('success');
      if (errorEl?.classList.contains('form-error')) errorEl.textContent = message;
    } else {
      input.classList.remove('error');
      input.classList.add('success');
    }

    return valid;
  },

  clearError(input) {
    input.classList.remove('error');
  }
};

// ── ===========================
// FOOTER NEWSLETTER (frontend only — reuses Toast)
// =========================== //
const FooterNewsletter = {
  init() {
    document.querySelectorAll('[data-newsletter-form]').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        const value = (input?.value || '').trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          Toast.show('Please enter a valid email address.', 'error');
          input?.focus();
          return;
        }
        Toast.show('Thanks for subscribing! Sweet updates are on the way.', 'success');
        form.reset();
      });
    });
  }
};

// ── ===========================
// TOAST NOTIFICATIONS
// =========================== //
const Toast = {
  container: null,

  init() {
    this.container = document.querySelector('.toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'info', duration = 4000) {
    if (!this.container) this.init();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = {
      success: '<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
      error: '<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
      info: '<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
      warning: '<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
    };
    toast.innerHTML = `<span style="display:inline-flex;align-items:center;">${icons[type] || icons.info}</span><span>${message}</span>`;
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

// ── ===========================
// BACK TO TOP
// =========================== //
const BackToTop = {
  btn: null,

  init() {
    this.btn = document.getElementById('back-to-top');
    if (!this.btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        this.btn.classList.add('visible');
      } else {
        this.btn.classList.remove('visible');
      }
    }, { passive: true });

    this.btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
};

// ── ===========================
// LIGHTBOX
// =========================== //
const Lightbox = {
  el: null,
  img: null,

  init() {
    this.el = document.querySelector('.lightbox');
    if (!this.el) return;
    this.img = this.el.querySelector('.lightbox-img');

    document.querySelectorAll('[data-lightbox]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        // Let inner links/buttons (e.g. View Details) work normally
        if (e.target.closest('a, button')) return;
        const src = trigger.getAttribute('data-lightbox') || trigger.querySelector('img')?.src;
        if (src && this.img) {
          this.img.src = src;
          this.open();
        }
      });
      // Keyboard support for cards (Enter/Space opens, ignored on inner links)
      trigger.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('a, button')) {
          e.preventDefault();
          const src = trigger.getAttribute('data-lightbox') || trigger.querySelector('img')?.src;
          if (src && this.img) {
            this.img.src = src;
            this.open();
          }
        }
      });
    });

    this.el.querySelector('.lightbox-close')?.addEventListener('click', () => this.close());
    this.el.addEventListener('click', (e) => { if (e.target === this.el) this.close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.close(); });
  },

  open() {
    this.el.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  close() {
    this.el.classList.remove('open');
    document.body.style.overflow = '';
  }
};

// ── ===========================
// MARQUEE (pause on hover)
// =========================== //
const Marquee = {
  init() {
    const track = document.querySelector('.marquee-track');
    if (!track) return;
    track.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
    track.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
  }
};

// ── ===========================
// COOKIE BANNER
// =========================== //
const CookieBanner = {
  init() {
    if (localStorage.getItem('sugarbliss-cookies')) return;
    const banner = document.querySelector('.cookie-banner');
    if (!banner) return;
    setTimeout(() => banner.classList.add('show'), 2000);

    banner.querySelector('[data-accept-cookies]')?.addEventListener('click', () => {
      localStorage.setItem('sugarbliss-cookies', '1');
      banner.classList.remove('show');
    });
  }
};

// ── ===========================
// PAGE TRANSITION
// =========================== //
const PageTransition = {
  el: null,

  init() {
    this.el = document.querySelector('.page-transition');

    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('mailto') && !href.startsWith('tel') && !href.startsWith('http') && !link.hasAttribute('target')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.navigate(href);
        });
      }
    });
  },

  navigate(url) {
    if (this.el) {
      this.el.classList.add('animating');
      setTimeout(() => {
        window.location.href = url;
      }, 400);
    } else {
      window.location.href = url;
    }
  }
};

// ── ===========================
// NUMBER COUNTER ANIMATION
// =========================== //
const Counter = {
  init() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  },

  animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    const start = Date.now();

    const update = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  }
};

// ── ===========================
// TESTIMONIAL SLIDER
// =========================== //
const TestimonialSlider = {
  wrapper: null,
  cards: [],
  dots: [],
  dotsWrap: null,
  current: 0,
  timer: null,

  init() {
    this.wrapper = document.querySelector('.testimonial-slider-track');
    if (!this.wrapper) return;
    this.cards = Array.from(this.wrapper.querySelectorAll('.t-card, .testimonial-card'));
    if (!this.cards.length) return;

    document.querySelector('.testimonial-prev')?.addEventListener('click', () => { this.prev(); this.resetAuto(); });
    document.querySelector('.testimonial-next')?.addEventListener('click', () => { this.next(); this.resetAuto(); });

    this.dotsWrap = document.querySelector('.t-dots');
    this.buildDots();
    this.update();

    const zone = this.wrapper.parentElement;
    zone?.addEventListener('mouseenter', () => this.stopAuto());
    zone?.addEventListener('mouseleave', () => this.startAuto());
    this.startAuto();

    window.addEventListener('resize', () => { this.buildDots(); this.update(); });
  },

  gap() {
    const cs = window.getComputedStyle(this.wrapper);
    return parseFloat(cs.columnGap || cs.gap) || 0;
  },

  perView() {
    const w = this.cards[0]?.offsetWidth || 1;
    const viewport = this.wrapper.parentElement?.clientWidth || window.innerWidth;
    return Math.max(1, Math.min(this.cards.length, Math.round(viewport / (w + this.gap()))));
  },

  maxIndex() {
    return Math.max(0, this.cards.length - this.perView());
  },

  goTo(i) {
    const max = this.maxIndex();
    this.current = ((i % (max + 1)) + (max + 1)) % (max + 1);
    this.update();
  },

  next() { this.goTo(this.current + 1); },
  prev() { this.goTo(this.current - 1); },

  update() {
    if (this.current > this.maxIndex()) this.current = this.maxIndex();
    const step = (this.cards[0]?.offsetWidth || 0) + this.gap();
    const rtl = document.documentElement.getAttribute('dir') === 'rtl';
    const x = this.current * step * (rtl ? 1 : -1);
    this.wrapper.style.transform = `translateX(${x}px)`;
    this.dots.forEach((d, i) => {
      d.classList.toggle('active', i === this.current);
      d.setAttribute('aria-selected', String(i === this.current));
    });
  },

  buildDots() {
    if (!this.dotsWrap) return;
    this.dotsWrap.innerHTML = '';
    this.dots = [];
    for (let i = 0; i <= this.maxIndex(); i++) {
      const d = document.createElement('button');
      d.className = 't-dot' + (i === this.current ? ' active' : '');
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', `Go to testimonial page ${i + 1}`);
      d.setAttribute('aria-selected', String(i === this.current));
      d.addEventListener('click', () => { this.goTo(i); this.resetAuto(); });
      this.dotsWrap.appendChild(d);
      this.dots.push(d);
    }
  },

  startAuto() {
    this.stopAuto();
    if (this.maxIndex() === 0) return;
    this.timer = setInterval(() => this.next(), 5000);
  },

  stopAuto() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  },

  resetAuto() { this.startAuto(); }
};

// ── ===========================
// FLAVOR TABS
// =========================== //
const FlavorTabs = {
  init() {
    const tabs = document.querySelectorAll('.flavor-tab');
    const panes = document.querySelectorAll('.flavor-pane');
    if (!tabs.length) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-flavor');
        tabs.forEach(t => t.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.querySelector(`.flavor-pane[data-flavor="${target}"]`)?.classList.add('active');
      });
    });
  }
};

// ── ===========================
// IMAGE LAZY LOAD
// =========================== //
const LazyLoad = {
  init() {
    const images = document.querySelectorAll('img[data-src]');
    if (!images.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => observer.observe(img));
  }
};

// ── ===========================
// PROFILE DROPDOWN (navbar account menu — click-controlled)
// =========================== //
const ProfileDropdown = {
  btn: null,
  menu: null,

  init() {
    this.btn = document.getElementById('profile-btn');
    this.menu = document.getElementById('profile-menu');
    if (!this.btn || !this.menu) return;

    this.btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    this.btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'ArrowDown' && !this.isOpen()) {
        e.preventDefault();
        this.open();
      } else if (e.key === 'Escape') {
        this.close();
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.isOpen() && !e.target.closest('.profile-wrap')) this.close();
    });

    // Close on Escape anywhere + on item select
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) { this.close(); this.btn.focus(); }
    });

    this.menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => this.close());
    });

    // Keep menu inside viewport on small screens
    window.addEventListener('resize', () => { if (this.isOpen()) this.close(); });
  },

  isOpen() { return this.menu?.classList.contains('open'); },

  open() {
    this.menu?.classList.add('open');
    this.btn?.setAttribute('aria-expanded', 'true');
  },

  close() {
    this.menu?.classList.remove('open');
    this.btn?.setAttribute('aria-expanded', 'false');
  },

  toggle() { this.isOpen() ? this.close() : this.open(); }
};

// ── ===========================
// AUTH PASSWORD TOGGLES (login / signup — vector eye icons)
// =========================== //
const AuthToggles = {
  eye: '<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff: '<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',

  init() {
    document.querySelectorAll('[data-pw-toggle]').forEach(btn => {
      const target = document.getElementById(btn.getAttribute('data-pw-toggle'));
      if (!target) return;
      btn.addEventListener('click', () => {
        const show = target.type === 'password';
        target.type = show ? 'text' : 'password';
        btn.setAttribute('aria-pressed', String(show));
        btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        btn.innerHTML = show ? this.eyeOff : this.eye;
      });
    });

    // Forgot-password (frontend only — no recovery flow exists in this project)
    document.getElementById('forgot-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      Toast.show('Password reset is not available in this demo. Please contact us for help.', 'info');
    });

    // Social auth (frontend UI only — no OAuth in this project)
    document.querySelectorAll('[data-social]').forEach(btn => {
      btn.addEventListener('click', () => {
        Toast.show(`${btn.getAttribute('data-social')} sign-in is not connected in this demo.`, 'info');
      });
    });
  }
};

// ── ===========================
// INIT ALL
// =========================== //
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  RTLManager.init();
  Navbar.init();
  ProfileDropdown.init();
  AuthToggles.init();
  HeroSlider.init();
  ScrollReveal.init();
  FAQ.init();
  ThemeFilter.init();
  SizeSelector.init();
  FormValidation.init();
  FooterNewsletter.init();
  Toast.init();
  BackToTop.init();
  Lightbox.init();
  Marquee.init();
  CookieBanner.init();
  Counter.init();
  TestimonialSlider.init();
  FlavorTabs.init();
  LazyLoad.init();

  // Theme toggle button
  document.getElementById('theme-toggle')?.addEventListener('click', () => ThemeManager.toggle());

  // RTL toggle button
  document.getElementById('rtl-toggle')?.addEventListener('click', () => RTLManager.toggle());

  // Remove page transition animation when loaded
  const transition = document.querySelector('.page-transition');
  if (transition) {
    transition.classList.remove('animating');
  }

  // Init page transition (defer to avoid conflicts)
  // PageTransition.init(); // Enable if you want cross-page transitions

  console.log('Sugar Bliss Bakery — Loaded & Ready!');
});
