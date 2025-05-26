import { type NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { corsHeaders } from "@/lib/cors";
import { v4 as uuidv4 } from "uuid";

// Yardımcı: Türkçe karakterleri normalize et (model dosya ismi için)
function normalize(str: string) {
  return str
    .toLowerCase()
    .replace(/ş/g, "s").replace(/ı/g, "i").replace(/ö/g, "o")
    .replace(/ü/g, "u").replace(/ç/g, "c").replace(/ğ/g, "g")
    .replace(/[^a-z0-9]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json(); // Array of araçlar
    console.log("📥 Gelen JSON body:", body);

    let successCount = 0;
    let errorCount = 0;
    let enriched = [];

    // Storage'daki tüm görsel dosyalarını bir kez çekelim
    const { data: storageList, error: storageError } = await supabase.storage
      .from("images")
      .list("", { limit: 1000 });

    if (storageError) {
      console.error("🛑 Storage hatası:", storageError);
    }
    const files = (storageList || []).map((f) => f.name);

    for (const [idx, item] of body.entries()) {
      try {
        const {
          model,
          yakit,
          vites,
          stok_kodu,
          varyasyonlar = []
        } = item;

        console.log(`\n\n🚗 [${idx}] Model işleniyor:`, model, "| Stok:", stok_kodu);

        // Model adından "anahtar" üret
        const baseModel = model?.toString().split(" ")[0]?.toLowerCase() || "";
        const modelKey = normalize(baseModel);
        console.log(`🔑 ModelKey: ${modelKey}`);

        // Cover görseli arona-head.webp (örn: arona-head.webp)
        const coverFile = files.find(
          (f) => f.startsWith(modelKey) && f.includes("head")
        );
        // Galeri: model adı geçen ama cover olmayan tüm görseller
        const gallery = files
          .filter(
            (f) =>
              f.startsWith(modelKey) &&
              !f.includes("head")
          );

        const coverImageUrl = coverFile
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${coverFile}`
          : null;

        const galleryImagesUrl = gallery.map(
          (g) =>
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${g}`
        );

        console.log("📸 Cover:", coverImageUrl);
        console.log("🖼️ Gallery:", galleryImagesUrl);

        // Aynı stok kodu var mı diye kontrol
        const { data: checkExist, error: checkErr } = await supabase
          .from("Araclar")
          .select("id")
          .eq("stok_kodu", stok_kodu)
          .maybeSingle();

        let aracId = checkExist?.id;

        if (!aracId) {
          // Yeni araç ekle
          const { data: inserted, error: insertErr } = await supabase
            .from("Araclar")
            .insert({
              isim: model,
              yakit_turu: yakit,
              vites,
              stok_kodu,
              cover_image: coverImageUrl,
              gallery_images: galleryImagesUrl,
              fiyat: Number(varyasyonlar?.[0]?.fiyat || 0) || null, // ana fiyat opsiyonel
            })
            .select("id")
            .single();

          if (insertErr || !inserted?.id) {
            errorCount++;
            console.error(`❌ Araç eklenemedi: ${model} (${stok_kodu}) | Hata:`, insertErr);
            continue;
          }
          aracId = inserted.id;
          console.log(`✅ Araç eklendi, ID: ${aracId}`);
        } else {
          console.log("ℹ️ Zaten kayıtlı araç, yeni varyasyon ekleniyor:", aracId);
        }

        // Varyasyonları kaydet
        for (const varyasyon of varyasyonlar) {
          const { error: varErr } = await supabase.from("variations").insert({
            arac_id: aracId,
            fiyat: Number(varyasyon.fiyat) || 0,
            kilometre: varyasyon.km,
            sure: varyasyon.sure,
            status: "yayinda",
          });
          if (varErr) {
            console.error("🟠 Varyasyon insert hatası:", varErr, varyasyon);
          } else {
            console.log("🟢 Varyasyon kaydedildi:", varyasyon);
          }
        }

        successCount++;
        enriched.push({
          ...item,
          cover_image: coverImageUrl,
          gallery_images: galleryImagesUrl,
        });
      } catch (err) {
        errorCount++;
        console.error("🔴 İşlenemeyen kayıt:", err);
      }
    }

    console.log(`🟩 İşlem tamam: ${successCount} model, ${errorCount} hata`);

    return NextResponse.json(
      {
        message: `Yükleme tamamlandı. ${successCount} model işlendi, ${errorCount} hata.`,
        enriched,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("❌ Genel API hatası:", error);
    return NextResponse.json(
      { error: error.message || "Bilinmeyen sunucu hatası" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
