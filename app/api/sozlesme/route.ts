import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import SozlesmePdf from "@/components/SozlesmePdf";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

// Supabase bağlantısı
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { musteriAdi, aracModel, baslangicTarihi, bitisTarihi, fiyat } = body;

    const fileName = `sozlesme-${uuidv4()}.pdf`;

    // ✅ React PDF bileşeni createElement ile oluşturulmalı
    const pdfBuffer = await pdf(
      React.createElement(SozlesmePdf, {
        musteriAdi,
        aracModel,
        baslangicTarihi,
        bitisTarihi,
        fiyat,
      })
    ).toBuffer();

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("sozlesmeler")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
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
      return NextResponse.json({ message: "Veritabanına kayıt eklenemedi", error: insertError }, { status: 500 });
    }

    return NextResponse.json({ message: "Başarıyla yüklendi", url: publicUrl });
  } catch (error) {
    return NextResponse.json({ message: "Beklenmeyen hata", error }, { status: 500 });
  }
}
