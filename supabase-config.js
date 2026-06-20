// IMPORTANT: Replace these placeholders with your actual Supabase project details!
// You can find these in the Supabase Dashboard under Project Settings > API
const SUPABASE_URL = 'https://quzywzmblhpfmkptwmyb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1enl3em1ibGhwZm1rcHR3bXliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMDI5NzIsImV4cCI6MjA5NjY3ODk3Mn0.1yfhMdCr8zIDtmfc_5GDwQe5h8fkZXgBkFmGjq1g2Fc';

// Initialize Supabase Client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
