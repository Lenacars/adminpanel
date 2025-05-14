import React from "react";
import type { NextApiRequest, NextApiResponse } from "next";
import { pdf } from "@react-pdf/renderer";
import SozlesmePdf from "@/components/SozlesmePdf";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import os from "os";

console.log("📦 API dış modüller yüklendi");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

console.log("🌍 Supabase bağlantısı hazır");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("🟡 API çalıştı: /api/sozlesme");

  if (req.method !== "POST") {
    console.warn("❌ Desteklenmeyen metod:", req.method);
    return res.status(405).json({ message: "Sadece POST isteği desteklenir" });
  }

  try {
    console.log("📩 İstek alınmaya başladı...");
    const body = req.body;
    console.log("📥 İstek body içeriği:", body);

    const { musteriAdi, aracModel, baslangicTarihi, bitisTarihi, fiyat } = body;

    if (!musteriAdi || !aracModel || !baslangicTarihi || !bitisTarihi || !fiyat) {
      console.error("❌ Eksik alanlar:", {
        musteriAdi, aracModel, baslangicTarihi, bitisTarihi, fiyat,
      });
      return res.status(400).json({ message: "Eksik alanlar var" });
    }

    const fileName = `sozlesme-${uuidv4()}.pdf`;
    const tempPath = path.join(os.tmpdir(), fileName);
    console.log("📄 Geçici PDF dosya yolu:", tempPath);

    const pdfProps = {
      musteriAdi: musteriAdi ?? "",
      aracModel: aracModel ?? "",
      baslangicTarihi: baslangicTarihi ?? "",
      bitisTarihi: bitisTarihi ?? "",
      fiyat: fiyat ?? "",
    };

    console.log("📄 PDF bileşenine gönderilecek props:", pdfProps);

    const component = React.createElement(SozlesmePdf, pdfProps);
    console.log("🛠️ React bileşeni oluşturuldu");

    const pdfBuffer = await pdf(component).toBuffer();
    console.log("✅ PDF buffer üretildi, boyut:", pdfBuffer.length);

    fs.writeFileSync(tempPath, pdfBuffer);
    console.log("📄 Temp dosyaya yazıldı");

    const fileData = fs.readFileSync(tempPath);
    console.log("📂 Dosya okundu:", fileData.length, "byte");

    const { error: uploadError } = await supabase.storage
      .from("sozlesmeler")
      .upload(fileName, fileData, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("🚨 PDF yükleme hatası:", uploadError);
      return res.status(500).json({ message: "PDF Supabase'e yüklenemedi", error: uploadError });
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sozlesmeler/${fileName}`;
    console.log("🔗 Supabase public URL:", publicUrl);

    const { error: insertError } = await supabase.from("sozlesmeler").insert([
      {
        musteri_adi: musteriAdi,
        arac_model: aracModel,
        baslangic_tarihi: baslangicTarihi,
        bitis_tarihi: bitisTarihi,
        fiyat: fiyat,
        pdf_url: publicUrl,
      },
    ]);

    if (insertError) {
      console.error("📛 Veritabanına kayıt eklenemedi:", insertError);
      return res.status(500).json({ message: "Veritabanına kayıt hatası", error: insertError });
    }

    console.log("✅ Sözleşme başarıyla Supabase'e yüklendi ve kayıt edildi");
    return res.status(200).json({ message: "PDF oluşturuldu", url: publicUrl });
  } catch (error: any) {
    console.error("🔥 Genel hata:", error?.message || error);
    return res.status(500).json({ message: "Sunucu hatası", error });
  }
}
