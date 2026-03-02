import { calculateCarbon, getCarbonRating } from './carbon.js';
import { saveEntry } from './db.js';
import { showToast } from './nav.js';

// State
let currentStep = 0;
const totalSteps = 6;
let elecMode = 'bill';

// Expose to global for onclick handlers
window.switchElecMode = function (mode) {
    elecMode = mode;
    document.getElementById('togBill').classList.toggle('active', mode === 'bill');
    document.getElementById('togUnits').classList.toggle('active', mode === 'units');
    document.getElementById('billGroup').classList.toggle('hidden', mode !== 'bill');
    document.getElementById('unitsGroup').classList.toggle('hidden', mode !== 'units');
    updateElecPreview();
};

window.surveyNext = function () {
    if (!validateStep(currentStep)) return;
    if (currentStep === totalSteps - 1) {
        submitSurvey();
    } else {
        goToStep(currentStep + 1);
    }
};

window.surveyPrev = function () {
    if (currentStep > 0) goToStep(currentStep - 1);
};

function goToStep(step) {
    // Mark current as done
    document.querySelector(`.ss-item[data-step="${currentStep}"]`)?.classList.add('done');
    document.querySelectorAll('.form-step')[currentStep]?.classList.remove('active');
    document.querySelector(`.ss-item[data-step="${currentStep}"]`)?.classList.remove('active');

    currentStep = step;

    document.querySelectorAll('.form-step')[currentStep]?.classList.add('active');
    document.querySelector(`.ss-item[data-step="${currentStep}"]`)?.classList.add('active');
    document.querySelector(`.ss-item[data-step="${currentStep}"]`)?.classList.remove('done');

    // Nav buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const indicator = document.getElementById('stepIndicator');
    if (prevBtn) prevBtn.style.display = currentStep === 0 ? 'none' : '';
    if (nextBtn) nextBtn.textContent = currentStep === totalSteps - 1 ? '✅ Submit & Calculate' : 'Next →';
    if (indicator) indicator.textContent = `Step ${currentStep + 1} of ${totalSteps}`;

    // Progress bar
    const pct = ((currentStep) / (totalSteps - 1)) * 100;
    const fill = document.getElementById('progressFill');
    if (fill) fill.style.width = pct + '%';

    // Live preview on last step
    if (currentStep === totalSteps - 1) updateResultPreview();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateStep(step) {
    if (step === 0) {
        const city = document.getElementById('city')?.value.trim();
        const people = document.getElementById('people')?.value;
        const houseType = document.getElementById('houseType')?.value;
        if (!city) { showToast('Please enter your city', 'error'); return false; }
        if (!people || people < 1) { showToast('Please enter number of people', 'error'); return false; }
        if (!houseType) { showToast('Please select house type', 'error'); return false; }
    }
    return true;
}

// Collect form data
function collectData() {
    return {
        city: v('city'),
        people: v('people'),
        house_type: v('houseType'),
        electricity_bill: v('electricityBill'),
        electricity_units: v('electricityUnits'),
        petrol_km: v('petrolKm'),
        diesel_km: v('dieselKm'),
        public_km: v('publicKm'),
        ev_km: v('evKm'),
        lpg_cylinders: v('lpgCylinders'),
        png_usage: v('pngUsage'),
        induction_hours: v('inductionHours'),
        ac_hours: v('acHours'),
        has_refrigerator: rVal('has_refrigerator') === 'yes',
        washing_uses: v('washingUses'),
        laptop_hours: v('laptopHours'),
        tv_hours: v('tvHours'),
        waste_kg_per_day: v('wasteKg'),
        has_segregation: rVal('has_segregation') === 'yes',
    };
}

function v(id) { return document.getElementById(id)?.value || ''; }
function rVal(name) {
    return document.querySelector(`input[name="${name}"]:checked`)?.value || '';
}

// Live electricity preview on step 1
function updateElecPreview() {
    const bill = parseFloat(document.getElementById('electricityBill')?.value) || 0;
    const units_direct = parseFloat(document.getElementById('electricityUnits')?.value) || 0;
    let units = elecMode === 'units' ? units_direct : bill / 8;
    const co2 = (units * 0.82).toFixed(1);
    const elecUnitsEl = document.getElementById('elecEstUnits');
    const elecCO2El = document.getElementById('elecEstCO2');
    if (elecUnitsEl) elecUnitsEl.textContent = units.toFixed(1);
    if (elecCO2El) elecCO2El.textContent = co2;
}

// Live result preview on step 5
function updateResultPreview() {
    const data = collectData();
    const formData = {
        electricityBill: data.electricity_bill,
        electricityUnits: data.electricity_units,
        petrolKm: data.petrol_km,
        dieselKm: data.diesel_km,
        publicKm: data.public_km,
        evKm: data.ev_km,
        lpgCylinders: data.lpg_cylinders,
        pngUsage: data.png_usage,
        inductionHours: data.induction_hours,
        acHours: data.ac_hours,
        hasRefrigerator: data.has_refrigerator,
        washingUses: data.washing_uses,
        laptopHours: data.laptop_hours,
        tvHours: data.tv_hours,
        wasteKgPerDay: data.waste_kg_per_day,
        hasSegregation: data.has_segregation,
        people: data.people,
    };
    const result = calculateCarbon(formData);

    document.getElementById('rpLoading')?.classList.add('hidden');
    const rpData = document.getElementById('rpData');
    if (rpData) {
        rpData.classList.remove('hidden');
        document.getElementById('rpTotal').textContent = result.totalCO2;
        document.getElementById('rpPer').textContent = result.perPersonCO2;
        document.getElementById('rpTrees').textContent = result.treesNeeded;
        const gradeEl = document.getElementById('rpGrade');
        if (gradeEl) {
            gradeEl.textContent = result.rating.grade;
            gradeEl.style.color = result.rating.color;
        }
    }

    // Cache result for submission
    window._carbonResult = result;
}

async function submitSurvey() {
    if (!window._carbonResult) updateResultPreview();
    const result = window._carbonResult;
    const raw = collectData();

    // Show modal
    const modal = document.getElementById('submitModal');
    if (modal) modal.classList.remove('hidden');

    try {
        const payload = {
            ...raw,
            electricity_units: result.units,
            total_co2: result.totalCO2,
            per_person_co2: result.perPersonCO2,
            electricity_co2: result.electricityCO2,
            transport_co2: result.transportCO2,
            cooking_co2: result.cookingCO2,
            appliance_co2: result.applianceCO2,
            waste_co2: result.wasteCO2,
            energy_kwh: result.energyKWh,
            trees_needed: result.treesNeeded,
            carbon_grade: result.rating.grade,
        };
        // Convert numeric strings
        ['people', 'electricity_units', 'petrol_km', 'diesel_km', 'public_km', 'ev_km',
            'lpg_cylinders', 'png_usage', 'induction_hours', 'ac_hours', 'washing_uses',
            'laptop_hours', 'tv_hours', 'waste_kg_per_day'].forEach(k => {
                if (payload[k] !== '' && payload[k] !== undefined) payload[k] = parseFloat(payload[k]) || 0;
            });

        await saveEntry(payload);

        // Success
        const spinner = document.getElementById('modalSpinner');
        const title = document.getElementById('modalTitle');
        const msg = document.getElementById('modalMsg');
        const actions = document.getElementById('modalActions');
        if (spinner) spinner.style.display = 'none';
        if (title) title.textContent = '🎉 Assessment Saved!';
        if (msg) msg.textContent = `Your carbon footprint: ${result.totalCO2} kg CO₂/month — Rating: ${result.rating.grade} (${result.rating.label})`;
        if (actions) actions.classList.remove('hidden');

        // Store in session for quick access
        sessionStorage.setItem('ct_latest', JSON.stringify(payload));
        document.getElementById('progressFill').style.width = '100%';

    } catch (err) {
        console.error(err);
        const title = document.getElementById('modalTitle');
        const msg = document.getElementById('modalMsg');
        const spinner = document.getElementById('modalSpinner');
        if (title) title.textContent = '⚠️ Save Failed';
        if (msg) msg.textContent = 'Could not connect to database. Check your internet connection and try again.';
        if (spinner) spinner.style.display = 'none';
        showToast('Failed to save data. Please try again.', 'error');
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    goToStep(0);

    // Electricity live preview
    document.getElementById('electricityBill')?.addEventListener('input', updateElecPreview);
    document.getElementById('electricityUnits')?.addEventListener('input', updateElecPreview);

    // Sidebar step click
    document.querySelectorAll('.ss-item').forEach(item => {
        item.addEventListener('click', () => {
            const s = parseInt(item.dataset.step);
            if (s < currentStep) goToStep(s);
        });
    });
});
