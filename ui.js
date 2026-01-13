// Simple UI glue for header/footer, theme, and mobile nav
(function () {
  const header = `
  <div class="site-nav">
    <div class="brand">
      <div class="logo">TS</div>
      <div class="brand-text">
        <div class="name">Tsholofelo K. Setati</div>
        <div class="tag">Innovation Economics · AI & Digital</div>
      </div>
    </div>
      <nav class="site-links" aria-label="Main navigation">
      <a href="index.html"><i class="ph ph-house icon-inline"></i> Home</a>
      <a href="about.html"><i class="ph ph-user icon-inline"></i> About</a>
      <a href="experience.html"><i class="ph ph-briefcase icon-inline"></i> Experience</a>
      <a href="demos.html"><i class="ph ph-layers icon-inline"></i> Demo's</a>
      <a href="contact.html"><i class="ph ph-envelope icon-inline"></i> Contact</a>
    </nav>
    <button class="hamburger-btn" id="hamburgerBtn" aria-expanded="false" aria-label="Toggle navigation menu" aria-controls="navDrawer">
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
  </div>
  <div id="navDrawer" class="nav-drawer" role="navigation" aria-hidden="true" aria-label="Mobile navigation">
    <div class="nav-drawer-overlay"></div>
    <div class="nav-drawer-content">
      <nav class="nav-drawer-links">
        <a href="index.html"><i class="ph ph-house icon-inline"></i> Home</a>
        <a href="about.html"><i class="ph ph-user icon-inline"></i> About</a>
        <a href="experience.html"><i class="ph ph-briefcase icon-inline"></i> Experience</a>
        <a href="demos.html"><i class="ph ph-layers icon-inline"></i> Demo's</a>
        <a href="contact.html"><i class="ph ph-envelope icon-inline"></i> Contact</a>
      </nav>
    </div>
  </div>`;

  const footer = `
  <div class="footer-inner">
    <p>© ${new Date().getFullYear()} Tsholofelo K. Setati. All rights reserved.</p>
    <p class="muted">Crafted with care — static, privacy-first, and accessible.</p>
  </div>`;

  function inject(id, html) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = html;
  }

  function activateNav() {
    const anchors = document.querySelectorAll('.site-links a, .nav-drawer-links a');
    const path = location.pathname.split('/').pop() || 'index.html';
    anchors.forEach(a => {
      const href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      } else {
        a.classList.remove('active');
        a.removeAttribute('aria-current');
      }
    });
  }

  function initTheme() {
    // Force dark-only theme (no toggles)
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  function initMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navDrawer = document.getElementById('navDrawer');
    const navDrawerOverlay = document.querySelector('.nav-drawer-overlay');
    const navDrawerLinks = document.querySelectorAll('.nav-drawer-links a');

    if (!hamburgerBtn || !navDrawer) return;

    const openDrawer = () => {
      navDrawer.setAttribute('aria-hidden', 'false');
      hamburgerBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
      navDrawer.setAttribute('aria-hidden', 'true');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    // Toggle drawer on hamburger click
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = hamburgerBtn.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    // Close drawer on overlay click
    navDrawerOverlay?.addEventListener('click', closeDrawer);

    // Close drawer on nav link click
    navDrawerLinks.forEach(link => {
      link.addEventListener('click', closeDrawer);
    });

    // Close drawer on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeDrawer();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    inject('site-header', header);
    inject('site-footer', footer);
    activateNav();
    initTheme();
    initMobileMenu();
    initScrollAnimations();

    // Make brand clickable to home
    const brand = document.querySelector('.brand');
    if (brand) {
      brand.addEventListener('click', () => location.href = 'index.html');
    }

    // Initialize Phosphor icons
    if (window.phosphor) {
      window.phosphor.renderSVG();
    }
  });

  // Scroll Animation Handler
  function initScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all elements with animation classes
    const animatedElements = document.querySelectorAll(
      '[data-animate], .feature, .card, .section, h2, h3, section > p:not(.section-subtitle)'
    );

    animatedElements.forEach((el, index) => {
      // Add stagger delay if not already set
      if (!el.style.animationDelay && el.classList.length === 0) {
        el.classList.add('animate-fade-in-up');
        if (index < 5) {
          el.classList.add(`stagger-${index + 1}`);
        }
      }
      observer.observe(el);
    });

    // Add CSS for in-view state
    const style = document.createElement('style');
    style.textContent = `
      .animate-fade-in-up.in-view,
      .animate-slide-in-right.in-view,
      .animate-scale-in.in-view,
      .animate-slide-up.in-view,
      .animate-rotate-in.in-view {
        animation-play-state: running !important;
        opacity: 1 !important;
      }

      .feature, .card {
        opacity: 0;
        animation: fadeInUp 0.6s ease-out forwards;
      }

      .feature.in-view, .card.in-view {
        opacity: 1;
      }

      section > h2, section > h3 {
        opacity: 0;
        animation: slideInRight 0.6s ease-out forwards;
      }

      section > h2.in-view, section > h3.in-view {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }
})();