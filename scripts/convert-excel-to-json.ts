"use server";
import xlsx from "xlsx";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function convertExcelToJson(buffer: ArrayBuffer, firmaKodu: string) {
  const workbook = xlsx.read(buffer, { type: "array" }); // ✅ "array" tipi kullanıldı
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = xlsx.utils.sheet_to_json(sheet);

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

  return enriched;
}
