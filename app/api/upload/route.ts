// adminpanel-main/app/api/upload/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import * as Papa from "papaparse";

// Supabase bağlantısı
const supabase = createClient(
  process.env.SUPABASE_URL!,
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

  const araclar: any[] = [];
  const variations: any[] = [];

  for (const row of rows) {
    const stok_kodu = row["Stok kodu (SKU)"]?.trim();
    const isim = row["İsim"]?.trim();
    const normal_fiyat = parseFloat(row["Normal fiyat"]) || null;
    const aciklama = row["Açıklama"]?.trim() || "";

    if (!stok_kodu || !isim) continue;

    // Araç daha önce eklenmiş mi kontrol et
    const { data: existingProduct } = await supabase
      .from("Araclar")
      .select("id")
      .eq("stok_kodu", stok_kodu)
      .maybeSingle();

    let arac_id = existingProduct?.id;

    // Yeni araçsa listeye ekle
    if (!arac_id) {
      arac_id = uuidv4();
      araclar.push({
        id: arac_id,
        isim,
        stok_kodu,
        aciklama,
        fiyat: normal_fiyat,
      });
    }

    // Varyasyon bilgileri
    const kilometre = row["Nitelik 4 değer(ler)i"]?.trim();
    const sure = row["Nitelik 5 değer(ler)i"]?.trim();
    const varyasyon_fiyat = parseFloat(row["Normal fiyat"]) || 0;

    if (kilometre && sure) {
      variations.push({
        id: uuidv4(),
        arac_id, // doğru kolon adı
        kilometre,
        sure,
        fiyat: varyasyon_fiyat,
        status: "Yayında",
      });
    }
  }

  // Veritabanına verileri ekle
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
