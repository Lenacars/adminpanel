"use server";
import xlsx from "xlsx";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function convertExcelToJson(buffer: Buffer, firmaKodu: string) {
  const workbook = xlsx.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = xlsx.utils.sheet_to_json(sheet);

  // Storage'daki tüm görselleri çek
  const { data: storageList, error: storageError } = await supabase.storage
    .from("images")
    .list("", { limit: 1000 });

  if (storageError) {
    throw new Error("Supabase Storage görselleri okunamadı.");
  }

  const files = (storageList || []).map((f) => f.name);
  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/`;

  // Excel satırlarını gruplama
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

    // Modeli normalize et: örn. 'arona'
    const anahtar = model
      .toLocaleLowerCase("tr-TR")
      .replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ]/gi, " ")
      .split(" ")
      .filter(Boolean)
      .find((word) => word.length > 2);

    if (!anahtar) continue;

    // Gruplama anahtarı olarak sadece model adını kullanıyoruz
    const key = anahtar;

    if (!grouped[key]) {
      grouped[key] = {
        model,
        yakit,
        vites,
        varyasyonlar: [],
        stok_kodu: `${firmaKodu}${String(index).padStart(5, "0")}`,
      };
      index++;
    }

    grouped[key].varyasyonlar.push({ sure, km, fiyat });
  }

  // Her model için kapak ve galeri görseli bul
  for (const key of Object.keys(grouped)) {
    const anahtar = key;
    // 'arona-head.webp' gibi olanı kapak olarak bul
    const cover = files.find(
      (f) => f.toLocaleLowerCase("tr-TR").includes(anahtar) && f.toLocaleLowerCase("tr-TR").includes("head")
    );

    // 'arona' içeren ama 'head' olmayanlar galeriye eklenir
    const gallery = files
      .filter(
        (f) =>
          f.toLocaleLowerCase("tr-TR").includes(anahtar) &&
          !f.toLocaleLowerCase("tr-TR").includes("head")
      )
      .map((f) => baseUrl + f);

    grouped[anahtar].cover_image = cover ? baseUrl + cover : null;
    grouped[anahtar].gallery_images = gallery;
  }

  // Sonuç JSON
  const enriched = Object.values(grouped);

  return enriched;
}
