import type { NextApiRequest, NextApiResponse } from "next";
import { pdf } from "@react-pdf/renderer";
import SozlesmePdf from "@/components/SozlesmePdf";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import os from "os";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Sadece POST desteklenir" });

  try {
    const { musteriAdi, aracModel, baslangicTarihi, bitisTarihi, fiyat } = req.body;

    if (!musteriAdi || !aracModel || !baslangicTarihi || !bitisTarihi || !fiyat) {
      return res.status(400).json({ message: "Tüm alanlar zorunludur." });
    }

    const fileName = `sozlesme-${uuidv4()}.pdf`;
    const pdfPath = path.join(os.tmpdir(), fileName);

    const pdfContent = await pdf(
      React.createElement(SozlesmePdf, {
        musteriAdi: musteriAdi ?? "",
        aracModel: aracModel ?? "",
        baslangicTarihi: baslangicTarihi ?? "",
        bitisTarihi: bitisTarihi ?? "",
        fiyat: fiyat ?? "",
      })
    ).toBuffer();

    fs.writeFileSync(pdfPath, pdfContent);
    const fileData = fs.readFileSync(pdfPath);

    const { error: uploadError } = await supabase.storage
      .from("sozlesmeler")
      .upload(fileName, fileData, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload hatası:", uploadError);
      return res.status(500).json({ message: "PDF yüklenemedi", error: uploadError });
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sozlesmeler/${fileName}`;

    const { error: dbError } = await supabase.from("sozlesmeler").insert([
      {
        musteri_adi: musteriAdi,
        arac_model: aracModel,
        baslangic_tarihi: baslangicTarihi,
        bitis_tarihi: bitisTarihi,
        fiyat: fiyat,
        pdf_url: publicUrl,
      },
    ]);

    if (dbError) {
      console.error("DB hata:", dbError);
      return res.status(500).json({ message: "Veritabanı hatası", error: dbError });
    }

    return res.status(200).json({ message: "Sözleşme başarıyla yüklendi", url: publicUrl });
  } catch (error) {
    console.error("Sunucu hatası:", error);
    return res.status(500).json({ message: "Beklenmeyen sunucu hatası", error });
  }
}
