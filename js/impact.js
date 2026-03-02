import { fetchLatest } from './db.js';
import { animateCounter, showToast } from './nav.js';

async function loadImpact() {
    const loading = document.getElementById('impLoading');
    const noData = document.getElementById('impNoData');
    const content = document.getElementById('impContent');

    try {
        const latest = await fetchLatest();
        if (loading) loading.style.display = 'none';

        if (!latest) {
            if (noData) noData.classList.remove('hidden');
            return;
        }

        // Hide no data state and show content
        if (noData) {
            noData.classList.add('hidden');
            noData.style.display = 'none';
        }
        if (content) {
            content.classList.remove('hidden');
            content.style.display = 'block';
        }

        renderHero(latest);
        renderEquivalents(latest);
        renderAnnual(latest);

    } catch (err) {
        console.error(err);
        if (loading) loading.style.display = 'none';
        if (noData) noData.classList.remove('hidden');
        showToast('Failed to load impact data', 'error');
    }
}

function renderHero(d) {
    const hero = document.getElementById('impHero');
    if (!hero) return;
    const total = parseFloat(d.total_co2) || 0;
    const perPerson = parseFloat(d.per_person_co2) || 0;
    const indiaAvg = 100;
    const vsIndia = ((perPerson - indiaAvg) / indiaAvg * 100).toFixed(1);
    const better = perPerson < indiaAvg;

    hero.innerHTML = `
    <div class="imp-hero-inner">
      <div class="ih-main">
        <p style="color:var(--clr-text-muted);margin-bottom:8px;">Total Monthly Carbon Footprint</p>
        <div class="ih-total"><span id="impTotal">0</span> <span class="ih-unit">kg CO₂</span></div>
        <p style="margin-top:12px;color:var(--clr-text-secondary);">
          Per person: <strong style="color:var(--clr-primary)">${perPerson} kg</strong> —
          <span style="color:${better ? 'var(--clr-primary)' : 'var(--clr-danger)'}">
            ${better ? '▼' : '▲'} ${Math.abs(vsIndia)}% ${better ? 'below' : 'above'} India average
          </span>
        </p>
      </div>
      <div class="ih-city">
        <div class="ih-city-label">📍 ${d.city || 'Your City'}</div>
        <div class="ih-house">${d.house_type || 'Household'} · ${d.people || 1} people</div>
      </div>
    </div>
  `;

    setTimeout(() => {
        const el = document.getElementById('impTotal');
        if (el) animateCounter(el, total, 1500, 1);
    }, 200);
}

function renderEquivalents(d) {
    const total = parseFloat(d.total_co2) || 0;
    const equiv = [
        { icon: '🌳', title: 'Trees Needed', val: Math.ceil(total / 21.77), unit: 'trees/month', desc: 'to absorb your monthly CO₂' },
        { icon: '✈️', title: 'Flight Distance', val: Math.round(total / 0.255), unit: 'km of flying', desc: 'equivalent air travel' },
        { icon: '🚗', title: 'Petrol Car Drive', val: Math.round(total / 0.192), unit: 'km driven', desc: 'equivalent petrol car distance' },
        { icon: '💡', title: 'Bulb Hours', val: Math.round(total * 1000 / 0.01), unit: 'hours', desc: 'of a 10W LED bulb powered' },
        { icon: '🍔', title: 'Beef Meals', val: Math.round(total / 6.6), unit: 'burgers', desc: 'equivalent beef meal emissions' },
        { icon: '♻️', title: 'Plastic Bottles', val: Math.round(total / 0.083), unit: 'bottles', desc: 'equivalent plastic produced' },
    ];

    const grid = document.getElementById('equivGrid');
    if (!grid) return;
    grid.innerHTML = equiv.map((e, i) => `
    <div class="eq-card glass-card" style="animation-delay:${i * 0.1}s">
      <div class="eq-icon">${e.icon}</div>
      <div class="eq-val" id="eqVal${i}">0</div>
      <div class="eq-unit">${e.unit}</div>
      <div class="eq-title">${e.title}</div>
      <p class="eq-desc">${e.desc}</p>
    </div>
  `).join('');

    // Animate counters
    setTimeout(() => {
        equiv.forEach((e, i) => {
            const el = document.getElementById(`eqVal${i}`);
            if (el) animateCounter(el, e.val, 1200 + i * 100, 0);
        });
    }, 300);
}

function renderAnnual(d) {
    const card = document.getElementById('annualCard');
    if (!card) return;
    const monthly = parseFloat(d.total_co2) || 0;
    const annual = monthly * 12;
    const treesAnnual = Math.ceil(annual / 21.77);

    card.innerHTML = `
    <div class="annual-inner">
      <div class="section-label" style="margin-bottom:16px;">📅 Annual Projection</div>
      <div class="annual-grid">
        <div class="an-item">
          <div class="an-icon">🌿</div>
          <div class="an-val">${annual.toFixed(0)}</div>
          <div class="an-label">kg CO₂/year</div>
        </div>
        <div class="an-item">
          <div class="an-icon">🌳</div>
          <div class="an-val">${treesAnnual}</div>
          <div class="an-label">trees needed/year</div>
        </div>
        <div class="an-item">
          <div class="an-icon">⚡</div>
          <div class="an-val">${((parseFloat(d.energy_kwh) || 0) * 12).toFixed(0)}</div>
          <div class="an-label">kWh/year energy</div>
        </div>
        <div class="an-item">
          <div class="an-icon">💰</div>
          <div class="an-val">₹${Math.round((parseFloat(d.electricity_units) || 0) * 12 * 8).toLocaleString()}</div>
          <div class="an-label">est. electricity cost/year</div>
        </div>
      </div>
    </div>
  `;
}

window.takePledge = function () {
    const btn = document.getElementById('pledgeBtn');
    const msg = document.getElementById('pledgeMsg');
    if (!btn || !msg) return;
    btn.disabled = true;
    btn.textContent = '✅ Pledge Saved!';
    btn.style.opacity = '0.6';
    msg.classList.remove('hidden');
    localStorage.setItem('ct_pledge', new Date().toISOString());
    showToast('Pledge saved! Check AI tips for your next steps.', 'success');
};

document.addEventListener('DOMContentLoaded', () => {
    loadImpact();
    // Check pledge status
    if (localStorage.getItem('ct_pledge')) {
        const btn = document.getElementById('pledgeBtn');
        const msg = document.getElementById('pledgeMsg');
        if (btn) { btn.disabled = true; btn.textContent = '✅ Pledge Saved!'; btn.style.opacity = '0.6'; }
        if (msg) msg.classList.remove('hidden');
    }
});
