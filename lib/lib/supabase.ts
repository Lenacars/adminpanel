import { createClient } from "@supabase/supabase-js"

// Supabase URL ve anahtarını al
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Supabase istemcisini oluştur
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "")

// Bağlantı durumunu kontrol etmek için yardımcı fonksiyon
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("Araclar").select("count", { count: "exact" }).limit(1)

    if (error) {
      throw error
    }

    return { connected: true, message: "Supabase bağlantısı başarılı" }
  } catch (error) {
    console.error("Supabase bağlantı hatası:", error)
    return {
      connected: false,
      message: "Supabase bağlantısı başarısız. Çevre değişkenlerini kontrol edin.",
    }
  }
}

