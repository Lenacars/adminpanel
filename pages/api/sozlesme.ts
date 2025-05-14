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

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { musteriAdi, adres, vergiDairesi, eposta } = await req.json();

    const fileName = `sozlesme-${uuidv4()}.pdf`;
    const tempPath = path.join(os.tmpdir(), fileName);
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    const fontPath = path.join(process.cwd(), "public", "fonts", "OpenSans-Regular.ttf");
    doc.font(fontPath);

    const stream = fs.createWriteStream(tempPath);
    doc.pipe(stream);

    // Başlık
    doc.fontSize(14).text("ARAÇ KİRALAMA SÖZLEŞMESİ", { align: "center" }).moveDown(1.5);
    doc.fontSize(10);

    // Müşteri Bilgileri
    doc.text(`Kiracı Unvanı: ${musteriAdi || "..............................................................."}`);
    doc.text(`Kiracı Adresi: ${adres || "..............................................................."}`);
    doc.text(`Kiracı Vergi Dairesi - Vergi Numarası: ${vergiDairesi || "................................"}`);
    doc.text(`Fatura Bildirim e-posta adresi: ${eposta || "..........................................."}`);
    doc.text(`Kiracı Kısa İsmi: 'MÜŞTERİ'`).moveDown();

    // Sözleşme Metni
    const sozlesmePath = path.join(process.cwd(), "public", "sozlesme-metni.txt");
    const fullText = fs.readFileSync(sozlesmePath, "utf-8");

    const satirlar = fullText.split("\n");
    for (let i = 0; i < satirlar.length; i++) {
      if (i !== 0 && i % 45 === 0) doc.addPage();
      doc.text(satirlar[i], { width: 500, align: "justify" });
    }

    doc.end();
    await new Promise((resolve) => stream.on("finish", resolve));
    const fileBuffer = fs.readFileSync(tempPath);

    const { error: uploadError } = await supabase.storage
      .from("sozlesmeler")
      .upload(fileName, fileBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) return res.status(500).json({ message: "Yükleme hatası", error: uploadError });

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sozlesmeler/${fileName}`;

    await supabase.from("sozlesmeler").insert([
      {
        musteri_adi: musteriAdi || "Boş",
        adres: adres || "Boş",
        vergi_dairesi: vergiDairesi || "Boş",
        eposta: eposta || "Boş",
        pdf_url: publicUrl,
      },
    ]);

    return res.status(200).json({ message: "Sözleşme oluşturuldu", url: publicUrl });
  } catch (err: any) {
    console.error("🚨 PDF oluşturma hatası:", err);
    return res.status(500).json({ message: "Sunucu hatası", error: err?.message });
  }
}
