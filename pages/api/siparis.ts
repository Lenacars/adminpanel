import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import os from "os";
import path from "path";
import PDFDocument from "pdfkit";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Sadece POST isteklerine izin verilir" });
  }

  try {
    const {
      musteriAdi,
      aracMarka,
      adet,
      kiraSuresi,
      kmLimiti,
      kiraTutari,
    } = req.body;

    const fontPath = path.join(process.cwd(), "fonts", "OpenSans-Regular.ttf");
    if (!fs.existsSync(fontPath)) throw new Error("❌ Font dosyası bulunamadı.");

    const txtPath = path.join(process.cwd(), "public", "siparis-onay-formu.txt");
    if (!fs.existsSync(txtPath)) throw new Error("❌ siparis-onay-formu.txt dosyası bulunamadı.");

    const fileName = `siparis-${uuidv4()}.pdf`;
    const tempPath = path.join(os.tmpdir(), fileName);

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.registerFont("OpenSans", fontPath);
    doc.font("OpenSans");

    const stream = fs.createWriteStream(tempPath);
    doc.pipe(stream);

    // Başlık ve dinamik veriler
    doc.fontSize(14).text("SİPARİŞ ONAY FORMU", { align: "center" }).moveDown();
    doc.fontSize(10);
    doc.text(`Müşteri: ${musteriAdi}`);
    doc.text(`Araç Marka / Model: ${aracMarka}`);
    doc.text(`Adet: ${adet}`);
    doc.text(`Kira Süresi: ${kiraSuresi}`);
    doc.text(`Km Limiti / Ay: ${kmLimiti}`);
    doc.text(`Kira Tutarı / Ay: ${kiraTutari} + KDV`).moveDown();

    // Metin dosyasını satır satır PDF'e ekle
    const lines = fs.readFileSync(txtPath, "utf-8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (i > 0 && i % 45 === 0) doc.addPage();
      doc.text(lines[i], { width: 500, align: "justify" });
    }

    doc.end();
    await new Promise((resolve) => stream.on("finish", resolve));

    const pdfBuffer = fs.readFileSync(tempPath);

    // ✅ DOĞRU BUCKET ADI
    const { error: uploadError } = await supabase.storage
      .from("siparis-onay-pdfs")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/siparis-onay-pdfs/${fileName}`;

    // ✅ DOĞRU TABLO ADI
    const { error: dbError } = await supabase.from("siparis_onay_formlari").insert([
      {
        musteri_adi: musteriAdi,
        arac_marka: aracMarka,
        adet,
        kira_suresi: kiraSuresi,
        km_limiti: kmLimiti,
        kira_tutari: kiraTutari,
        pdf_url: publicUrl,
      },
    ]);

    if (dbError) throw dbError;

    return res.status(200).json({ message: "PDF başarıyla oluşturuldu", url: publicUrl });
  } catch (err: any) {
    console.error("🚨 Hata:", err);
    return res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
}
