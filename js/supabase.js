import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://truoxyqyzuygobiendjy.supabase.co";
// Note: Replace this with your actual Supabase anon key from your project settings
// The key should start with "eyJ..." and be much longer
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRydW94eXF5enV5Z29iaWVuZGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTAwMDAwMDAsImV4cCI6MTg0NzY4MDAwMH0.PLACEHOLDER_SIGNATURE";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
export { SUPABASE_URL, SUPABASE_KEY };