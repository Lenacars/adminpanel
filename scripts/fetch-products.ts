// scripts/fetch-products.ts
import axios from "axios"
import { createClient } from "@supabase/supabase-js"
import "dotenv/config"

// WooCommerce API bilgileri
const wooApiUrl = process.env.WOOCOMMERCE_API_URL
const wooKey = process.env.WOOCOMMERCE_CONSUMER_KEY
const wooSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET

// Supabase bilgileri
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Supabase bağlantısı
const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

const fetchWooProducts = async () => {
  let page = 1
  let allProducts: any[] = []

  console.log("🔄 WooCommerce ürünleri çekiliyor...")

  while (true) {
    const { data } = await axios.get(`${wooApiUrl}/products`, {
      auth: {
        username: wooKey!,
        password: wooSecret!,
      },
      params: {
        per_page: 100,
        page,
      },
    })

    if (data.length === 0) break

    allProducts.push(...data)
    page++
  }

  console.log(`✅ Toplam ürün sayısı: ${allProducts.length}`)
  return allProducts
}

const syncToSupabase = async () => {
  try {
    const products = await fetchWooProducts()

    for (const product of products) {
      const { id, name, price } = product
      const { error } = await supabase.from("Araclar").upsert({
        woo_id: id,
        isim: name,
        fiyat: parseFloat(price || 0),
      })

      if (error) {
        console.error(`❌ Ürün aktarım hatası (ID: ${id}):`, error.message)
      }
    }

    console.log("🎉 Tüm ürünler Supabase'e başarıyla aktarıldı.")
  } catch (error) {
    console.error("❌ Genel hata:", error)
  }
}

syncToSupabase()
