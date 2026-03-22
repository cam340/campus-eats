import { createClient } from '@supabase/supabase-js';

// Replace these with actual Supabase project keys in a real environment
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
