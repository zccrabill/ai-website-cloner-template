import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Initialize Supabase client for browser-side usage
// Set these in your Netlify env vars (or .env.local for local dev):
// NEXT_PUBLIC_SUPABASE_URL - Your Supabase project URL
// NEXT_PUBLIC_SUPABASE_ANON_KEY - Your Supabase anonymous (public) key

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create client even with empty strings — guards in components handle missing config
export const supabase: SupabaseClient = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder"
);
