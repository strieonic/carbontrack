import { fetchLatest } from './db.js';
import { showToast } from './nav.js';

// Rule-based suggestions database
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
let aiSuggestions = [];
let isLoadingAI = false;

// Generate AI-powered personalized suggestions using smart rules
async function generateAISuggestions(userData) {
    if (isLoadingAI) return [];
    
    isLoadingAI = true;
    
    try {
        const suggestions = [];
        const total = userData.total_co2 || 0;
        const elec = userData.electricity_co2 || 0;
        const transport = userData.transport_co2 || 0;
        const cooking = userData.cooking_co2 || 0;
        const appliance = userData.appliance_co2 || 0;
        const waste = userData.waste_co2 || 0;
        
        // Find the top 3 emission sources
        const sources = [
            { name: 'electricity', value: elec, percent: (elec/total*100).toFixed(0) },
            { name: 'transport', value: transport, percent: (transport/total*100).toFixed(0) },
            { name: 'cooking', value: cooking, percent: (cooking/total*100).toFixed(0) },
            { name: 'appliances', value: appliance, percent: (appliance/total*100).toFixed(0) },
            { name: 'waste', value: waste, percent: (waste/total*100).toFixed(0) }
        ].sort((a, b) => b.value - a.value).slice(0, 3);
        
        // Generate personalized suggestions for top sources
        sources.forEach((source, index) => {
            if (source.value < 5) return; // Skip if too small
            
            const impact = index === 0 ? 'high' : index === 1 ? 'medium' : 'low';
            
            if (source.name === 'electricity' && elec > 30) {
                const kwh = userData.electricity_kwh || 0;
                const saving = Math.round(elec * 0.25);
                suggestions.push({
                    id: `ai_elec_${index}`,
                    icon: '⚡',
                    title: `Reduce Electricity Usage - Your Top Priority`,
                    desc: `Your electricity emissions (${elec} kg CO₂, ${source.percent}% of total) from ${kwh} kWh usage are ${elec > 100 ? 'very high' : 'high'}. Switch to 5-star rated appliances, use natural light during day, and set AC to 26°C. Your city ${userData.city || 'location'} likely has solar incentives - check MNRE subsidy schemes.`,
                    saving: `~${saving} kg CO₂/month`,
                    impact,
                    category: 'electricity'
                });
            }
            
            if (source.name === 'transport' && transport > 20) {
                const petrolKm = userData.petrol_km || 0;
                const dieselKm = userData.diesel_km || 0;
                const totalKm = petrolKm + dieselKm;
                const saving = Math.round(transport * 0.30);
                suggestions.push({
                    id: `ai_transport_${index}`,
                    icon: '🚗',
                    title: `Optimize Your ${totalKm} km/month Commute`,
                    desc: `Transport is ${source.percent}% of your footprint (${transport} kg CO₂). ${petrolKm > 100 ? 'Consider carpooling or metro for daily commute.' : ''} ${dieselKm > 50 ? 'Diesel vehicles emit more - plan to switch to CNG/EV.' : ''} Even reducing 30% of trips saves significantly. Check if your office offers WFH options.`,
                    saving: `~${saving} kg CO₂/month`,
                    impact,
                    category: 'transport'
                });
            }
            
            if (source.name === 'cooking' && cooking > 15) {
                const lpg = userData.lpg_cylinders || 0;
                const saving = Math.round(cooking * 0.20);
                suggestions.push({
                    id: `ai_cooking_${index}`,
                    icon: '🔥',
                    title: `Optimize LPG Usage (${lpg} Cylinders/Month)`,
                    desc: `Cooking emissions are ${source.percent}% of total (${cooking} kg CO₂). Use pressure cookers for dal/rice (saves 70% fuel), keep lids on while cooking, and soak dal/beans overnight. Consider induction for boiling water - it's 10% more efficient than LPG.`,
                    saving: `~${saving} kg CO₂/month`,
                    impact,
                    category: 'cooking'
                });
            }
            
            if (source.name === 'appliances' && appliance > 15) {
                const acHours = userData.ac_hours || 0;
                const saving = Math.round(appliance * 0.25);
                suggestions.push({
                    id: `ai_appliance_${index}`,
                    icon: '❄️',
                    title: `Smart AC Management (${acHours} hrs/day)`,
                    desc: `Appliances contribute ${source.percent}% (${appliance} kg CO₂). ${acHours > 6 ? 'Your AC usage is very high.' : 'Your AC usage can be optimized.'} Set to 26°C (each degree lower uses 6% more power), use timer to turn off after you sleep, clean filters monthly, and use ceiling fans to circulate cool air better.`,
                    saving: `~${saving} kg CO₂/month`,
                    impact,
                    category: 'appliances'
                });
            }
            
            if (source.name === 'waste' && waste > 10) {
                const wasteKg = userData.waste_kg_per_day || 0;
                const saving = Math.round(waste * 0.40);
                suggestions.push({
                    id: `ai_waste_${index}`,
                    icon: '♻️',
                    title: `Reduce ${wasteKg} kg/day Waste Generation`,
                    desc: `Waste is ${source.percent}% of emissions (${waste} kg CO₂). Start composting kitchen waste (reduces 50% of waste), avoid single-use plastics, buy in bulk to reduce packaging, and donate/sell items instead of discarding. Many Indian cities now have waste segregation mandates.`,
                    saving: `~${saving} kg CO₂/month`,
                    impact,
                    category: 'waste'
                });
            }
        });
        
        // Add one quick win suggestion
        if (userData.people > 1) {
            suggestions.push({
                id: 'ai_quick_win',
                icon: '💡',
                title: `Family Action: ${userData.people} People Can Make Big Impact`,
                desc: `With ${userData.people} people in your household, small changes multiply. If everyone unplugs devices when not in use, takes 5-min showers, and turns off lights, you'll save ~${Math.round(total * 0.10)} kg CO₂/month collectively. Make it a family challenge!`,
                saving: `~${Math.round(total * 0.10)} kg CO₂/month`,
                impact: 'low',
                category: 'electricity'
            });
        }
        
        return suggestions.map(s => ({ ...s, condition: () => true }));
        
    } catch (err) {
        console.error('AI suggestion generation failed:', err);
        return [];
    } finally {
        isLoadingAI = false;
    }
}

window.filterSuggestions = function (filter) {
    document.querySelectorAll('.sug-tab').forEach(t => t.classList.toggle('active', t.dataset.filter === filter));
    const grid = document.getElementById('sugGrid');
    if (!grid) return;

    const filtered = filter === 'all' ? allSuggestions : allSuggestions.filter(s => s.impact === filter);
    grid.innerHTML = filtered.map(renderSugCard).join('');
};

function renderSugCard(sug) {
    const isAI = sug.id?.startsWith('ai_');
    return `
    <div class="sug-card glass-card fade-up" data-impact="${sug.impact}">
      <div class="sug-top">
        <div class="sug-icon">${sug.icon}</div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          ${isAI ? '<div style="background:#8b5cf622;color:#8b5cf6;padding:4px 8px;border-radius:50px;font-size:0.7rem;font-weight:700;border:1px solid #8b5cf644;">🤖 AI</div>' : ''}
          <div class="sug-impact-badge" style="background:${impactColors[sug.impact]}22;color:${impactColors[sug.impact]};border:1px solid ${impactColors[sug.impact]}44">
            ${impactLabels[sug.impact]}
          </div>
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

        // Generate AI suggestions first
        showToast('🤖 Analyzing your data...', 'info');
        aiSuggestions = await generateAISuggestions(latest);
        
        // Generate rule-based suggestions
        const ruleSuggestions = SUGGESTIONS_DB.filter(sug => {
            try { return sug.condition(latest); } catch { return false; }
        });

        // Combine AI and rule-based suggestions (AI first)
        allSuggestions = [...aiSuggestions, ...ruleSuggestions];

        // Render header
        const header = document.getElementById('sugHeader');
        if (header) {
            const total = latest.total_co2 || 0;
            const aiCount = aiSuggestions.length;
            header.innerHTML = `
        <div class="sug-header-inner">
          <div>
            <p style="color:var(--clr-text-muted);font-size:.85rem;margin-bottom:4px;">Your monthly footprint</p>
            <div class="sug-total">${total} <span>kg CO₂</span></div>
            <p style="color:var(--clr-text-secondary);margin-top:8px;">
              ${aiCount > 0 ? `<strong style="color:var(--clr-primary)">🤖 ${aiCount} AI-powered</strong> + ` : ''}
              <strong style="color:var(--clr-primary)">${ruleSuggestions.length} rule-based</strong> suggestions
            </p>
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
        
        if (aiCount > 0) {
            showToast(`✨ ${aiCount} AI suggestions generated!`, 'success');
        }

    } catch (err) {
        console.error(err);
        if (loading) loading.style.display = 'none';
        if (noData) noData.classList.remove('hidden');
        showToast('Failed to load suggestions', 'error');
    }
}

document.addEventListener('DOMContentLoaded', loadSuggestions);
