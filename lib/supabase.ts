import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Normal kullanıcılar için
export const supabase = createClient(supabaseUrl, anonKey);

// Admin (backend işlemleri) için
export const supabaseAdmin = createClient(supabaseUrl, serviceKey);
