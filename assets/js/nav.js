/* ============================================================
   NAV.JS — Navigation, Dropdowns, Theme, RTL/LTR
   ============================================================ */

(function () {
  'use strict';

  // ── State ──
  let isDark = true;
  let isRTL = false;

  // ── DOM Refs ──
  const header       = document.getElementById('main-header');
  const themeToggle  = document.getElementById('theme-toggle');
  const dirToggle    = document.getElementById('dir-toggle');
  const dirLabel     = document.getElementById('dir-label');
  const hamburger    = document.getElementById('hamburger');
  const mobileMenu   = document.getElementById('mobile-menu');
  const htmlEl       = document.documentElement;

  // ── Scroll Handling (header shadow) ──
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // ── Theme Toggle ──
  function applyTheme(dark) {
    isDark = dark;
    htmlEl.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('vertx-theme', dark ? 'dark' : 'light');
  }

  themeToggle?.addEventListener('click', () => applyTheme(!isDark));

  // Load saved theme
  const savedTheme = localStorage.getItem('vertx-theme');
  if (savedTheme === 'light') applyTheme(false);
  else applyTheme(true);

  // ── RTL / LTR Toggle ──
  function applyDir(rtl) {
    isRTL = rtl;
    htmlEl.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    if (dirLabel) dirLabel.textContent = rtl ? 'RTL' : 'LTR';
    localStorage.setItem('vertx-dir', rtl ? 'rtl' : 'ltr');
  }

  dirToggle?.addEventListener('click', () => applyDir(!isRTL));

  // Load saved direction
  const savedDir = localStorage.getItem('vertx-dir');
  applyDir(savedDir === 'rtl');

  // ── Mobile Hamburger ──
  hamburger?.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu?.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu on resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      hamburger?.classList.remove('open');
      mobileMenu?.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // ── Mobile Submenu Toggle ──
  document.querySelectorAll('.mobile-nav-link[data-submenu]').forEach(link => {
    link.addEventListener('click', () => {
      const submenuId = link.getAttribute('data-submenu');
      const submenu = document.getElementById(submenuId);
      if (!submenu) return;
      const isOpen = submenu.classList.toggle('open');
      link.querySelector('.mobile-caret')?.style && (
        link.querySelector('.mobile-caret').style.transform = isOpen ? 'rotate(180deg)' : ''
      );
    });
  });

  // Close mobile nav link
  document.querySelectorAll('.mobile-sub-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      mobileMenu?.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ── Dropdown hover for desktop — handled in CSS via :hover ──
  // Click fallback for touch devices
  document.querySelectorAll('.nav-item[data-dropdown]').forEach(item => {
    let timeout;
    item.addEventListener('mouseenter', () => {
      clearTimeout(timeout);
      item.classList.add('open');
    });
    item.addEventListener('mouseleave', () => {
      timeout = setTimeout(() => item.classList.remove('open'), 150);
    });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', e => {
    document.querySelectorAll('.nav-item.open').forEach(item => {
      if (!item.contains(e.target)) item.classList.remove('open');
    });
  });

  // Expose theme/dir helpers globally
  window.vertxNav = { applyTheme, applyDir };

})();
