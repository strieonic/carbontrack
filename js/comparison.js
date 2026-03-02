import { fetchLastTwo } from './db.js';
import { getChange, getCarbonRating } from './carbon.js';
import { formatDate, showToast } from './nav.js';

const CATEGORIES = [
    { key_co2: 'electricity_co2', label: '⚡ Electricity', color: '#38bdf8' },
    { key_co2: 'transport_co2', label: '🚗 Transport', color: '#f59e0b' },
    { key_co2: 'cooking_co2', label: '🍳 Cooking', color: '#f97316' },
    { key_co2: 'appliance_co2', label: '📱 Appliances', color: '#a78bfa' },
    { key_co2: 'waste_co2', label: '🗑️ Waste', color: '#48c78e' },
];

async function loadComparison() {
    const loading = document.getElementById('cmpLoading');
    const noData = document.getElementById('cmpNoData');
    const content = document.getElementById('cmpContent');

    try {
        const { current, previous } = await fetchLastTwo();

        if (loading) loading.style.display = 'none';

        if (!current || !previous) {
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

        renderBanner(current, previous);
        renderKPIColumns(current, previous);
        renderCategoryRows(current, previous);
        renderChart(current, previous);

    } catch (err) {
        console.error(err);
        if (loading) loading.style.display = 'none';
        if (noData) noData.classList.remove('hidden');
        showToast('Failed to load comparison data', 'error');
    }
}

function renderBanner(current, previous) {
    const banner = document.getElementById('cmpBanner');
    if (!banner) return;
    const chg = getChange(current.total_co2, previous.total_co2);
    if (!chg) return;
    const improved = chg.improved;
    banner.innerHTML = `
    <div class="banner-inner" style="background: ${improved ? 'rgba(72,199,142,0.08)' : 'rgba(239,68,68,0.08)'}">
      <span class="banner-emoji">${improved ? '📉' : '📈'}</span>
      <div>
        <h2 style="color:${improved ? 'var(--clr-primary)' : 'var(--clr-danger)'}">
          ${improved ? 'Great Progress!' : 'Emissions Increased'}
        </h2>
        <p>Your carbon footprint <strong>${improved ? 'decreased' : 'increased'}</strong> by 
          <strong style="color:${improved ? 'var(--clr-primary)' : 'var(--clr-danger)'}">
            ${Math.abs(chg.pct)}%
          </strong> 
          (${Math.abs(chg.diff).toFixed(1)} kg CO₂) compared to last assessment.</p>
      </div>
      <div class="pct-display" style="color:${improved ? 'var(--clr-primary)' : 'var(--clr-danger)'}">
        ${improved ? '▼' : '▲'} ${Math.abs(chg.pct)}%
      </div>
    </div>
  `;
}

function renderKPIColumns(current, previous) {
    const kpis = [
        { label: '🌿 Total CO₂', curr: current.total_co2, prev: previous.total_co2, unit: 'kg', dec: 1 },
        { label: '⚡ Energy', curr: current.energy_kwh, prev: previous.energy_kwh, unit: 'kWh', dec: 0 },
        { label: '👤 Per Person', curr: current.per_person_co2, prev: previous.per_person_co2, unit: 'kg', dec: 1 },
        { label: '🌳 Trees Needed', curr: current.trees_needed, prev: previous.trees_needed, unit: '', dec: 0 },
    ];

    const prevKPIs = document.getElementById('prevKPIs');
    const currKPIs = document.getElementById('currKPIs');
    const prevDate = document.getElementById('prevDate');
    const currDate = document.getElementById('currDate');

    if (prevDate && previous.created_at) prevDate.textContent = formatDate(previous.created_at);
    if (currDate && current.created_at) currDate.textContent = formatDate(current.created_at);

    const buildKPI = (arr, vals) => {
        arr.innerHTML = vals.map(kpi => `
      <div class="col-kpi-item">
        <div class="ck-label">${kpi.label}</div>
        <div class="ck-val">${parseFloat(kpi[vals === arr ? 'prev' : 'curr'] || 0).toFixed(kpi.dec)} <span class="ck-unit">${kpi.unit}</span></div>
      </div>
    `).join('');
    };

    if (prevKPIs) prevKPIs.innerHTML = kpis.map(kpi => `
    <div class="col-kpi-item">
      <div class="ck-label">${kpi.label}</div>
      <div class="ck-val">${parseFloat(kpi.prev || 0).toFixed(kpi.dec)} <span class="ck-unit">${kpi.unit}</span></div>
    </div>
  `).join('');

    if (currKPIs) currKPIs.innerHTML = kpis.map(kpi => {
        const chg = getChange(kpi.curr, kpi.prev);
        return `
    <div class="col-kpi-item">
      <div class="ck-label">${kpi.label}</div>
      <div class="ck-val">${parseFloat(kpi.curr || 0).toFixed(kpi.dec)} <span class="ck-unit">${kpi.unit}</span></div>
      ${chg ? `<div class="ck-chg ${chg.improved ? 'improved' : 'worsened'}">${chg.improved ? '▼' : '▲'} ${Math.abs(chg.pct)}%</div>` : ''}
    </div>`;
    }).join('');
}

function renderCategoryRows(current, previous) {
    const container = document.getElementById('catRows');
    if (!container) return;

    container.innerHTML = CATEGORIES.map(cat => {
        const curr = parseFloat(current[cat.key_co2]) || 0;
        const prev = parseFloat(previous[cat.key_co2]) || 0;
        const chg = getChange(curr, prev);
        const maxV = Math.max(curr, prev, 1);

        return `
    <div class="cat-row">
      <div class="cr-label">${cat.label}</div>
      <div class="cr-bars">
        <div class="cr-bar-wrap">
          <span class="cr-lbl-sm">Prev</span>
          <div class="cr-bar"><div class="cr-fill" style="width:${(prev / maxV * 100).toFixed(1)}%;background:rgba(59,130,246,0.6)"></div></div>
          <span class="cr-num">${prev.toFixed(1)}</span>
        </div>
        <div class="cr-bar-wrap">
          <span class="cr-lbl-sm">Curr</span>
          <div class="cr-bar"><div class="cr-fill" style="width:${(curr / maxV * 100).toFixed(1)}%;background:${cat.color}99"></div></div>
          <span class="cr-num">${curr.toFixed(1)}</span>
        </div>
      </div>
      ${chg ? `<div class="cr-chg ${chg.improved ? 'imp' : 'wrs'}">${chg.improved ? '▼' : '▲'} ${Math.abs(chg.pct)}%</div>` : ''}
    </div>`;
    }).join('');
}

function renderChart(current, previous) {
    const ctx = document.getElementById('cmpChart');
    if (!ctx) return;
    const labels = CATEGORIES.map(c => c.label);
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Previous', data: CATEGORIES.map(c => parseFloat(previous[c.key_co2]) || 0), backgroundColor: 'rgba(59,130,246,0.6)', borderRadius: 6 },
                { label: 'Current', data: CATEGORIES.map(c => parseFloat(current[c.key_co2]) || 0), backgroundColor: CATEGORIES.map(c => c.color + 'aa'), borderRadius: 6 },
            ],
        },
        options: {
            responsive: true,
            Chart: { defaults: { color: '#8db5a0', font: { family: 'Inter' } } },
            plugins: { legend: { position: 'top' } },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true },
            },
        },
    });
}

document.addEventListener('DOMContentLoaded', loadComparison);
