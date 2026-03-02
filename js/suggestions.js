import { fetchLatest } from './db.js';
import { showToast } from './nav.js';

// All suggestions database (rule-based AI)
const SUGGESTIONS_DB = [
    // ======= HIGH IMPACT =======
    {
        id: 1, category: 'electricity', impact: 'high', icon: '☀️', title: 'Switch to Solar Energy',
        desc: 'Installing solar panels can reduce electricity CO₂ by 90%. A 2kW system costs ~₹1.2L with 5-yr payback.',
        saving: '~80 kg CO₂/month', condition: d => (d.electricity_co2 || 0) > 40
    },
    {
        id: 2, category: 'transport', impact: 'high', icon: '⚡', title: 'Switch to Electric Vehicle',
        desc: 'Switching from petrol to EV cuts transport emissions by 78%. EVs have 60% lower running costs.',
        saving: '~30 kg CO₂/month', condition: d => (d.petrol_km || 0) > 100
    },
    {
        id: 3, category: 'transport', impact: 'high', icon: '🚇', title: 'Use Public Transport More',
        desc: 'Taking metro/bus instead of petrol vehicle reduces emissions by 7× per km.',
        saving: '~25 kg CO₂/month', condition: d => (d.petrol_km || 0) > 50
    },
    {
        id: 4, category: 'appliances', impact: 'high', icon: '❄️', title: 'Optimize AC Usage',
        desc: 'Set AC to 26°C instead of 20°C — saves 24% electricity. Use fans to support cooling.',
        saving: '~20 kg CO₂/month', condition: d => (d.ac_hours || 0) > 4
    },
    {
        id: 5, category: 'cooking', impact: 'high', icon: '🔵', title: 'Reduce LPG Consumption',
        desc: 'Use pressure cookers (saves 70% fuel), cook on lower flame, and reduce portion sizes.',
        saving: '~15 kg CO₂/month', condition: d => (d.lpg_cylinders || 0) > 1
    },

    // ======= MEDIUM IMPACT =======
    {
        id: 6, category: 'electricity', impact: 'medium', icon: '💡', title: 'Replace All Bulbs with LED',
        desc: 'LED bulbs use 75% less energy than incandescent. Replace all lights — instant savings.',
        saving: '~8 kg CO₂/month', condition: d => (d.electricity_co2 || 0) > 20
    },
    {
        id: 7, category: 'appliances', impact: 'medium', icon: '🌀', title: 'Run Washing Machine on Full Load',
        desc: 'Running full loads reduces uses/week by 30%. Use cold water setting — saves 90% of wash energy.',
        saving: '~5 kg CO₂/month', condition: d => (d.washing_uses || 0) > 3
    },
    {
        id: 8, category: 'waste', impact: 'medium', icon: '♻️', title: 'Start Waste Segregation',
        desc: 'Separating wet/dry waste enables composting and reduces landfill methane by 60%.',
        saving: '~8 kg CO₂/month', condition: d => !d.has_segregation
    },
    {
        id: 9, category: 'transport', impact: 'medium', icon: '🚲', title: 'Cycle for Short Distances',
        desc: 'Replace trips under 3km with cycling. Zero emissions + health benefits.',
        saving: '~6 kg CO₂/month', condition: d => (d.petrol_km || 0) > 30
    },
    {
        id: 10, category: 'cooking', impact: 'medium', icon: '⚡', title: 'Use Induction for Some Cooking',
        desc: 'Induction is 10% more efficient than LPG. Use it for boiling water and quick cooking.',
        saving: '~5 kg CO₂/month', condition: d => (d.lpg_cylinders || 0) > 0.5 && (d.induction_hours || 0) < 0.5
    },
    {
        id: 11, category: 'electricity', impact: 'medium', icon: '🌡️', title: 'AC Maintenance',
        desc: 'Clean AC filters monthly — dirty filters use 15% more energy. Schedule annual servicing.',
        saving: '~7 kg CO₂/month', condition: d => (d.ac_hours || 0) > 2
    },

    // ======= LOW IMPACT / QUICK WINS =======
    {
        id: 12, category: 'electricity', impact: 'low', icon: '🔋', title: 'Eliminate Vampire Power',
        desc: 'Unplug phone chargers, TVs, and set-top boxes when not in use. Standby power = 10% of bill.',
        saving: '~3 kg CO₂/month', condition: () => true
    },
    {
        id: 13, category: 'appliances', impact: 'low', icon: '💻', title: 'Laptop Power Management',
        desc: 'Enable power saver mode. Dim screen brightness. Use sleep mode — not standby.',
        saving: '~2 kg CO₂/month', condition: d => (d.laptop_hours || 0) > 4
    },
    {
        id: 14, category: 'appliances', impact: 'low', icon: '📺', title: 'Reduce TV Screen Brightness',
        desc: 'Set TV brightness to eco/standard mode. Auto-off after idle reduces daily consumption by 20%.',
        saving: '~2 kg CO₂/month', condition: d => (d.tv_hours || 0) > 3
    },
    {
        id: 15, category: 'waste', impact: 'low', icon: '🌱', title: 'Start Kitchen Composting',
        desc: 'Composting food waste prevents methane in landfills. Use it as free fertilizer for plants.',
        saving: '~3 kg CO₂/month', condition: d => (d.waste_kg_per_day || 0) > 0.3
    },
    {
        id: 16, category: 'transport', impact: 'low', icon: '🐌', title: 'Smooth Driving Style',
        desc: 'Avoid sudden acceleration/braking. Smooth driving improves fuel efficiency by 15%.',
        saving: '~4 kg CO₂/month', condition: d => (d.petrol_km || 0) > 20 || (d.diesel_km || 0) > 20
    },
    {
        id: 17, category: 'electricity', impact: 'low', icon: '🌊', title: 'Cold Water Washing',
        desc: 'Washing clothes at 30°C instead of 60°C saves 57% of the energy used per wash cycle.',
        saving: '~2 kg CO₂/month', condition: d => (d.washing_uses || 0) > 1
    },
];

const impactColors = { high: '#ef4444', medium: '#f59e0b', low: '#48c78e' };
const impactLabels = { high: '🔴 High Impact', medium: '🟡 Medium Impact', low: '🟢 Quick Win' };

let allSuggestions = [];

window.filterSuggestions = function (filter) {
    document.querySelectorAll('.sug-tab').forEach(t => t.classList.toggle('active', t.dataset.filter === filter));
    const grid = document.getElementById('sugGrid');
    if (!grid) return;

    const filtered = filter === 'all' ? allSuggestions : allSuggestions.filter(s => s.impact === filter);
    grid.innerHTML = filtered.map(renderSugCard).join('');
};

function renderSugCard(sug) {
    return `
    <div class="sug-card glass-card fade-up" data-impact="${sug.impact}">
      <div class="sug-top">
        <div class="sug-icon">${sug.icon}</div>
        <div class="sug-impact-badge" style="background:${impactColors[sug.impact]}22;color:${impactColors[sug.impact]};border:1px solid ${impactColors[sug.impact]}44">
          ${impactLabels[sug.impact]}
        </div>
      </div>
      <h3>${sug.title}</h3>
      <p>${sug.desc}</p>
      <div class="sug-saving">
        <span>💚 Potential saving:</span> <strong>${sug.saving}</strong>
      </div>
    </div>
  `;
}

async function loadSuggestions() {
    const loading = document.getElementById('sugLoading');
    const noData = document.getElementById('sugNoData');
    const content = document.getElementById('sugContent');

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

        // Generate applicable suggestions
        allSuggestions = SUGGESTIONS_DB.filter(sug => {
            try { return sug.condition(latest); } catch { return false; }
        });

        // Render header
        const header = document.getElementById('sugHeader');
        if (header) {
            const total = latest.total_co2 || 0;
            header.innerHTML = `
        <div class="sug-header-inner">
          <div>
            <p style="color:var(--clr-text-muted);font-size:.85rem;margin-bottom:4px;">Your monthly footprint</p>
            <div class="sug-total">${total} <span>kg CO₂</span></div>
            <p style="color:var(--clr-text-secondary);margin-top:8px;">We found <strong style="color:var(--clr-primary)">${allSuggestions.length} personalised suggestions</strong> for you</p>
          </div>
          <div class="sug-saving-potential">
            <div class="sp-label">Total potential saving</div>
            <div class="sp-val">${Math.round(total * 0.3)} kg CO₂/month</div>
            <div class="sp-sub">up to 30% reduction possible</div>
          </div>
        </div>
      `;
        }

        // Render grid
        const grid = document.getElementById('sugGrid');
        if (grid) grid.innerHTML = allSuggestions.map(renderSugCard).join('');

    } catch (err) {
        console.error(err);
        if (loading) loading.style.display = 'none';
        if (noData) noData.classList.remove('hidden');
        showToast('Failed to load suggestions', 'error');
    }
}

document.addEventListener('DOMContentLoaded', loadSuggestions);
