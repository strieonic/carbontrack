import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://truoxyqyzuygobiendjy.supabase.co";
// Get your actual anon key from: https://supabase.com/dashboard/project/truoxyqyzuygobiendjy/settings/api
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRydW94eXF5enV5Z29iaWVuZGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4MzYwMDAsImV4cCI6MjA1MTQxMjAwMH0.PLACEHOLDER_REPLACE_WITH_YOUR_ACTUAL_KEY";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
export { SUPABASE_URL, SUPABASE_KEY };