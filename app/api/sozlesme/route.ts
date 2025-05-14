import React from "react";
import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import SozlesmePdf from "@/components/SozlesmePdf";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import os from "os";

console.log("🔄 Sözleşme API başladı");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    console.log("📩 POST isteği geldi");
    const body = await req.json();
    const { musteriAdi, aracModel, baslangicTarihi, bitisTarihi, fiyat } = body;

    if (!musteriAdi || !aracModel || !baslangicTarihi || !bitisTarihi || !fiyat) {
      console.error("❌ Eksik alanlar");
      return NextResponse.json({ message: "Eksik alanlar var" }, { status: 400 });
    }

    const fileName = `sozlesme-${uuidv4()}.pdf`;
    const pdfPath = path.join(os.tmpdir(), fileName);

    const component = React.createElement(SozlesmePdf, {
      musteriAdi: musteriAdi ?? "",
      aracModel: aracModel ?? "",
      baslangicTarihi: baslangicTarihi ?? "",
      bitisTarihi: bitisTarihi ?? "",
      fiyat: fiyat ?? "",
    });

    const pdfBuffer = await pdf(component).toBuffer();
    fs.writeFileSync(pdfPath, pdfBuffer);
    console.log("✅ PDF geçici olarak yazıldı:", pdfPath);

    const fileData = fs.readFileSync(pdfPath);

    const { error: uploadError } = await supabase.storage
      .from("sozlesmeler")
      .upload(fileName, fileData, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("🚨 PDF yükleme hatası:", uploadError);
      return NextResponse.json({ message: "PDF yüklenemedi", error: uploadError }, { status: 500 });
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sozlesmeler/${fileName}`;

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
      console.error("📛 Veritabanı hatası:", insertError);
      return NextResponse.json({ message: "Veritabanına kayıt yapılamadı", error: insertError }, { status: 500 });
    }

    console.log("✅ PDF başarıyla yüklendi:", publicUrl);
    return NextResponse.json({ message: "Başarıyla tamamlandı", url: publicUrl });
  } catch (error) {
    console.error("🔥 Beklenmeyen sunucu hatası:", error);
    return NextResponse.json({ message: "Sunucu hatası", error }, { status: 500 });
  }
}
