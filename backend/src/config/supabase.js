const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Check for required environment variables
const isConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.warn('');
  console.warn('⚠️  WARNING: Supabase not configured!');
  console.warn('   Missing SUPABASE_URL and/or SUPABASE_ANON_KEY');
  console.warn('');
  console.warn('   To fix this:');
  console.warn('   1. Copy backend/.env.example to backend/.env');
  console.warn('   2. Fill in your Supabase project credentials');
  console.warn('   3. Restart the server');
  console.warn('');
}

// Client for authenticated requests (uses user's JWT)
const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Admin client for server-side operations (bypasses RLS)
const supabaseAdmin = isConfigured && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Flag to indicate if admin client is available
const isAdminConfigured = isConfigured && !!supabaseServiceKey;

module.exports = { supabase, supabaseAdmin, isConfigured, isAdminConfigured };
