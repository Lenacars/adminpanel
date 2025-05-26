import { type NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { corsHeaders } from "@/lib/cors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("📥 Gelen veri:", JSON.stringify(body, null, 2));

    let successCount = 0;

    for (const item of body) {
      const { model, yakit, vites, stok_kodu, cover_image, gallery_images, varyasyonlar } = item;
      console.log("🛠️ İşleniyor:", { model, stok_kodu, yakit, vites });

      if (!model || !stok_kodu || !Array.isArray(varyasyonlar)) {
        console.warn("⚠️ Eksik veya hatalı veri:", { model, stok_kodu, varyasyonlar });
        continue;
      }

      const { data: arac, error: aracError } = await supabase
        .from("Araclar")
        .insert({
          isim: model,
          yakit_turu: yakit,
          vites,
          stok_kodu,
          cover_image: cover_image?.replace(/^\/+/, ""),
          gallery_images: gallery_images?.map((img: string) => img.replace(/^\/+/, "")) || [],
        })
        .select()
        .single();

      if (aracError || !arac) {
        console.error("❌ Araç eklenemedi:", aracError?.message || "Veri gelmedi");
        continue;
      }

      console.log("✅ Araç eklendi:", arac.id);

      const variationInsert = varyasyonlar.map((v: any, i: number) => {
        const parsedFiyat = parseFloat(v.fiyat);
        if (isNaN(parsedFiyat)) {
          console.warn(`⛔ Hatalı fiyat (satır ${i}):`, v.fiyat);
        }

        return {
          arac_id: arac.id,
          fiyat: isNaN(parsedFiyat) ? 0 : parsedFiyat,
          kilometre: v.km || "",
          sure: v.sure || "",
          status: "yayinda",
        };
      });

      const { error: varError } = await supabase
        .from("variations")
        .insert(variationInsert);

      if (varError) {
        console.error("❌ Varyasyonlar eklenemedi:", varError.message);
        continue;
      }

      console.log(`📦 ${variationInsert.length} varyasyon eklendi.`);
      successCount++;
    }

    return NextResponse.json({ message: `✅ ${successCount} ürün başarıyla yüklendi.` }, { headers: corsHeaders });

  } catch (error: any) {
    console.error("🔥 Genel sunucu hatası:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
