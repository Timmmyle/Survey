import { createClient } from '@supabase/supabase-js';

// ==========================================
// SUPABASE CLIENT V1 — Vòng 1: Khảo sát nhu cầu
// ==========================================
const v1Url = import.meta.env.VITE_SUPABASE_URL || '';
const v1Key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean =>
  !!(v1Url && v1Key && v1Url.startsWith('http') && !v1Url.includes('placeholder'));

export const supabase = createClient(
  isSupabaseConfigured() ? v1Url : 'https://placeholder-project.supabase.co',
  isSupabaseConfigured() ? v1Key : 'placeholder-anon-key'
);

// ==========================================
// SUPABASE CLIENT V2 — Vòng 2: Kiểm chứng bộ nhận diện
// ==========================================
const v2Url = import.meta.env.VITE_SUPABASE_V2_URL || '';
const v2Key = import.meta.env.VITE_SUPABASE_V2_ANON_KEY || '';

export const isSupabaseV2Configured = (): boolean =>
  !!(v2Url && v2Key && v2Url.startsWith('http') && !v2Url.includes('YOUR_V2_PROJECT'));

export const supabaseV2 = createClient(
  isSupabaseV2Configured() ? v2Url : 'https://placeholder-project.supabase.co',
  isSupabaseV2Configured() ? v2Key : 'placeholder-anon-key'
);
