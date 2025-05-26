"use server";

import xlsx from "xlsx";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function convertExcelToJson(buffer: Buffer, firmaKodu: string) {
  // 1. Excel verisini oku
  const workbook = xlsx.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = xlsx.utils.sheet_to_json(sheet);

  // 2. Storage'dan tüm görselleri al
  const { data: storageList, error } = await supabase.storage
    .from("images")
    .list("", { limit: 1000 });

  const files = (storageList || []).map((f) => f.name);
  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/`;

  // 3. Slugify fonksiyonu
  function normalize(str: string) {
    return str
      .toLocaleLowerCase("tr")
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ş/g, "s")
      .replace(/ü/g, "u")
      .replace(/[^a-z0-9]/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .trim();
  }

  // 4. Grup oluştur
  const grouped: Record<string, any> = {};
  let index = 1001;

  for (const row of raw) {
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
        isim: model,
        yakit_turu: yakit,
        vites,
        stok_kodu: `${firmaKodu}${String(index).padStart(5, "0")}`,
        segment: "",
        brand: "",
        category: "",
        durum: "",
        bodyType: "",
        aciklama: "",
        kisa_aciklama: "",
        gallery_images: [],
        cover_image: null,
        varyasyonlar: [],
      };
      index++;
    }

    grouped[key].varyasyonlar.push({
      sure,
      kilometre: km,
      fiyat,
      status: "Aktif",
    });
  }

  // 5. Görsel eşleştirme
  const enriched = Object.values(grouped).map((item: any) => {
    const slug = normalize(item.isim);
    const cover = files.find((f) => f === `${slug}-head.webp`);
    const gallery = files
      .filter((f) => f.startsWith(`${slug}-`) && f !== `${slug}-head.webp`)
      .map((f) => baseUrl + f);

    return {
      ...item,
      cover_image: cover ? baseUrl + cover : null,
      gallery_images: gallery,
    };
  });

  return enriched;
}
