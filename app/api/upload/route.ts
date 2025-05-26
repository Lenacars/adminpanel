import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import * as Papa from "papaparse";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file: File | null = formData.get("file") as unknown as File;

    if (!file) {
      console.error("❌ Dosya bulunamadı");
      return NextResponse.json({ error: "CSV dosyası bulunamadı" }, { status: 400 });
    }

    const text = await file.text();
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    const rows = parsed.data as any[];

    console.log("📄 Satır sayısı:", rows.length);

    // Supabase Storage -> images klasöründen tüm dosyaları al
    const { data: storageList, error: storageError } = await supabase
      .storage
      .from("images")
      .list("", { limit: 1000 });

    if (storageError) {
      console.error("❌ Görsel listesi alınamadı:", storageError);
    }

    const files = (storageList || []).map((f) => f.name);
    const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/`;

    function normalize(str: string) {
      return str
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .trim();
    }

    const araclar: any[] = [];
    const variations: any[] = [];
    const stokKoduSet = new Set<string>();
    let index = 1001;

    for (const row of rows) {
      try {
        const stok_kodu = row["Stok kodu (SKU)"]?.trim();
        const isim = row["İsim"]?.trim();
        const normal_fiyat = parseFloat(row["Normal fiyat"]) || null;
        const aciklama = row["Açıklama"]?.trim() || "";

        if (!stok_kodu || !isim) {
          console.warn("⏭️ Eksik veri:", row);
          continue;
        }

        if (stokKoduSet.has(stok_kodu)) continue;
        stokKoduSet.add(stok_kodu);

        const { data: existingProduct, error: lookupErr } = await supabase
          .from("Araclar")
          .select("id")
          .eq("stok_kodu", stok_kodu)
          .maybeSingle();

        if (lookupErr) {
          console.error("❌ Arac kontrol hatası:", lookupErr);
          continue;
        }

        let arac_id = existingProduct?.id;

        const modelKey = normalize(isim);
        const cover = files.find((f) => f === `${modelKey}-head.webp`);
        const gallery = files
          .filter((f) => f.startsWith(`${modelKey}-`) && f !== `${modelKey}-head.webp`)
          .map((f) => baseUrl + f);

        if (!arac_id) {
          arac_id = uuidv4();
          araclar.push({
            id: arac_id,
            isim,
            stok_kodu,
            aciklama,
            fiyat: normal_fiyat,
            cover_image: cover ? baseUrl + cover : null,
            gallery_images: gallery,
          });
          console.log(`🚗 Yeni araç eklendi: ${stok_kodu}`);
        }

        const kilometre = row["Nitelik 4 değer(ler)i"]?.trim();
        const sure = row["Nitelik 5 değer(ler)i"]?.trim();
        const varyasyon_fiyat = parseFloat(row["Normal fiyat"]) || 0;

        if (kilometre && sure) {
          variations.push({
            id: uuidv4(),
            arac_id,
            kilometre,
            sure,
            fiyat: varyasyon_fiyat,
            status: "Yayında",
          });
        }
      } catch (innerErr) {
        console.error("⛔ Satır işleme hatası:", innerErr);
      }
    }

    if (araclar.length > 0) {
      const { error: insertAracError } = await supabase.from("Araclar").insert(araclar);
      if (insertAracError) console.error("🚨 Araç ekleme hatası:", insertAracError);
    }

    if (variations.length > 0) {
      const { error: insertVarError } = await supabase.from("variations").insert(variations);
      if (insertVarError) console.error("🚨 Varyasyon ekleme hatası:", insertVarError);
    }

    return NextResponse.json({
      message: "✅ CSV'den yükleme tamamlandı.",
      urun_sayisi: araclar.length,
      varyasyon_sayisi: variations.length,
    });

  } catch (err) {
    console.error("❌ Genel hata:", err);
    return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
  }
}
