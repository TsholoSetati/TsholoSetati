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
      <a href="index.html"><i data-lucide="home" class="nav-icon"></i> Home</a>
      <a href="about.html"><i data-lucide="user" class="nav-icon"></i> About</a>
      <a href="experience.html"><i data-lucide="briefcase" class="nav-icon"></i> Experience</a>
      <a href="economics.html"><i data-lucide="bar-chart-3" class="nav-icon"></i> Analysis & Tools</a>
      <a href="demos.html"><i data-lucide="layers" class="nav-icon"></i> Demo's</a>
      <a href="contact.html"><i data-lucide="mail" class="nav-icon"></i> Contact</a>
      <button id="themeToggle" aria-label="Toggle theme" title="Toggle dark mode"><i data-lucide="moon" id="themeIcon"></i></button>
    </nav>
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
    const anchors = document.querySelectorAll('.site-links a');
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
    if (!tBtn) return;

    // Update icon based on theme
    if (themeIcon) {
      themeIcon.setAttribute('data-lucide', saved === 'dark' ? 'sun' : 'moon');
    }

    tBtn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'light';
      const next = cur === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      if (themeIcon) {
        themeIcon.setAttribute('data-lucide', next === 'dark' ? 'sun' : 'moon');
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    inject('site-header', header);
    inject('site-footer', footer);
    activateNav();
    initTheme();

    // Make brand clickable to home
    const brand = document.querySelector('.brand');
    if (brand) {
      brand.addEventListener('click', () => location.href = 'index.html');
    }

    // Initialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });
})();