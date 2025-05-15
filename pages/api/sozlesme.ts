// pages/api/sozlesme.ts

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
  console.log("📥 [POST] API isteği alındı");

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Sadece POST isteklerine izin verilir" });
  }

  try {
    const { musteriAdi, adres, vergiDairesi, eposta } = req.body;
    console.log("✅ Form verileri:", { musteriAdi, adres, vergiDairesi, eposta });

    const fontPath = path.join(process.cwd(), "fonts", "OpenSans-Regular.ttf");
    console.log("📁 Font yolu:", fontPath);

    if (!fs.existsSync(fontPath)) {
      throw new Error(`❌ Font dosyası yok: ${fontPath}`);
    }

    const fileName = `sozlesme-${uuidv4()}.pdf`;
    const tempPath = path.join(os.tmpdir(), fileName);
    console.log("📄 Geçici PDF yolu:", tempPath);

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.registerFont("OpenSans", fontPath);
    doc.font("OpenSans");

    const stream = fs.createWriteStream(tempPath);
    doc.pipe(stream);

    doc.fontSize(14).text("ARAÇ KİRALAMA SÖZLEŞMESİ", { align: "center" }).moveDown();
    doc.fontSize(10);
    doc.text(`Kiracı Unvanı: ${musteriAdi || "-"}`);
    doc.text(`Kiracı Adresi: ${adres || "-"}`);
    doc.text(`Vergi Dairesi - No: ${vergiDairesi || "-"}`);
    doc.text(`Fatura E-posta: ${eposta || "-"}`);
    doc.moveDown();

    const sozlesmePath = path.join(process.cwd(), "public", "sozlesme-metni.txt");
    if (!fs.existsSync(sozlesmePath)) {
      throw new Error("❌ sozlesme-metni.txt dosyası bulunamadı.");
    }

    const lines = fs.readFileSync(sozlesmePath, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (i > 0 && i % 45 === 0) doc.addPage();
      doc.text(lines[i], { width: 500, align: "justify" });
    }

    doc.end();
    await new Promise((resolve) => stream.on("finish", resolve));
    const pdfBuffer = fs.readFileSync(tempPath);

    const { error: uploadError } = await supabase.storage
      .from("sozlesmeler")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ Supabase dosya yükleme hatası:", uploadError);
      return res.status(500).json({ message: "Upload error", error: uploadError });
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sozlesmeler/${fileName}`;

    const { error: dbError } = await supabase.from("sozlesmeler").insert([
      {
        musteri_adi: musteriAdi,
        adres,
        vergi_dairesi: vergiDairesi,
        eposta,
        pdf_url: publicUrl,
      },
    ]);

    if (dbError) {
      console.error("❌ Veritabanı hatası:", dbError);
      return res.status(500).json({ message: "DB error", error: dbError });
    }

    return res.status(200).json({ message: "PDF oluşturuldu", url: publicUrl });
  } catch (err: any) {
    console.error("🚨 Genel Hata:", err);
    return res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
}
