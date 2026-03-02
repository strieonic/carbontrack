import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://truoxyqyzuygobiendjy.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRydW94eXF5enV5Z29iaWVuZGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NDYzNTYsImV4cCI6MjA4ODAyMjM1Nn0.ut-VKrbluGkAdAHyXvx21SguE8A3II2ng4wZBNa8sPc";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
export { SUPABASE_URL, SUPABASE_KEY };