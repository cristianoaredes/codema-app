import { supabase } from "./client";
import { nodeSupabase } from "./node-client";

// Use nodeSupabase when available (Node.js environment), otherwise use supabase (browser environment)
export const dbClient = typeof process !== 'undefined' && process.env ? nodeSupabase : supabase;
