import supabase from './supabase.js';
import deviceID from './device.js';

const TABLE = 'carbon_entries';

/**
 * Insert a new carbon entry for this device
 */
export async function saveEntry(data) {
    const payload = { device_id: deviceID, ...data, created_at: new Date().toISOString() };
    const { data: result, error } = await supabase.from(TABLE).insert([payload]).select();
    if (error) throw error;
    return result[0];
}

/**
 * Fetch all entries for this device, newest first
 */
export async function fetchEntries(limit = 12) {
    const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('device_id', deviceID)
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) throw error;
    return data || [];
}

/**
 * Fetch the latest entry for this device
 */
export async function fetchLatest() {
    const entries = await fetchEntries(1);
    return entries[0] || null;
}

/**
 * Fetch the two most recent entries (for comparison)
 */
export async function fetchLastTwo() {
    const entries = await fetchEntries(2);
    return { current: entries[0] || null, previous: entries[1] || null };
}

/**
 * Fetch last N entries for trend chart
 */
export async function fetchTrend(n = 6) {
    const { data, error } = await supabase
        .from(TABLE)
        .select('total_co2, energy_kwh, created_at')
        .eq('device_id', deviceID)
        .order('created_at', { ascending: true })
        .limit(n);
    if (error) throw error;
    return data || [];
}
