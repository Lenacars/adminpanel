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
  console.log("📥 [POST] API isteği alındı");

  try {
    const { musteriAdi, adres, vergiDairesi, eposta } = await req.json();
    console.log("✅ Form verileri:", { musteriAdi, adres, vergiDairesi, eposta });

    // ✅ Font dosya yolu (KÖK dizin: /fonts)
    const fontPath = path.join(process.cwd(), "fonts", "OpenSans-Regular.ttf");
    console.log("📁 Font dosya yolu:", fontPath);

    if (!fs.existsSync(fontPath)) {
      throw new Error(`❌ Font dosyası bulunamadı: ${fontPath}`);
    }

    const fileName = `sozlesme-${uuidv4()}.pdf`;
    const tempPath = path.join(os.tmpdir(), fileName);
    console.log("📄 Geçici PDF yolu:", tempPath);

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    doc.registerFont("OpenSans", fontPath);
    doc.font("OpenSans");
    console.log("🔤 OpenSans fontu yüklendi");

    const stream = fs.createWriteStream(tempPath);
    doc.pipe(stream);

    // 📌 Başlık ve müşteri bilgileri
    doc.font("OpenSans");
    doc.fontSize(14).text("ARAÇ KİRALAMA SÖZLEŞMESİ", { align: "center" }).moveDown();
    doc.fontSize(10);
    doc.text(`Kiracı Unvanı: ${musteriAdi || ".........."}`);
    doc.text(`Kiracı Adresi: ${adres || ".........."}`);
    doc.text(`Vergi Dairesi - No: ${vergiDairesi || ".........."}`);
    doc.text(`Fatura E-posta: ${eposta || ".........."}`);
    doc.moveDown();

    // 📜 Sözleşme metni
    const sozlesmePath = path.join(process.cwd(), "public", "sozlesme-metni.txt");
    if (!fs.existsSync(sozlesmePath)) {
      throw new Error(`❌ Sözleşme metni bulunamadı: ${sozlesmePath}`);
    }

    const fullText = fs.readFileSync(sozlesmePath, "utf8");
    const lines = fullText.split("\n");

    lines.forEach((line, i) => {
      if (i !== 0 && i % 45 === 0) {
        doc.addPage();
        doc.font("OpenSans"); // 🧠 addPage sonrası fontu yeniden uygula
      }
      doc.text(line, { width: 500, align: "justify" });
    });

    doc.end();
    console.log("📄 PDF yazımı tamamlandı");

    await new Promise((resolve) => stream.on("finish", resolve));
    const pdfBuffer = fs.readFileSync(tempPath);
    console.log("📦 PDF okundu:", tempPath);

    const { error: uploadError } = await supabase.storage
      .from("sozlesmeler")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ Supabase upload hatası:", uploadError);
      return NextResponse.json({ message: "Dosya yüklenemedi", error: uploadError }, { status: 500 });
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sozlesmeler/${fileName}`;
    console.log("☁️ Dosya yüklendi:", publicUrl);

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
      console.error("❌ Supabase DB hatası:", dbError);
      return NextResponse.json({ message: "Veritabanı hatası", error: dbError }, { status: 500 });
    }

    console.log("✅ Veritabanı kaydı başarılı");
    return NextResponse.json({ message: "PDF oluşturuldu", url: publicUrl });

  } catch (err: any) {
    console.error("🚨 HATA:", err);
    return NextResponse.json({ message: "Sunucu hatası", error: err?.message }, { status: 500 });
  }
}
