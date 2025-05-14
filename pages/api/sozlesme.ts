import type { NextApiRequest, NextApiResponse } from "next";
import PDFDocument from "pdfkit";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import os from "os";
import path from "path";

console.log("🟢 API başlatıldı: sozlesme.ts");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

console.log("🌐 Supabase client oluşturuldu");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("📩 İstek alındı:", req.method);

  if (req.method !== "POST") {
    console.warn("❌ Geçersiz metod:", req.method);
    return res.status(405).json({ message: "Yalnızca POST desteklenir" });
  }

  try {
    const { musteriAdi, aracModel, baslangicTarihi, bitisTarihi, fiyat } = req.body;

    console.log("📥 Gelen veriler:", {
      musteriAdi,
      aracModel,
      baslangicTarihi,
      bitisTarihi,
      fiyat,
    });

    // Eksik alan kontrolü
    if (!musteriAdi || !aracModel || !baslangicTarihi || !bitisTarihi || !fiyat) {
      console.error("⚠️ Eksik alanlar:", { musteriAdi, aracModel, baslangicTarihi, bitisTarihi, fiyat });
      return res.status(400).json({ message: "Tüm alanlar zorunludur" });
    }

    const parsedFiyat = Number(fiyat);
    if (isNaN(parsedFiyat)) {
      console.error("🚫 Geçersiz fiyat değeri:", fiyat);
      return res.status(400).json({ message: "Fiyat sayısal olmalıdır" });
    }

    const fileName = `sozlesme-${uuidv4()}.pdf`;
    const tempPath = path.join(os.tmpdir(), fileName);

    console.log("📄 PDF dosyası oluşturulacak:", tempPath);

    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(tempPath);
    doc.pipe(writeStream);

    console.log("📑 PDF yazımı başlatıldı...");
    doc.fontSize(16).text("Araç Kiralama Sözleşmesi", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Tarih: ${new Date().toLocaleDateString("tr-TR")}`);
    doc.text(`Müşteri Adı: ${musteriAdi}`);
    doc.text(`Araç Modeli: ${aracModel}`);
    doc.text(`Kiralama Süresi: ${baslangicTarihi} → ${bitisTarihi}`);
    doc.text(`Kira Bedeli: ${parsedFiyat.toFixed(2)} ₺`);
    doc.moveDown();
    doc.text("Genel Hükümler:");
    doc.text(`- Bu sözleşme ${musteriAdi} ile LenaCars arasında geçerlidir.`);
    doc.text(`- Araç ${baslangicTarihi} - ${bitisTarihi} tarihleri arasında kiralanmıştır.`);
    doc.text("- Ödeme peşin alınmıştır.");
    doc.moveDown();
    doc.text("İmzalar:");
    doc.text("Müşteri: ____________________");
    doc.text("LenaCars: ____________________");
    doc.end();

    await new Promise((resolve) => writeStream.on("finish", resolve));
    console.log("✅ PDF dosyası tamamlandı ve geçici klasöre yazıldı.");

    const fileData = fs.readFileSync(tempPath);
    console.log("📥 PDF dosyası okundu, boyut:", fileData.length, "byte");

    const { error: uploadError } = await supabase.storage
      .from("sozlesmeler")
      .upload(fileName, fileData, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("🚨 Supabase Storage yükleme hatası:", uploadError);
      return res.status(500).json({ message: "PDF yüklenemedi", error: uploadError });
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sozlesmeler/${fileName}`;
    console.log("🔗 Supabase public URL:", publicUrl);

    const { error: insertError } = await supabase.from("sozlesmeler").insert([
      {
        musteri_adi: musteriAdi,
        arac_model: aracModel,
        baslangic_tarihi: baslangicTarihi,
        bitis_tarihi: bitisTarihi,
        fiyat: parsedFiyat,
        pdf_url: publicUrl,
      },
    ]);

    if (insertError) {
      console.error("📛 Supabase insert hatası:", insertError);
      return res.status(500).json({ message: "Veritabanı hatası", error: insertError });
    }

    console.log("✅ PDF ve kayıt başarıyla tamamlandı");
    return res.status(200).json({ message: "PDF oluşturuldu", url: publicUrl });

  } catch (err: any) {
    console.error("🔥 Genel API hatası:", {
      message: err?.message,
      name: err?.name,
      stack: err?.stack,
    });
    return res.status(500).json({ message: "Sunucu hatası", error: err?.message });
  }
}
