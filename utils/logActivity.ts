import { supabase } from "@/lib/supabase";

export async function logActivity(islem: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: calisan } = await supabase
    .from("calisanlar")
    .select("ad, soyad, rol")
    .eq("auth_user_id", user.id)
    .single();

  if (!calisan) return;

  await supabase.from("calisan_aktiviteleri").insert([
    {
      user_id: user.id,
      email: user.email,
      full_name: `${calisan.ad} ${calisan.soyad}`,
      rol: calisan.rol,
      islem,
    },
  ]);
}
