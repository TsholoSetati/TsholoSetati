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
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="experience.html">Experience</a>
      <a href="projects.html">Projects</a>
      <a href="economics.html">Analysis & Tools</a>
      <a href="demos.html">Demo's</a>
      <a href="contact.html">Contact</a>
      <button id="themeToggle" aria-label="Toggle theme" title="Toggle dark mode">Theme</button>
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
    if (!tBtn) return;

    tBtn.textContent = saved === 'dark' ? '☀️' : '🌙';

    tBtn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'light';
      const next = cur === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      tBtn.textContent = next === 'dark' ? '☀️' : '🌙';
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
  });
})();