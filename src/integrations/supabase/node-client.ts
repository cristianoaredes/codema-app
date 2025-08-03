import { createClient } from '@supabase/supabase-js';
import type { Database } from './generated-types';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// For Node.js environments, use process.env instead of import.meta.env
// In browser environments, fall back to default values
const SUPABASE_URL = isBrowser 
  ? "https://aqvbhmpdzvdbhvxhnemi.supabase.co" 
  : (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://aqvbhmpdzvdbhvxhnemi.supabase.co");

const SUPABASE_SERVICE_KEY = isBrowser 
  ? null 
  : process.env.SUPABASE_SERVICE_ROLE_KEY;

// Determine which key to use
let supabaseKey: string;

// Validate that we have the service role key for seeding operations
if (!SUPABASE_SERVICE_KEY) {
  if (!isBrowser) {
    // Only show warnings in Node.js environment
    console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not found in environment variables.');
    console.warn('   For seeding operations, you need to add your service role key to .env.local:');
    console.warn('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
    console.warn('   You can find this key in your Supabase dashboard under Settings > API');
    console.warn('   Using anon key as fallback - seeding may fail due to RLS policies.');
  }
  
  // Fallback to anon key
  const ANON_KEY = isBrowser 
    ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxdmJobXBkenZkYmh2eGhuZW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0Mzg0MTksImV4cCI6MjA2ODAxNDQxOX0.3_l3DA0TOA8afMr-i-Hgv8TrUQYiETYFhIEVTsRHZnM"
    : (process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxdmJobXBkenZkYmh2eGhuZW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0Mzg0MTksImV4cCI6MjA2ODAxNDQxOX0.3_l3DA0TOA8afMr-i-Hgv8TrUQYiETYFhIEVTsRHZnM");
  supabaseKey = ANON_KEY;
} else {
  if (!isBrowser) {
    console.log('✅ Using service role key for Supabase operations');
  }
  supabaseKey = SUPABASE_SERVICE_KEY;
}

// Use service key for bypassing RLS in Node.js environments
export const nodeSupabase = createClient<Database>(SUPABASE_URL, supabaseKey);
