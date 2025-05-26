// adminpanel-main/app/api/upload/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import * as Papa from "papaparse";

// Supabase bağlantısı
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file: File | null = formData.get("file") as unknown as File;

  if (!file) {
    return NextResponse.json({ error: "CSV dosyası bulunamadı" }, { status: 400 });
  }

  const text = await file.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  const rows = parsed.data as any[];

  // Supabase Storage'tan tüm görselleri çek
  const { data: storageList } = await supabase.storage
    .from("images")
    .list("", { limit: 1000 });

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
    const stok_kodu = row["Stok kodu (SKU)"]?.trim();
    const isim = row["İsim"]?.trim();
    const normal_fiyat = parseFloat(row["Normal fiyat"]) || null;
    const aciklama = row["Açıklama"]?.trim() || "";

    if (!stok_kodu || !isim) continue;
    if (stokKoduSet.has(stok_kodu)) continue;
    stokKoduSet.add(stok_kodu);

    // Supabase'te bu araç var mı kontrol et
    const { data: existingProduct } = await supabase
      .from("Araclar")
      .select("id")
      .eq("stok_kodu", stok_kodu)
      .maybeSingle();

    let arac_id = existingProduct?.id;

    // Görsel eşleştirme
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
    }

    // Varyasyonlar
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
  }

  // Veritabanına ekleme
  if (araclar.length > 0) {
    await supabase.from("Araclar").insert(araclar);
  }

  if (variations.length > 0) {
    await supabase.from("variations").insert(variations);
  }

  return NextResponse.json({
    message: "✅ CSV'den yükleme tamamlandı.",
    urun_sayisi: araclar.length,
    varyasyon_sayisi: variations.length,
  });
}
