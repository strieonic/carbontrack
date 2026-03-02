import { fetchEntries } from './db.js';
import { getCarbonRating } from './carbon.js';
import { showToast, formatDate } from './nav.js';
import supabase from './supabase.js';
import deviceID from './device.js';

async function loadHistory() {
    const loading = document.getElementById('histLoading');
    const empty = document.getElementById('histEmpty');
    const content = document.getElementById('histContent');

    try {
        const entries = await fetchEntries(50); // Get up to 50 entries

        if (loading) loading.style.display = 'none';

        if (!entries || entries.length === 0) {
            if (empty) {
                empty.classList.remove('hidden');
                empty.style.display = 'block';
            }
            return;
        }

        if (empty) {
            empty.classList.add('hidden');
            empty.style.display = 'none';
        }
        if (content) {
            content.classList.remove('hidden');
            content.style.display = 'block';
        }

        document.getElementById('totalCount').textContent = entries.length;
        renderSurveyList(entries);

    } catch (err) {
        console.error(err);
        if (loading) loading.style.display = 'none';
        if (empty) empty.classList.remove('hidden');
        showToast('Failed to load survey history', 'error');
    }
}

function renderSurveyList(entries) {
    const container = document.getElementById('surveyList');
    if (!container) return;

    container.innerHTML = entries.map((entry, index) => {
        const rating = getCarbonRating(entry.per_person_co2 || entry.total_co2);
        const date = formatDate(entry.created_at);
        const isLatest = index === 0;

        return `
        <div class="glass-card" style="padding:24px;margin-bottom:16px;position:relative;">
            ${isLatest ? '<div style="position:absolute;top:12px;right:12px;background:var(--clr-primary);color:#0a0e1a;padding:4px 12px;border-radius:4px;font-size:0.75rem;font-weight:600;">LATEST</div>' : ''}
            
            <div style="display:grid;grid-template-columns:1fr auto;gap:24px;align-items:start;">
                <div>
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                        <h3 style="margin:0;font-size:1.25rem;">${entry.city || 'Unknown City'}</h3>
                        <span style="background:${rating.color}22;color:${rating.color};padding:4px 12px;border-radius:4px;font-size:0.85rem;font-weight:600;">${rating.grade}</span>
                    </div>
                    
                    <p style="color:var(--clr-text-secondary);margin-bottom:16px;">
                        📅 ${date} · 
                        <img src="../assets/icons/home.svg" alt="" class="icon icon-sm" style="margin-left:8px;margin-right:4px;"> ${entry.house_type || 'N/A'} · 
                        <img src="../assets/icons/person.svg" alt="" class="icon icon-sm" style="margin-left:8px;margin-right:4px;"> ${entry.people || 1} people
                    </p>

                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;">
                        <div>
                            <div style="color:var(--clr-text-muted);font-size:0.85rem;">Total CO₂</div>
                            <div style="font-size:1.5rem;font-weight:700;color:var(--clr-primary);">${entry.total_co2 || 0} <span style="font-size:0.85rem;font-weight:400;">kg</span></div>
                        </div>
                        <div>
                            <div style="color:var(--clr-text-muted);font-size:0.85rem;">Per Person</div>
                            <div style="font-size:1.5rem;font-weight:700;">${entry.per_person_co2 || 0} <span style="font-size:0.85rem;font-weight:400;">kg</span></div>
                        </div>
                        <div>
                            <div style="color:var(--clr-text-muted);font-size:0.85rem;">Energy</div>
                            <div style="font-size:1.5rem;font-weight:700;">${entry.energy_kwh || 0} <span style="font-size:0.85rem;font-weight:400;">kWh</span></div>
                        </div>
                        <div>
                            <div style="color:var(--clr-text-muted);font-size:0.85rem;">Trees Needed</div>
                            <div style="font-size:1.5rem;font-weight:700;">${entry.trees_needed || 0}</div>
                        </div>
                    </div>
                </div>

                <div style="display:flex;flex-direction:column;gap:8px;min-width:120px;">
                    <button class="btn btn-primary" onclick="viewSurvey('${entry.id}')" style="width:100%;">
                        <img src="../assets/icons/chart.svg" alt="" class="icon" style="margin-right:4px;"> View
                    </button>
                    <button class="btn btn-outline" onclick="deleteSurvey('${entry.id}', event)" style="width:100%;">
                        <img src="../assets/icons/trash.svg" alt="" class="icon" style="margin-right:4px;"> Delete
                    </button>
                </div>
            </div>

            <div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.05);">
                <div style="display:flex;gap:8px;font-size:0.85rem;color:var(--clr-text-secondary);">
                    <span>⚡ ${entry.electricity_co2 || 0} kg</span>
                    <span>🚗 ${entry.transport_co2 || 0} kg</span>
                    <span>🍳 ${entry.cooking_co2 || 0} kg</span>
                    <span>📱 ${entry.appliance_co2 || 0} kg</span>
                    <span>🗑️ ${entry.waste_co2 || 0} kg</span>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

window.viewSurvey = function(id) {
    // Store the selected survey ID and redirect to dashboard
    sessionStorage.setItem('ct_view_survey', id);
    window.location.href = 'dashboard.html';
};

window.deleteSurvey = async function(id, event) {
    if (!confirm('Are you sure you want to delete this survey? This action cannot be undone.')) {
        return;
    }

    // Show loading state
    const deleteBtn = event?.target?.closest('button');
    if (deleteBtn) {
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;margin:0 auto;"></div>';
    }

    try {
        const { error } = await supabase
            .from('carbon_entries')
            .delete()
            .eq('id', id)
            .eq('device_id', deviceID);

        if (error) {
            console.error('Delete error:', error);
            throw error;
        }

        showToast('Survey deleted successfully', 'success');
        
        // Reload the page after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 800);

    } catch (err) {
        console.error('Delete failed:', err);
        showToast('Failed to delete survey: ' + (err.message || 'Unknown error'), 'error');
        
        // Restore button
        if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = '<img src="../assets/icons/trash.svg" alt="" class="icon" style="margin-right:4px;"> Delete';
        }
    }
};

document.addEventListener('DOMContentLoaded', loadHistory);
