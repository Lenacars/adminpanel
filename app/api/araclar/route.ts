import { type NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { corsHeaders } from "@/lib/cors";
import { v4 as uuidv4 } from "uuid";

// Model ismini normalize et
function normalize(str: string) {
  return String(str || "")
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
    const body = await request.json();
    console.log("➡️ API'ye gelen veri:", JSON.stringify(body, null, 2));

    // Görsel dosya listesini çek (storage'daki tüm dosyalar)
    const { data: storageList, error: storageError } = await supabase.storage
      .from("images")
      .list("", { limit: 1000 });
    if (storageError) console.error("❌ Storage hatası:", storageError);

    const files = (storageList || []).map((f) => f.name);
    console.log("🖼️ Storage'taki dosyalar:", files);

    let successCount = 0;
    let errorCount = 0;
    let enriched = [];

    for (const [idx, item] of body.entries()) {
      try {
        const {
          model,
          yakit,
          vites,
          stok_kodu,
          varyasyonlar = [],
        } = item;

        if (!model || !stok_kodu) {
          console.warn(`[${idx}] Model veya stok_kodu eksik, atlanıyor`);
          errorCount++;
          continue;
        }

        // Modelin ilk kelimesi ile eşleşme (ör. "ARONA" → "arona-head.webp")
        const modelWord = String(model).split(" ")[0];
        const modelKey = normalize(modelWord);

        // Kapak görselini bul ("arona-head.webp" veya "aronahead.webp" destekleniyor)
        const coverFile = files.find(
          (f) =>
            (f.startsWith(modelKey) && f.includes("head")) ||
            (f.replace(/-/g, "").startsWith(modelKey.replace(/-/g, "")) && f.includes("head"))
        );
        const gallery = files.filter(
          (f) =>
            (f.startsWith(modelKey) || f.replace(/-/g, "").startsWith(modelKey.replace(/-/g, ""))) &&
            !f.includes("head")
        );

        const coverImageUrl = coverFile
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${coverFile}`
          : null;
        const galleryImagesUrl = gallery.map(
          (g) =>
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${g}`
        );

        console.log(`[${idx}] Model: ${model}, Kapak: ${coverFile}, Galeri:`, gallery);

        // Aynı stok kodu var mı?
        const { data: checkExist, error: existErr } = await supabase
          .from("Araclar")
          .select("id")
          .eq("stok_kodu", stok_kodu)
          .maybeSingle();

        let aracId = checkExist?.id;

        if (!aracId) {
          // Aracı ekle
          const { data: inserted, error: insertErr } = await supabase
            .from("Araclar")
            .insert({
              isim: model,
              yakit_turu: yakit,
              vites,
              stok_kodu,
              cover_image: coverImageUrl,
              gallery_images: galleryImagesUrl,
              fiyat: Number(varyasyonlar?.[0]?.fiyat || 0) || null,
            })
            .select("id")
            .single();

          if (insertErr || !inserted?.id) {
            console.error(`[${idx}] Arac insert hatası:`, insertErr);
            errorCount++;
            continue;
          }
          aracId = inserted.id;
          console.log(`[${idx}] Araç eklendi. ID:`, aracId);
        } else {
          console.log(`[${idx}] Araç zaten var. ID:`, aracId);
        }

        // Varyasyonları ekle
        for (const varyasyon of varyasyonlar) {
          const { error: varErr } = await supabase.from("variations").insert({
            arac_id: aracId,
            fiyat: Number(varyasyon.fiyat) || 0,
            kilometre: varyasyon.km,
            sure: varyasyon.sure,
            status: "yayinda",
          });
          if (varErr) {
            console.error(`[${idx}] Varyasyon insert hatası:`, varErr);
            errorCount++;
          }
        }

        successCount++;
        enriched.push({
          ...item,
          cover_image: coverImageUrl,
          gallery_images: galleryImagesUrl,
        });
      } catch (err) {
        console.error("🚨 Model eklemede hata:", err);
        errorCount++;
      }
    }

    return NextResponse.json(
      {
        message: `Yükleme tamamlandı. ${successCount} model işlendi, ${errorCount} hata.`,
        enriched,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("🔥 Genel API hatası:", error);
    return NextResponse.json(
      { error: error.message || "Bilinmeyen sunucu hatası" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
