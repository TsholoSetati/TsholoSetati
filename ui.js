// Simple UI glue for header/footer, theme, and mobile nav
(function(){
  const header = `
  <div class="site-nav">
    <div class="brand">
      <div class="logo">TS</div>
      <div class="brand-text">
        <div class="name">Tsholofelo K. Setati</div>
        <div class="tag muted">Innovation Economics · AI & Digital Transformation</div>
      </div>
    </div>
    <nav class="site-links">
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="experience.html">Experience</a>
      <a href="projects.html">Projects</a>
      <a href="tools.html">Tools</a>
      <a href="contact.html">Contact</a>
      <button id="themeToggle" aria-label="Toggle theme" class="btn-ghost">Theme</button>
    </nav>
  </div>`;

  const footer = `
  <div class="footer-inner">
    <p>© ${new Date().getFullYear()} Tsholofelo K. Setati</p>
    <p class="muted">Built with care — static, privacy-friendly, and accessible.</p>
  </div>`;

  function inject(id, html){
    const el = document.getElementById(id);
    if(!el) return;
    el.innerHTML = html;
  }

  function activateNav(){
    const anchors = document.querySelectorAll('.site-links a');
    const path = location.pathname.split('/').pop() || 'index.html';
    anchors.forEach(a=>{
      const href = a.getAttribute('href');
      if(href===path){
        a.classList.add('active');
        a.setAttribute('aria-current','page');
      }
    });
  }

  function initTheme(){
    const saved = localStorage.getItem('theme');
    if(saved) document.documentElement.setAttribute('data-theme', saved);

    const tBtn = document.getElementById('themeToggle');
    if(!tBtn) return;
    tBtn.addEventListener('click', ()=>{
      const cur = document.documentElement.getAttribute('data-theme') || 'light';
      const next = cur==='light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    inject('site-header', header);
    inject('site-footer', footer);
    activateNav();
    initTheme();

    // Make header sticky small-screen menu
    const brand = document.querySelector('.brand');
    if(brand){
      brand.addEventListener('click', ()=> location.href='index.html');
    }
  });
})();