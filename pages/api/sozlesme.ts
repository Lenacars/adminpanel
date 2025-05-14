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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("🟡 API çalıştı: /api/sozlesme");

  if (req.method !== "POST") {
    console.warn("❌ Desteklenmeyen metod:", req.method);
    return res.status(405).json({ message: "Sadece POST isteği desteklenir" });
  }

  try {
    const body = req.body;
    console.log("📥 Gelen body:", body);

    const { musteriAdi, aracModel, baslangicTarihi, bitisTarihi, fiyat } = body;

    if (!musteriAdi || !aracModel || !baslangicTarihi || !bitisTarihi || !fiyat) {
      return res.status(400).json({ message: "Eksik alanlar var" });
    }

    const fiyatParsed = Number(fiyat);
    if (isNaN(fiyatParsed)) {
      return res.status(400).json({ message: "Fiyat geçerli bir sayı olmalıdır" });
    }

    const fileName = `sozlesme-${uuidv4()}.pdf`;
    const tempPath = path.join(os.tmpdir(), fileName);

    const pdfProps = {
      musteriAdi: musteriAdi ?? "",
      aracModel: aracModel ?? "",
      baslangicTarihi: baslangicTarihi ?? "",
      bitisTarihi: bitisTarihi ?? "",
      fiyat: fiyatParsed,
    };

    console.log("📄 PDF props:", pdfProps);

    const component = React.createElement(SozlesmePdf, pdfProps);
    const pdfBuffer = await pdf(component).toBuffer();
    fs.writeFileSync(tempPath, pdfBuffer);
    const fileData = fs.readFileSync(tempPath);

    const { error: uploadError } = await supabase.storage
      .from("sozlesmeler")
      .upload(fileName, fileData, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      return res.status(500).json({ message: "PDF yüklenemedi", error: uploadError });
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sozlesmeler/${fileName}`;

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
      return res.status(500).json({ message: "Veritabanı kaydı hatası", error: insertError });
    }

    console.log("✅ Sözleşme PDF Supabase'e yüklendi:", publicUrl);
    return res.status(200).json({ message: "PDF başarıyla yüklendi", url: publicUrl });
  } catch (error: any) {
    console.error("🔥 Hata:", error?.message || error);
    return res.status(500).json({ message: "Sunucu hatası", error });
  }
}
