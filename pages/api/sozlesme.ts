import React from "react";
import type { NextApiRequest, NextApiResponse } from "next";
import { pdf } from "@react-pdf/renderer";
import SozlesmePdf from "@/components/SozlesmePdf";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import os from "os";

console.log("🔁 API modüller yüklendi");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

console.log("🌐 Supabase client oluşturuldu");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("🟡 API çalıştı: /api/sozlesme");

  if (req.method !== "POST") {
    console.warn("⛔ Geçersiz method:", req.method);
    return res.status(405).json({ message: "Sadece POST desteklenir" });
  }

  try {
    console.log("📥 Request alındı");
    const body = req.body;
    console.log("📦 Body içeriği:", body);

    const { musteriAdi, aracModel, baslangicTarihi, bitisTarihi, fiyat } = body;

    if (!musteriAdi || !aracModel || !baslangicTarihi || !bitisTarihi || !fiyat) {
      console.error("❌ Eksik alanlar:", { musteriAdi, aracModel, baslangicTarihi, bitisTarihi, fiyat });
      return res.status(400).json({ message: "Zorunlu alanlar eksik." });
    }

    const fiyatParsed = Number(fiyat);
    if (isNaN(fiyatParsed)) {
      console.error("❌ Geçersiz fiyat:", fiyat);
      return res.status(400).json({ message: "Fiyat sayısal bir değer olmalıdır." });
    }

    const fileName = `sozlesme-${uuidv4()}.pdf`;
    const tempPath = path.join(os.tmpdir(), fileName);
    console.log("📄 Geçici PDF yolu:", tempPath);

    const pdfProps = {
      musteriAdi: musteriAdi ?? "",
      aracModel: aracModel ?? "",
      baslangicTarihi: baslangicTarihi ?? "",
      bitisTarihi: bitisTarihi ?? "",
      fiyat: fiyatParsed,
    };

    console.log("📤 PDF bileşen props:", pdfProps);

    let pdfBuffer;
    try {
      console.log("⚙️ React.createElement başlatılıyor...");
      const component = React.createElement(SozlesmePdf, pdfProps);
      console.log("✅ React bileşeni oluşturuldu");

      console.log("📄 PDF buffer üretimi başlıyor...");
      pdfBuffer = await pdf(component).toBuffer();
      console.log("✅ PDF buffer üretildi, boyut:", pdfBuffer.length);
    } catch (pdfError: any) {
      console.error("🔥 PDF oluşturma hatası:", {
        message: pdfError?.message,
        name: pdfError?.name,
        stack: pdfError?.stack,
      });
      return res.status(500).json({
        message: "PDF oluşturulamadı",
        error: {
          message: pdfError?.message,
          name: pdfError?.name,
          stack: pdfError?.stack,
        },
      });
    }

    fs.writeFileSync(tempPath, pdfBuffer);
    console.log("📁 PDF temp dosyasına yazıldı");

    const fileData = fs.readFileSync(tempPath);
    console.log("📥 PDF dosyası okundu, byte:", fileData.length);

    const { error: uploadError } = await supabase.storage
      .from("sozlesmeler")
      .upload(fileName, fileData, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("🚨 Supabase upload hatası:", uploadError);
      return res.status(500).json({ message: "PDF yüklenemedi", error: uploadError });
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sozlesmeler/${fileName}`;
    console.log("🔗 PDF Supabase URL:", publicUrl);

    const { error: insertError } = await supabase.from("sozlesmeler").insert([
      {
        musteri_adi: musteriAdi,
        arac_model: aracModel,
        baslangic_tarihi: baslangicTarihi,
        bitis_tarihi: bitisTarihi,
        fiyat: fiyatParsed,
        pdf_url: publicUrl,
      },
    ]);

    if (insertError) {
      console.error("📛 Supabase kayıt hatası:", insertError);
      return res.status(500).json({ message: "Veritabanı hatası", error: insertError });
    }

    console.log("✅ Sözleşme kaydı ve PDF tamamlandı");
    return res.status(200).json({ message: "PDF başarıyla yüklendi", url: publicUrl });

  } catch (error: any) {
    console.error("🔥 Genel hata:", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      full: error,
    });

    return res.status(500).json({
      message: "Sunucu hatası",
      error: {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
      },
    });
  }
}
