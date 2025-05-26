"use server";
import xlsx from "xlsx";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function modelKeyFromModel(model: string): string {
  // Modelin anahtar kelimesini (örneğin 'arona', 'corolla', 'focus') bul
  const lower = model.toLocaleLowerCase("tr-TR");
  // Türkçe karakterleri sadeleştir
  const simple = lower
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
  // Kelimeleri ayırıp marka ismini atla, ikinci veya üçüncü kelime model oluyor genelde
  const parts = simple.split(/\s+/).filter(Boolean);
  // Genellikle marka + model + paket şeklinde olur
  if (parts.length > 1) {
    // "seat arona", "opel corsa", "ford focus"
    return parts[1];
  }
  return parts[0]; // fallback
}

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

  // Dosya isimlerini sadeleştir
  const files = (storageList || []).map((f) => f.name.toLocaleLowerCase("tr-TR"));
  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/`;

  const grouped: Record<string, any> = {};
  let index = 1001;

  for (const row of raw) {
    const model = String(row["Marka / Model"] || "").trim();
    if (!model) continue;
    const key = modelKeyFromModel(model);

    const sure = String(row["Süre (Ay)"] || "").trim();
    const yakit = String(row["Yakıt Tipi"] || "").trim();
    const vites = String(row["Vites"] || "").trim();
    const km = String(row["Km / Yıl"] || "").trim();
    const fiyat = String(row["Kiralama Bedeli *"] || "").trim();

    if (!fiyat) continue;

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

  // Her model için görsel bulma - log ekliyoruz!
  for (const key of Object.keys(grouped)) {
    // Tüm dosya isimlerini küçük harf ve tireli yapıyoruz
    // Kapak: "{modelKey}-head.webp"
    // Galeri: "{modelKey}-(herşey).webp", head hariç
    const modelKey = key.replace(/[^a-z0-9]/g, "");

    const cover = files.find((f) =>
      f.includes(modelKey + "-head")
    );
    const gallery = files
      .filter(
        (f) => f.includes(modelKey) && !f.includes("-head")
      )
      .map((f) => baseUrl + f);

    console.log(`Model: ${grouped[key].model} → Anahtar: ${modelKey}`);
    console.log("Bulunan cover:", cover);
    console.log("Galeri:", gallery);

    grouped[key].cover_image = cover ? baseUrl + cover : null;
    grouped[key].gallery_images = gallery;
  }

  const enriched = Object.values(grouped);

  // Sonucu görsel log ile gösterelim
  console.log("Oluşturulan enriched veri:", enriched);

  return enriched;
}
