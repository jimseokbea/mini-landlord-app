import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase env vars missing. Check web/.env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// This code initializes a Supabase client using the provided URL and anonymous key.
// It checks if the environment variables for Supabase URL and key are set, throwing an error
