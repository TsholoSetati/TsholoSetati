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
      <a href="economics.html"><i class="ph ph-chart-line icon-inline"></i> Analysis & Tools</a>
      <a href="demos.html"><i class="ph ph-layers icon-inline"></i> Demo's</a>
      <a href="contact.html"><i class="ph ph-envelope icon-inline"></i> Contact</a>
      <button id="themeToggle" aria-label="Toggle theme" title="Toggle dark mode"><i class="ph ph-moon icon-inline" id="themeIcon"></i></button>
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
        <a href="economics.html"><i class="ph ph-chart-line icon-inline"></i> Analysis & Tools</a>
        <a href="demos.html"><i class="ph ph-layers icon-inline"></i> Demo's</a>
        <a href="contact.html"><i class="ph ph-envelope icon-inline"></i> Contact</a>
      </nav>
      <div class="nav-drawer-theme">
        <button id="drawerThemeToggle" class="btn btn-ghost" aria-label="Toggle theme">
          <i class="ph ph-moon icon-button" id="drawerThemeIcon"></i>
          <span>Theme</span>
        </button>
      </div>
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
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);

    const tBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const drawerThemeBtn = document.getElementById('drawerThemeToggle');
    const drawerThemeIcon = document.getElementById('drawerThemeIcon');
    
    if (!tBtn) return;

    // Update icon based on theme
    const updateThemeIcons = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (themeIcon) {
        themeIcon.setAttribute('class', isDark ? 'ph ph-sun icon-inline' : 'ph ph-moon icon-inline');
      }
      if (drawerThemeIcon) {
        drawerThemeIcon.setAttribute('class', isDark ? 'ph ph-sun icon-button' : 'ph ph-moon icon-button');
      }
    };

    updateThemeIcons();

    const handleThemeToggle = () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'light';
      const next = cur === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateThemeIcons();
    };

    tBtn.addEventListener('click', handleThemeToggle);
    if (drawerThemeBtn) {
      drawerThemeBtn.addEventListener('click', handleThemeToggle);
    }
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
})();