import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client for browser-side usage
// IMPORTANT: These environment variables need to be set in your .env.local file:
// NEXT_PUBLIC_SUPABASE_URL - Your Supabase project URL
// NEXT_PUBLIC_SUPABASE_ANON_KEY - Your Supabase anonymous (public) key

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
