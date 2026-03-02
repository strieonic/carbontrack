import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://truoxyqyzuygobiendjy.supabase.co";
const SUPABASE_KEY = "sb_publishable_C7Ga5_olAex6XAbMZ_Bqhw_DfaEdwID";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
export { SUPABASE_URL, SUPABASE_KEY };