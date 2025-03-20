import { createClient } from "@supabase/supabase-js"

// Tüm olası çevre değişkeni isimlerini kontrol et
const getEnvVar = (names: string[]): string => {
  for (const name of names) {
    const value = process.env[name]
    if (value) return value
  }
  return ""
}

// Supabase URL'sini al
const supabaseUrl = getEnvVar([
  "NEXT_PUBLIC_SUPABASE_URL",
  "STORAGE_SUPABASE_URL",
  "MY_STORAGE_SUPABASE_URL",
  "SUPABASE_URL",
])

// Supabase anahtarını al
const supabaseAnonKey = getEnvVar([
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "STORAGE_SUPABASE_ANON_KEY",
  "MY_STORAGE_SUPABASE_ANON_KEY",
  "SUPABASE_ANON_KEY",
])

// Supabase URL'si yoksa varsayılan bir değer kullan
const defaultUrl = "https://placeholder-url.supabase.co"
const defaultKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyLXVybCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2NTAyMjY0LCJleHAiOjE5MzIwNzg2NjR9.placeholder"

// Supabase istemcisini oluştur
export const supabase = createClient(supabaseUrl || defaultUrl, supabaseAnonKey || defaultKey)

// Bağlantı durumunu kontrol etmek için yardımcı fonksiyon
export async function checkSupabaseConnection() {
  try {
    // Kullanılan çevre değişkenlerini logla
    console.log("Kullanılan Supabase URL:", supabaseUrl || "Yok")
    console.log("Supabase Anahtar Mevcut:", supabaseAnonKey ? "Evet" : "Hayır")

    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        connected: false,
        message: "Supabase bağlantı bilgileri eksik. Çevre değişkenlerini kontrol edin.",
        url: supabaseUrl || "Yok",
        keyExists: supabaseAnonKey ? true : false,
        envVars: {
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "Yok",
          NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Var" : "Yok",
          STORAGE_SUPABASE_URL: process.env.STORAGE_SUPABASE_URL || "Yok",
          STORAGE_SUPABASE_ANON_KEY: process.env.STORAGE_SUPABASE_ANON_KEY ? "Var" : "Yok",
          MY_STORAGE_SUPABASE_URL: process.env.MY_STORAGE_SUPABASE_URL || "Yok",
          MY_STORAGE_SUPABASE_ANON_KEY: process.env.MY_STORAGE_SUPABASE_ANON_KEY ? "Var" : "Yok",
        },
      }
    }

    // Basit bir sorgu deneyin
    const { data, error } = await supabase.from("Araclar").select("count", { count: "exact" }).limit(1)

    if (error) {
      throw error
    }

    return {
      connected: true,
      message: "Supabase bağlantısı başarılı",
      url: supabaseUrl,
      keyExists: true,
    }
  } catch (error: any) {
    console.error("Supabase bağlantı hatası:", error)
    return {
      connected: false,
      message: `Supabase bağlantısı başarısız: ${error.message}`,
      url: supabaseUrl || "Yok",
      keyExists: supabaseAnonKey ? true : false,
      error: error.message,
    }
  }
}

