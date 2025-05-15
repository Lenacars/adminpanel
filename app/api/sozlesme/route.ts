import { NextResponse } from "next/server";
import fs from "fs";
import os from "os";
import path from "path";
import PDFDocument from "pdfkit";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";

// Supabase bağlantısı
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { musteriAdi, adres, vergiDairesi, eposta } = await req.json();

    // PDF oluşturulacak geçici dosya
    const fileName = `sozlesme-${uuidv4()}.pdf`;
    const tempPath = path.join(os.tmpdir(), fileName);
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    // Yazılacak dosya akışı
    const stream = fs.createWriteStream(tempPath);
    doc.pipe(stream);

    // Başlık ve müşteri bilgileri
    doc.fontSize(14).text("ARAÇ KİRALAMA SÖZLEŞMESİ", { align: "center" }).moveDown();
    doc.fontSize(10);
    doc.text(`Kiracı Unvanı: ${musteriAdi || ".........."}`);
    doc.text(`Kiracı Adresi: ${adres || ".........."}`);
    doc.text(`Vergi Dairesi - No: ${vergiDairesi || ".........."}`);
    doc.text(`Fatura E-posta: ${eposta || ".........."}`);
    doc.moveDown();

    // Sabit sözleşme metni buradan okunur
    const sozlesmePath = path.join(process.cwd(), "public", "sozlesme-metni.txt");
    const fullText = fs.readFileSync(sozlesmePath, "utf8");
    const lines = fullText.split("\n");

    for (let i = 0; i < lines.length; i++) {
      if (i !== 0 && i % 45 === 0) doc.addPage();
      doc.text(lines[i], { width: 500, align: "justify" });
    }

    doc.end();
    await new Promise((resolve) => stream.on("finish", resolve));
    const pdfBuffer = fs.readFileSync(tempPath);

    // Supabase’e yükle
    const { error } = await supabase.storage
      .from("sozlesmeler")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) {
      return NextResponse.json({ message: "Dosya yüklenemedi", error }, { status: 500 });
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sozlesmeler/${fileName}`;

    // Veritabanına kaydet
    await supabase.from("sozlesmeler").insert([
      {
        musteri_adi: musteriAdi,
        adres,
        vergi_dairesi: vergiDairesi,
        eposta,
        pdf_url: publicUrl,
      },
    ]);

    return NextResponse.json({ message: "PDF oluşturuldu", url: publicUrl });
  } catch (err: any) {
    console.error("🚨 HATA:", err);
    return NextResponse.json({ message: "Sunucu hatası", error: err?.message }, { status: 500 });
  }
}
