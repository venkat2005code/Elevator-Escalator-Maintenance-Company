/* ============================================================
   MAIN.JS — Interactive Elements and Dashboard Logic
   ============================================================ */

(function () {
  'use strict';

  // ── Set active nav link based on current URL ──
  function setNavActive() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    
    // Desktop and mobile links
    document.querySelectorAll(`.nav-link[href="${page}"], .dropdown-item[href="${page}"], .mobile-nav-link[href="${page}"], .mobile-sub-link[href="${page}"]`).forEach(link => {
      link.classList.add('active');
    });

    // Parent nav items (dropdowns)
    document.querySelectorAll('.nav-item').forEach(item => {
      const dropdownLinks = Array.from(item.querySelectorAll('.dropdown-item')).map(a => a.getAttribute('href'));
      if (dropdownLinks.includes(page)) {
        const navLink = item.querySelector('.nav-link');
        if (navLink) navLink.classList.add('active');
      }
    });
  }

  // ── Animated Counters ──
  function animateCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseFloat(el.getAttribute('data-count'));
      const suffix = el.getAttribute('data-suffix') || '';
      const prefix = el.getAttribute('data-prefix') || '';
      const decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals')) : 0;
      const duration = 2000;
      const startTime = performance.now();

      function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = prefix + value.toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    });
  }

  // ── SVG Bar Chart Renderer ──
  function renderBarChart() {
    const canvas = document.getElementById('uptime-chart');
    if (!canvas || canvas.dataset.rendered) return;
    canvas.dataset.rendered = 'true';

    const data = [
      { month: 'Apr', value: 98.2 },
      { month: 'May', value: 99.1 },
      { month: 'Jun', value: 97.8 },
      { month: 'Jul', value: 99.4 },
      { month: 'Aug', value: 98.9 },
      { month: 'Sep', value: 99.7 },
    ];

    const W = canvas.clientWidth || 500;
    const H = 200;
    const barW = (W / data.length) * 0.5;
    const maxVal = 100;
    const minVal = 96;
    const chartH = H - 40;

    let svgContent = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;overflow:visible">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#C9943A"/>
          <stop offset="100%" stop-color="#E5B96A" stop-opacity="0.4"/>
        </linearGradient>
        <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#E5B96A"/>
          <stop offset="100%" stop-color="#C9943A"/>
        </linearGradient>
      </defs>`;

    // Grid lines
    for (let i = 0; i <= 4; i++) {
      const y = (chartH / 4) * i;
      const val = (100 - (i / 4) * (maxVal - minVal)).toFixed(1);
      svgContent += `
        <line x1="40" y1="${y + 10}" x2="${W}" y2="${y + 10}" stroke="rgba(201,148,58,0.08)" stroke-width="1" stroke-dasharray="4,4"/>
        <text x="36" y="${y + 14}" text-anchor="end" font-size="9" fill="rgba(168,178,193,0.6)" font-family="Inter">${val}%</text>`;
    }

    data.forEach((d, i) => {
      const x = 40 + (i / data.length) * (W - 60) + ((W - 60) / data.length - barW) / 2;
      const normalized = (d.value - minVal) / (maxVal - minVal);
      const barH = normalized * chartH;
      const y = chartH - barH + 10;

      svgContent += `
        <rect class="bar-chart-bar" x="${x}" y="${y}" width="${barW}" height="${barH}" rx="4"
              fill="url(#barGrad)" stroke="rgba(201,148,58,0.3)" stroke-width="1">
          <title>${d.month}: ${d.value}%</title>
        </rect>
        <text x="${x + barW / 2}" y="${H - 5}" text-anchor="middle" font-size="10" fill="rgba(168,178,193,0.8)" font-family="Inter">${d.month}</text>
        <text x="${x + barW / 2}" y="${y - 4}" text-anchor="middle" font-size="9" fill="#C9943A" font-family="Inter" font-weight="600">${d.value}%</text>`;
    });

    svgContent += `</svg>`;
    canvas.innerHTML = svgContent;
  }

  // ── Dashboard sidebar navigation ──
  function bindDashboardNav() {
    document.querySelectorAll('.sidebar-link[data-dash-panel]').forEach(link => {
      link.addEventListener('click', () => {
        const panelId = link.getAttribute('data-dash-panel');
        
        // Update sidebar active
        document.querySelectorAll(`.sidebar-link[data-dash-panel]`).forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Show panel
        document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
        const panel = document.getElementById(panelId);
        if (panel) panel.classList.add('active');

        // Render chart if necessary
        if (panelId === 'dpanel-overview' || panelId === 'admin-overview') {
            setTimeout(() => renderBarChart(), 200);
        }
      });
    });
  }

  // ── Calendar (schedule) logic ──
  function initCalendar() {
    let currentDate = new Date(2026, 8, 1); // Sep 2026

    const events = {
      '2026-09-10': [{ type: 'maintenance', label: 'Routine Check' }],
      '2026-09-15': [{ type: 'inspection', label: 'Annual Inspection' }],
      '2026-09-18': [{ type: 'maintenance', label: 'Lubrication' }],
      '2026-09-22': [{ type: 'emergency', label: 'Emergency Call' }],
      '2026-09-28': [{ type: 'inspection', label: 'Compliance Audit' }],
      '2026-10-05': [{ type: 'maintenance', label: 'Belt Replacement' }],
      '2026-10-12': [{ type: 'maintenance', label: 'Safety Test' }],
    };

    function renderCalendar() {
      const grid = document.getElementById('calendar-grid');
      const monthLabel = document.getElementById('cal-month-label');
      if (!grid) return;

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      const months = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];
      if (monthLabel) monthLabel.textContent = `${months[month]} ${year}`;

      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const prevDays = new Date(year, month, 0).getDate();
      const today = new Date();

      let html = '';

      // Previous month padding
      for (let i = firstDay - 1; i >= 0; i--) {
        html += `<div class="cal-day other-month"><div class="cal-day-num">${prevDays - i}</div></div>`;
      }

      // Current month
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
        const dayEvents = events[dateStr] || [];

        let eventsHtml = dayEvents.map(ev =>
          `<div class="cal-event ${ev.type}">${ev.label}</div>`
        ).join('');

        html += `<div class="cal-day${isToday ? ' today' : ''}">
          <div class="cal-day-num">${d}</div>
          ${eventsHtml}
        </div>`;
      }

      // Next month padding
      const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
      for (let i = 1; i <= totalCells - firstDay - daysInMonth; i++) {
        html += `<div class="cal-day other-month"><div class="cal-day-num">${i}</div></div>`;
      }

      grid.innerHTML = html;
    }

    document.getElementById('cal-prev')?.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    });

    document.getElementById('cal-next')?.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
    });

    renderCalendar();
  }

  // ── Ticket Filter ──
  function initTicketFilter() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        document.querySelectorAll('.ticket-row').forEach(row => {
          const status = row.getAttribute('data-status');
          row.style.display = (filter === 'all' || status === filter) ? '' : 'none';
        });
      });
    });
  }

  // ── Uptime counter on home ──
  function initUptimeRing() {
    const circle = document.getElementById('uptime-ring-fill');
    if (!circle) return;
    const r = 80;
    const circ = 2 * Math.PI * r;
    circle.style.strokeDasharray = circ;
    circle.style.strokeDashoffset = circ;
    setTimeout(() => {
      const pct = 99.7 / 100;
      circle.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.16, 1, 0.3, 1)';
      circle.style.strokeDashoffset = circ * (1 - pct);
    }, 600);
  }

  // ── ROI Calculator ──
  function initROICalculator() {
    const unitsSlider = document.getElementById('calc-units');
    const costSlider = document.getElementById('calc-cost');
    const downtimeSlider = document.getElementById('calc-downtime');
    const valUnits = document.getElementById('val-units');
    const valCost = document.getElementById('val-cost');
    const valDowntime = document.getElementById('val-downtime');
    const savingsOutput = document.getElementById('roi-savings');

    if (!unitsSlider) return;

    function formatCurrency(val) {
      return '$' + val.toLocaleString('en-US');
    }

    function calculateROI() {
      const u = parseInt(unitsSlider.value) || 0;
      const c = parseInt(costSlider.value) || 0;
      const d = parseInt(downtimeSlider.value) || 0;
      
      valUnits.textContent = u;
      valCost.textContent = formatCurrency(c);
      valDowntime.textContent = d;

      // VertEx IoT reduces downtime by 78% (0.78)
      const totalSavings = u * c * d * 0.78;
      savingsOutput.textContent = formatCurrency(Math.round(totalSavings));
    }

    unitsSlider.addEventListener('input', calculateROI);
    costSlider.addEventListener('input', calculateROI);
    downtimeSlider.addEventListener('input', calculateROI);

    calculateROI();
  }

  // ── Init ──
  document.addEventListener('DOMContentLoaded', () => {
    setNavActive();
    bindDashboardNav();
    initROICalculator();
    setTimeout(initCalendar, 100);
    setTimeout(initTicketFilter, 100);
    setTimeout(() => renderBarChart(), 200);
  });

  // ── After load ──
  window.addEventListener('load', () => {
    initUptimeRing();
    animateCounters();
  });

})();
