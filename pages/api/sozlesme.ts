import type { NextApiRequest, NextApiResponse } from "next";
import PDFDocument from "pdfkit";
import fs from "fs";
import os from "os";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Yalnızca POST desteklenir" });

  try {
    const { musteriAdi, aracModel, baslangicTarihi, bitisTarihi, fiyat } = req.body;

    const fileName = `sozlesme-${uuidv4()}.pdf`;
    const tempPath = path.join(os.tmpdir(), fileName);
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    const fontPath = path.join(process.cwd(), "fonts", "OpenSans-Regular.ttf");
    doc.font(fontPath);

    const stream = fs.createWriteStream(tempPath);
    doc.pipe(stream);

    // Başlık
    doc.fontSize(14).text("ARAÇ KİRALAMA SÖZLEŞMESİ", { align: "center" }).moveDown(1.5);
    doc.fontSize(10);

    // Müşteri bilgileri boş
    doc.text("Kiracı Unvanı: ...............................................................");
    doc.text("Kiracı Adresi: ...............................................................");
    doc.text("Kiracı Vergi Dairesi - Vergi Numarası: ................................");
    doc.text("Fatura Bildirim e-posta adresi: ...........................................");
    doc.text("Kiracı Kısa İsmi: 'MÜŞTERİ'").moveDown();

    // Metin şablonu (örnek olarak ilk 3 sayfalık metin döngüyle)
    const metin = fs.readFileSync(path.join(process.cwd(), "public", "sozlesme-metni.txt"), "utf-8");
    const satirlar = metin.split("\n");

    for (let i = 0; i < satirlar.length; i++) {
      if (i !== 0 && i % 45 === 0) doc.addPage();
      doc.text(satirlar[i], {
        width: 500,
        align: "justify",
      });
    }

    doc.moveDown(2);
    doc.text("İMZALAR", { underline: true }).moveDown(1);
    doc.text("LENA MAMA YAYINCILIK TİCARET A.Ş", { continued: true }).text("      MÜŞTERİ", { align: "right" });
    doc.text("Ad - Soyad / İmza", { continued: true }).text("         Ad - Soyad / İmza", { align: "right" });

    doc.end();
    await new Promise((resolve) => stream.on("finish", resolve));
    const fileBuffer = fs.readFileSync(tempPath);

    const { error: uploadError } = await supabase.storage
      .from("sozlesmeler")
      .upload(fileName, fileBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      return res.status(500).json({ message: "Yükleme hatası", error: uploadError });
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sozlesmeler/${fileName}`;

    await supabase.from("sozlesmeler").insert([
      {
        musteri_adi: musteriAdi || "Boş",
        arac_model: aracModel || "Boş",
        baslangic_tarihi: baslangicTarihi || null,
        bitis_tarihi: bitisTarihi || null,
        fiyat: fiyat || 0,
        pdf_url: publicUrl,
      },
    ]);

    return res.status(200).json({ message: "Sözleşme PDF oluşturuldu", url: publicUrl });
  } catch (err: any) {
    console.error("🔥 Sözleşme oluşturma hatası:", err);
    return res.status(500).json({ message: "Sunucu hatası", error: err?.message });
  }
}
