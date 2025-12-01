const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Validate URL format
const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

// Check for required environment variables with proper validation
const isConfigured = !!(isValidUrl(supabaseUrl) && supabaseAnonKey && supabaseAnonKey.length > 10);

if (!isConfigured) {
  console.warn('');
  console.warn('⚠️  WARNING: Supabase not configured!');
  console.warn('   Missing or invalid SUPABASE_URL and/or SUPABASE_ANON_KEY');
  console.warn('');
  console.warn('   To fix this:');
  console.warn('   1. Copy backend/.env.example to backend/.env');
  console.warn('   2. Fill in your Supabase project credentials');
  console.warn('   3. Restart the server');
  console.warn('');
  console.warn('   The server will continue running in limited mode.');
  console.warn('   API endpoints requiring Supabase will return errors.');
  console.warn('');
}

// Client for authenticated requests (uses user's JWT)
let supabase = null;
if (isConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Failed to create Supabase client:', error.message);
  }
}

// Admin client for server-side operations (bypasses RLS)
let supabaseAdmin = null;
if (isConfigured && supabaseServiceKey) {
  try {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch (error) {
    console.error('Failed to create Supabase admin client:', error.message);
  }
}

// Flag to indicate if admin client is available
const isAdminConfigured = isConfigured && !!supabaseServiceKey;

module.exports = { supabase, supabaseAdmin, isConfigured, isAdminConfigured };
