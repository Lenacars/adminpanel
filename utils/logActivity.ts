import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

export async function logActivity({
  user_id,
  email,
  full_name,
  rol,
  islem,
}: {
  user_id: string;
  email: string;
  full_name: string;
  rol: string;
  islem: string;
}) {
  try {
    await supabase.from("calisan_aktiviteleri").insert([
      {
        user_id,
        email,
        full_name,
        rol,
        islem,
      },
    ]);
  } catch (error) {
    console.error("Aktivite log hatası:", error);
  }
}
