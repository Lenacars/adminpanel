"use server";
import xlsx from "xlsx";

export async function convertExcelToJson(arrayBuffer: ArrayBuffer, firmaKodu: string) {
  try {
    console.log("Excel dosyası işleniyor...");
    const buffer = Buffer.from(arrayBuffer);
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const raw = xlsx.utils.sheet_to_json(sheet);

    console.log("Satır sayısı:", raw.length);

    const grouped: Record<string, any> = {};
    let index = 1001;

    function normalize(str: string) {
      return str
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .trim();
    }

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

    console.log("✔️ Başarıyla gruplandı:", Object.keys(grouped).length);
    return Object.values(grouped);
  } catch (err) {
    console.error("❌ Excel dönüştürme hatası:", err);
    throw err;
  }
}
