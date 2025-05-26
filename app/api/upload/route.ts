import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as xlsx from "xlsx";

// Supabase bağlantısı
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // FormData'dan dosya ve firma kodunu al
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;
    const firma = formData.get("firma") as string | null;

    if (!file || !firma) {
      console.error("Dosya veya firma kodu eksik");
      return NextResponse.json({ error: "Eksik dosya veya firma" }, { status: 400 });
    }

    // Dosyayı arrayBuffer ile oku
    const arrayBuffer = await file.arrayBuffer();
    console.log("Dosya buffer okundu:", arrayBuffer.byteLength, "byte");

    // Excel'i JSON'a çevir
    const workbook = xlsx.read(arrayBuffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);
    console.log("Excel satırları:", rows.length);

    // Görsel listesini Supabase storage'dan çek
    const { data: storageList, error: storageError } = await supabase
      .storage
      .from("images")
      .list("", { limit: 1000 });
    if (storageError) console.error("Storage list hatası:", storageError);

    const files = (storageList || []).map((f) => f.name);
    const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/`;

    function normalize(str: string) {
      return String(str)
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .trim();
    }

    // Excel'den Supabase formatına dönüştür
    const grouped: Record<string, any> = {};
    let index = 1001;

    for (const row of rows) {
      const model = String(row["Marka / Model"] || "").trim();
      const sure = String(row["Süre (Ay)"] || "").trim();
      const yakit = String(row["Yakıt Tipi"] || "").trim();
      const vites = String(row["Vites"] || "").trim();
      const km = String(row["Km / Yıl"] || "").trim();
      const fiyat = String(row["Kiralama Bedeli *"] || "").trim();

      if (!model || !fiyat) continue;
      const key = `${normalize(model)}__${normalize(yakit)}__${normalize(vites)}`;
      if (!grouped[key]) {
        grouped[key] = {
          model,
          yakit,
          vites,
          varyasyonlar: [],
          stok_kodu: `${firma}${String(index).padStart(5, "0")}`,
        };
        index++;
      }
      grouped[key].varyasyonlar.push({ sure, km, fiyat });
    }

    // Görselleri ekle
    const enriched = Object.values(grouped).map((item: any) => {
      const modelKey = normalize(item.model);
      const cover = files.find((f) => f === `${modelKey}-head.webp`);
      const gallery = files
        .filter((f) => f.startsWith(`${modelKey}-`) && f !== `${modelKey}-head.webp`)
        .map((f) => baseUrl + f);

      return {
        ...item,
        cover_image: cover ? baseUrl + cover : null,
        gallery_images: gallery,
      };
    });

    // Burada doğrudan Supabase tablosuna yazma örneği yok, veriyi döndürüyoruz.
    // İstersen buradan sonra Supabase'e ekleyebilirsin (toplu insert).

    console.log("İşlenen kayıtlar:", enriched.length);
    return NextResponse.json({
      message: `Yükleme tamamlandı. ${enriched.length} model işlendi.`,
      enriched,
    });

  } catch (err: any) {
    console.error("🔥 API'da hata:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
