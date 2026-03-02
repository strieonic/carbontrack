import { fetchLatest, fetchLastTwo, fetchTrend } from './db.js';
import { getChange, getCarbonRating } from './carbon.js';
import { showToast, animateCounter, formatDate } from './nav.js';

const CHART_DEFAULTS = {
    colors: ['#48c78e', '#38bdf8', '#f59e0b', '#a78bfa', '#f97316'],
    gridColor: 'rgba(255,255,255,0.05)',
    textColor: '#8db5a0',
    font: 'Inter',
};

function chartDefaults() {
    Chart.defaults.color = CHART_DEFAULTS.textColor;
    Chart.defaults.font.family = CHART_DEFAULTS.font;
    Chart.defaults.plugins.legend.labels.boxWidth = 12;
}

async function loadDashboard() {
    const loading = document.getElementById('dashLoading');
    const empty = document.getElementById('dashEmpty');
    const content = document.getElementById('dashContent');

    try {
        const [latest, trend, lastTwo] = await Promise.all([
            fetchLatest(),
            fetchTrend(6),
            fetchLastTwo(),
        ]);

        if (loading) loading.style.display = 'none';

        if (!latest) {
            if (empty) empty.classList.remove('hidden');
            return;
        }

        if (content) content.classList.remove('hidden');
        chartDefaults();

        renderKPIs(latest, lastTwo);
        renderBreakdown(latest);
        renderPieChart(latest);
        renderLineChart(trend);
        renderBarChart(lastTwo);
        renderCityInfo(latest);

    } catch (err) {
        console.error(err);
        if (loading) loading.style.display = 'none';
        if (empty) empty.classList.remove('hidden');
        showToast('Failed to load dashboard data', 'error');
    }
}

function renderKPIs(latest, lastTwo) {
    const rating = getCarbonRating(latest.per_person_co2 || latest.total_co2);

    // Grade badge
    const gradeEl = document.getElementById('dashGrade');
    const labelEl = document.getElementById('dashGradeLabel');
    if (gradeEl) { gradeEl.textContent = rating.grade; gradeEl.style.color = rating.color; }
    if (labelEl) { labelEl.textContent = rating.label; }

    // Date
    const dateEl = document.getElementById('dashDate');
    if (dateEl && latest.created_at) dateEl.textContent = `Last updated: ${formatDate(latest.created_at)}`;

    // KPI values
    const kpis = [
        ['kpiTotal', latest.total_co2, 0],
        ['kpiEnergy', latest.energy_kwh, 0],
        ['kpiPer', latest.per_person_co2, 1],
        ['kpiTrees', latest.trees_needed, 0],
    ];

    kpis.forEach(([id, val, dec]) => {
        const el = document.getElementById(id);
        if (el && val !== undefined && val !== null) animateCounter(el, parseFloat(val), 1200, dec);
    });

    // Change indicator
    if (lastTwo.previous) {
        const chg = getChange(lastTwo.current.total_co2, lastTwo.previous.total_co2);
        const chgEl = document.getElementById('kpiTotalChange');
        if (chgEl && chg) {
            chgEl.textContent = `${chg.improved ? '▼' : '▲'} ${Math.abs(chg.pct)}% vs last month`;
            chgEl.className = `stat-change ${chg.improved ? 'down' : 'up'}`;
        }
    }
}

function renderBreakdown(latest) {
    const categories = [
        { label: '⚡ Electricity', val: latest.electricity_co2 || 0, color: '#38bdf8' },
        { label: '🚗 Transport', val: latest.transport_co2 || 0, color: '#f59e0b' },
        { label: '🍳 Cooking', val: latest.cooking_co2 || 0, color: '#f97316' },
        { label: '📱 Appliances', val: latest.appliance_co2 || 0, color: '#a78bfa' },
        { label: '🗑️ Waste', val: latest.waste_co2 || 0, color: '#48c78e' },
    ];

    const total = categories.reduce((s, c) => s + c.val, 0) || 1;
    const container = document.getElementById('breakdownBars');
    if (!container) return;

    container.innerHTML = categories.map(cat => {
        const pct = ((cat.val / total) * 100).toFixed(1);
        return `<div class="bb-item">
      <div class="bb-header"><span class="bb-label">${cat.label}</span><span class="bb-val">${cat.val.toFixed(1)} kg (${pct}%)</span></div>
      <div class="bb-bar"><div class="bb-fill" style="width:0%;background:${cat.color}" data-w="${pct}"></div></div>
    </div>`;
    }).join('');

    // Animate bars after render
    setTimeout(() => {
        container.querySelectorAll('.bb-fill').forEach(el => {
            el.style.width = el.dataset.w + '%';
        });
    }, 100);
}

function renderPieChart(latest) {
    const ctx = document.getElementById('pieChart');
    if (!ctx) return;

    const labels = ['Electricity', 'Transport', 'Cooking', 'Appliances', 'Waste'];
    const data = [
        parseFloat(latest.electricity_co2) || 0,
        parseFloat(latest.transport_co2) || 0,
        parseFloat(latest.cooking_co2) || 0,
        parseFloat(latest.appliance_co2) || 0,
        parseFloat(latest.waste_co2) || 0,
    ];

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: CHART_DEFAULTS.colors,
                borderColor: 'rgba(255,255,255,0.05)',
                borderWidth: 2,
                hoverOffset: 6,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: { position: 'right' },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.label}: ${ctx.parsed.toFixed(1)} kg CO₂`,
                    },
                },
            },
        },
    });
}

function renderLineChart(trend) {
    const ctx = document.getElementById('lineChart');
    if (!ctx || trend.length < 2) {
        ctx?.closest('.chart-wrapper')?.insertAdjacentHTML('beforeend', '<p style="color:var(--clr-text-muted);font-size:.85rem;margin-top:12px;">Complete more surveys to see your trend.</p>');
        return;
    }

    const labels = trend.map(t => formatDate(t.created_at));
    const data = trend.map(t => parseFloat(t.total_co2) || 0);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'CO₂ (kg)',
                data,
                borderColor: '#48c78e',
                backgroundColor: 'rgba(72,199,142,0.08)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#48c78e',
                pointRadius: 5,
                pointHoverRadius: 8,
            }],
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: CHART_DEFAULTS.gridColor } },
                y: { grid: { color: CHART_DEFAULTS.gridColor }, beginAtZero: true },
            },
        },
    });
}

function renderBarChart(lastTwo) {
    const ctx = document.getElementById('barChart');
    const naMsg = document.getElementById('barNA');
    if (!ctx) return;

    if (!lastTwo.previous) {
        ctx.style.display = 'none';
        naMsg?.classList.remove('hidden');
        return;
    }

    const categories = ['Electricity', 'Transport', 'Cooking', 'Appliances', 'Waste'];
    const currData = [
        parseFloat(lastTwo.current.electricity_co2) || 0,
        parseFloat(lastTwo.current.transport_co2) || 0,
        parseFloat(lastTwo.current.cooking_co2) || 0,
        parseFloat(lastTwo.current.appliance_co2) || 0,
        parseFloat(lastTwo.current.waste_co2) || 0,
    ];
    const prevData = [
        parseFloat(lastTwo.previous.electricity_co2) || 0,
        parseFloat(lastTwo.previous.transport_co2) || 0,
        parseFloat(lastTwo.previous.cooking_co2) || 0,
        parseFloat(lastTwo.previous.appliance_co2) || 0,
        parseFloat(lastTwo.previous.waste_co2) || 0,
    ];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [
                { label: 'Previous', data: prevData, backgroundColor: 'rgba(59,130,246,0.6)', borderRadius: 4 },
                { label: 'Current', data: currData, backgroundColor: 'rgba(72,199,142,0.7)', borderRadius: 4 },
            ],
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'top' } },
            scales: {
                x: { grid: { color: CHART_DEFAULTS.gridColor } },
                y: { grid: { color: CHART_DEFAULTS.gridColor }, beginAtZero: true },
            },
        },
    });
}

function renderCityInfo(latest) {
    const grid = document.getElementById('cityGrid');
    if (!grid) return;

    const items = [
        { label: 'City', val: latest.city || '—' },
        { label: 'House Type', val: latest.house_type || '—' },
        { label: 'People', val: latest.people || '—' },
        { label: 'Grade', val: latest.carbon_grade || '—' },
    ];

    grid.innerHTML = items.map(item => `
    <div class="cg-item">
      <div class="cg-label">${item.label}</div>
      <div class="cg-val">${item.val}</div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', loadDashboard);
