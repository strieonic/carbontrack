/**
 * Carbon Footprint Calculation Engine
 * All emission factors are in kg CO2 equivalent
 */

// Emission factors
const EF = {
    // Electricity: India average grid (kg CO2/kWh)
    electricity: 0.82,

    // Transport (kg CO2/km)
    petrol: 0.192,
    diesel: 0.171,
    publicBus: 0.089,
    ev: 0.041, // India grid-adjusted EV

    // Cooking (kg CO2/unit)
    lpg: 51.5,  // per cylinder (~14.2 kg)
    png: 2.1,   // per cubic meter
    induction: 0.82,  // per hour (via electricity)

    // Appliances (kg CO2/hour unless noted)
    ac: 0.985,  // 1.2kW avg AC
    refrigerator: 0.394, // per day (24h always on)
    washingMachine: 0.656, // per use (0.8kWh)
    laptop: 0.082,
    tv: 0.131,

    // Waste (kg CO2/kg waste)
    wasteUnsegregated: 0.5,
    wasteSegregated: 0.2,
};

/**
 * Calculate monthly carbon footprint in kg CO2
 */
export function calculateCarbon(data) {
    const {
        electricityBill, electricityUnits,
        petrolKm, dieselKm, publicKm, evKm,
        lpgCylinders, pngUsage, inductionHours,
        acHours, hasRefrigerator, washingUses, laptopHours, tvHours,
        wasteKgPerDay, hasSegregation,
        people,
        days = 30,
    } = data;

    // Electricity
    let units = parseFloat(electricityUnits) || 0;
    if (!units && electricityBill) {
        units = parseFloat(electricityBill) / 8; // bill ÷ 8 = approximate units
    }
    const electricityCO2 = units * EF.electricity;

    // Transport (monthly totals)
    const transportCO2 =
        (parseFloat(petrolKm) || 0) * EF.petrol +
        (parseFloat(dieselKm) || 0) * EF.diesel +
        (parseFloat(publicKm) || 0) * EF.publicBus +
        (parseFloat(evKm) || 0) * EF.ev;

    // Cooking
    const cookingCO2 =
        (parseFloat(lpgCylinders) || 0) * EF.lpg +
        (parseFloat(pngUsage) || 0) * EF.png +
        (parseFloat(inductionHours) || 0) * days * EF.induction;

    // Appliances (daily hours × 30 days)
    const applianceCO2 =
        (parseFloat(acHours) || 0) * days * EF.ac +
        (hasRefrigerator ? EF.refrigerator * days : 0) +
        (parseFloat(washingUses) || 0) * 4 * EF.washingMachine + // uses/week × 4 weeks
        (parseFloat(laptopHours) || 0) * days * EF.laptop +
        (parseFloat(tvHours) || 0) * days * EF.tv;

    // Waste
    const wasteDaily = parseFloat(wasteKgPerDay) || 0;
    const wasteFactor = hasSegregation ? EF.wasteSegregated : EF.wasteUnsegregated;
    const wasteCO2 = wasteDaily * days * wasteFactor;

    const totalCO2 = electricityCO2 + transportCO2 + cookingCO2 + applianceCO2 + wasteCO2;
    const numPeople = parseInt(people) || 1;
    const perPersonCO2 = totalCO2 / numPeople;
    const treesNeeded = Math.ceil(totalCO2 / 21.77); // avg tree absorbs 21.77 kg CO2/month
    const energyKWh = units + ((parseFloat(acHours) || 0) * days * 1.5);

    return {
        totalCO2: Math.round(totalCO2 * 10) / 10,
        perPersonCO2: Math.round(perPersonCO2 * 10) / 10,
        electricityCO2: Math.round(electricityCO2 * 10) / 10,
        transportCO2: Math.round(transportCO2 * 10) / 10,
        cookingCO2: Math.round(cookingCO2 * 10) / 10,
        applianceCO2: Math.round(applianceCO2 * 10) / 10,
        wasteCO2: Math.round(wasteCO2 * 10) / 10,
        energyKWh: Math.round(energyKWh * 10) / 10,
        treesNeeded,
        rating: getCarbonRating(perPersonCO2),
        units: Math.round(units * 10) / 10,
    };
}

/**
 * Carbon rating based on per-person monthly CO2 (kg)
 * India average: ~100 kg/person/month
 */
export function getCarbonRating(perPersonKg) {
    if (perPersonKg < 50) return { grade: 'A+', label: 'Excellent', color: '#48c78e', emoji: '🌿' };
    if (perPersonKg < 80) return { grade: 'A', label: 'Good', color: '#3dd9b3', emoji: '✅' };
    if (perPersonKg < 120) return { grade: 'B', label: 'Average', color: '#f59e0b', emoji: '⚡' };
    if (perPersonKg < 180) return { grade: 'C', label: 'High', color: '#f97316', emoji: '⚠️' };
    return { grade: 'D', label: 'Critical', color: '#ef4444', emoji: '🔴' };
}

/**
 * Get percentage change between two values
 */
export function getChange(current, previous) {
    if (!previous || previous === 0) return null;
    const diff = current - previous;
    const pct = (diff / previous) * 100;
    return {
        diff: Math.round(diff * 10) / 10,
        pct: Math.round(pct * 10) / 10,
        improved: diff < 0,
    };
}
