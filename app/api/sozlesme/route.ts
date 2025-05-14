import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import SozlesmePdf from "../../../components/SozlesmePdf";
import { createClient } from "@supabase/supabase-js";
import React from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      musteriAdi,
      aracModel,
      baslangicTarihi,
      bitisTarihi,
      fiyat,
      userId,
    } = body;

    if (!musteriAdi || !aracModel || !baslangicTarihi || !bitisTarihi || !fiyat || !userId) {
      return NextResponse.json({ error: "Eksik alan var" }, { status: 400 });
    }

    const pdfBuffer = await pdf(
      React.createElement(SozlesmePdf, {
        musteriAdi: String(musteriAdi),
        aracModel: String(aracModel),
        baslangicTarihi: String(baslangicTarihi),
        bitisTarihi: String(bitisTarihi),
        fiyat: String(fiyat),
      })
    ).toBuffer();

    const filename = `sozlesme_${Date.now()}.pdf`;
    const filePath = `sozlesme_${filename}`;

    const { error: uploadError } = await supabase.storage
      .from("sozlesmeler")
      .upload(filePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from("sozlesmeler")
      .getPublicUrl(filePath);
    const fileUrl = publicUrlData?.publicUrl;

    const { error: insertError } = await supabase.from("sozlesmeler").insert([
      {
        user_id: userId,
        musteri_adi: musteriAdi,
        arac_modeli: aracModel,
        baslangic_tarihi: baslangicTarihi,
        bitis_tarihi: bitisTarihi,
        fiyat: fiyat,
        dosya_url: fileUrl,
      },
    ]);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ url: fileUrl });
  } catch (err: any) {
    console.error("❌ Genel hata:", err);
    return NextResponse.json({ error: "PDF oluşturulamadı", detay: String(err) }, { status: 500 });
  }
}
