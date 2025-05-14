import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import { createClient } from "@supabase/supabase-js";
import SozlesmePdf from "@/components/SozlesmePdf"; // << Önemli: doğru path!
import React from "react";

// Runtime tanımla
export const runtime = 'nodejs';

// Supabase client oluştur
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// POST metodunu güncelle
export async function POST(req: Request) {
  console.log("📥 POST isteği geldi");
  try {
    const body = await req.json();

    const {
      musteriAdi = "",
      aracModel = "",
      baslangicTarihi = "",
      bitisTarihi = "",
      fiyat = "",
    } = body;

    console.log("🧾 Gelen veriler:", body);

    // PDF bileşeni oluştur
    const component = (
      <SozlesmePdf
        musteriAdi={musteriAdi}
        aracModel={aracModel}
        baslangicTarihi={baslangicTarihi}
        bitisTarihi={bitisTarihi}
        fiyat={fiyat}
      />
    );

    const pdfBuffer = await pdf(component).toBuffer();
    console.log("✅ PDF oluşturuldu:", pdfBuffer.length, "byte");

    const filePath = `sozlesme_${Date.now()}.pdf`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("sozlesmeler")
      .upload(filePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ Yükleme hatası:", uploadError.message);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from("sozlesmeler")
      .getPublicUrl(filePath);

    const fileUrl = publicUrlData?.publicUrl;
    console.log("🔗 PDF URL:", fileUrl);

    return NextResponse.json({ url: fileUrl });
  } catch (err: any) {
    console.error("🔥 HATA:", err);
    return NextResponse.json(
      {
        error: "PDF oluşturulamadı",
        detay: String(err),
        errorDetails: {
          message: err.message,
          name: err.name,
          stack: err.stack,
        },
      },
      { status: 500 }
    );
  }
}
