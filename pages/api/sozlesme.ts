import type { NextApiRequest, NextApiResponse } from "next";
import PDFDocument from "pdfkit";
import fs from "fs";
import os from "os";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";

// Supabase tanımı
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Yalnızca POST desteklenir" });

  try {
    const { musteriAdi, aracModel, baslangicTarihi, bitisTarihi, fiyat } = req.body;

    if (!musteriAdi || !aracModel || !baslangicTarihi || !bitisTarihi || !fiyat) {
      return res.status(400).json({ message: "Eksik alanlar var" });
    }

    const parsedFiyat = Number(fiyat);
    if (isNaN(parsedFiyat)) {
      return res.status(400).json({ message: "Fiyat sayısal olmalı" });
    }

    const fileName = `sozlesme-${uuidv4()}.pdf`;
    const tempPath = path.join(os.tmpdir(), fileName);
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    const fontPath = path.join(process.cwd(), "fonts", "OpenSans-Regular.ttf");
    doc.font(fontPath);

    const writeStream = fs.createWriteStream(tempPath);
    doc.pipe(writeStream);

    doc.fontSize(14).text("ARAÇ KİRALAMA SÖZLEŞMESİ", { align: "center" }).moveDown(1.5);

    doc.fontSize(10);
    doc.text("Bu sözleşme (“ARAÇ KİRALAMA SÖZLEŞMESİ”) aşağıda belirtilen taraflar arasında akdedilmiştir.");
    doc.moveDown();

    doc.text("TARAFLAR", { underline: true });
    doc.moveDown(0.5);
    doc.text("Kiralayan Unvanı: Lena Mama Yayıncılık Ticaret A.Ş. (MALİK-KİRALAYAN)");
    doc.text("Kiralayan Adresi: Eyüp Sultan Mah. Yadigâr Sk. No: 30-38A İç Kapı No:78 Sancaktepe/İSTANBUL");
    doc.text("Kiralayan Vergi Dairesi - Vergi Numarası: Sultanbeyli - 6081253500");
    doc.text("Fatura Bildirim e-posta adresi: info@LENACARS.com");
    doc.text("Kiralayan Kısa İsmi: 'LENACARS'");

    doc.moveDown();
    doc.text("Kiracı Unvanı: ...............................................................");
    doc.text("Kiracı Adresi: ...............................................................");
    doc.text("Kiracı Vergi Dairesi - Vergi Numarası: ...................................");
    doc.text("Fatura Bildirim e-posta adresi: ...........................................");
    doc.text("Kiracı Kısa İsmi: 'MÜŞTERİ'");
    doc.moveDown(1.5);

    doc.text("Taraflar aşağıdaki hükümler doğrultusunda mutabakata varmışlardır.");
    doc.moveDown();

    doc.text("Araç: Sipariş Onay Formu’nda markası, modeli ve teknik özellikleri belirtilmiş olan araç.");
    doc.text("Araç Siparişi: Sipariş Onay Formu’nun MÜŞTERİ tarafından imzalanarak, LENACARS’a teslim edilmesini ifade eder.");
    doc.moveDown();

    doc.text("Araçların Kiralanması ve Teslimi", { underline: true });
    doc.text(`LENACARS, ${aracModel} marka aracı ${baslangicTarihi} - ${bitisTarihi} tarihleri arasında MÜŞTERİ’ye kiraya vermeyi kabul eder.`);
    doc.text("Kira bedeli: " + parsedFiyat.toFixed(2) + " ₺");
    doc.text("Teslim tarihi ile birlikte tüm sözleşme koşulları yürürlüğe girer.");
    doc.moveDown();

    doc.text("MÜŞTERİ, aracın teslimi sırasında gerekli incelemeyi yaparak teslim aldığını ve sözleşme hükümlerini kabul ettiğini taahhüt eder.");
    doc.moveDown(2);

    doc.text("İMZALAR", { underline: true });
    doc.text("TARİH: " + new Date().toLocaleDateString("tr-TR"));
    doc.moveDown(1.5);
    doc.text("LENA MAMA YAYINCILIK TİCARET A.Ş", { continued: true }).text("      MÜŞTERİ", { align: "right" });
    doc.text("Ad - Soyad / İmza", { continued: true }).text("         Ad - Soyad / İmza", { align: "right" });

    doc.end();

    await new Promise((resolve) => writeStream.on("finish", resolve));
    const fileData = fs.readFileSync(tempPath);

    const { error } = await supabase.storage
      .from("sozlesmeler")
      .upload(fileName, fileData, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) return res.status(500).json({ message: "Yükleme hatası", error });

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sozlesmeler/${fileName}`;

    await supabase.from("sozlesmeler").insert([
      {
        musteri_adi: musteriAdi,
        arac_model: aracModel,
        baslangic_tarihi: baslangicTarihi,
        bitis_tarihi: bitisTarihi,
        fiyat: parsedFiyat,
        pdf_url: publicUrl,
      },
    ]);

    return res.status(200).json({ message: "Sözleşme PDF oluşturuldu", url: publicUrl });
  } catch (err: any) {
    console.error("🔥 Hata:", err);
    return res.status(500).json({ message: "Sunucu hatası", error: err?.message });
  }
}
