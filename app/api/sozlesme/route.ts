import { NextResponse } from "next/server";
import { pdf, Font } from "@react-pdf/renderer";
import SozlesmePdf from "@/components/SozlesmePdf";
import { createClient } from "@supabase/supabase-js";
import React from "react";

// Eğer font eklemiyorsan bu kısmı silebilirsin
// Font.register({ ... })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { musteriAdi, aracModel, baslangicTarihi, bitisTarihi, fiyat, userId } = body;

    // PDF oluştur
    const pdfBuffer = await pdf(
      React.createElement(SozlesmePdf, {
        musteriAdi,
        aracModel,
        baslangicTarihi,
        bitisTarihi,
        fiyat,
      })
    ).toBuffer();

    const filename = `sozlesme_${Date.now()}.pdf`;
    const filePath = `sozlesme_${filename}.pdf`;

    // 📤 PDF’yi sozlesmeler bucket’ına yükle
    const { error: uploadError } = await supabase.storage
      .from("sozlesmeler")
      .upload(filePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("PDF yükleme hatası:", uploadError.message);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // 🔗 Public URL al
    const { data: publicUrlData } = supabase.storage.from("sozlesmeler").getPublicUrl(filePath);
    const fileUrl = publicUrlData?.publicUrl;

    // 📥 Supabase’e veritabanı kaydı ekle
    const { error: insertError } = await supabase
      .from("sozlesmeler")
      .insert([
        {
          user_id: userId,
          musteri_adi: musteriAdi,
          arac_modeli: aracModel,
          baslangic_tarihi: baslangicTarihi,
          bitis_tarihi: bitisTarihi,
          fiyat,
          dosya_url: fileUrl,
        },
      ]);

    if (insertError) {
      console.error("Tabloya kayıt hatası:", insertError.message);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ url: fileUrl });
  } catch (err) {
    console.error("Genel hata:", err);
    return NextResponse.json({ error: "PDF oluşturulamadı", detay: String(err) }, { status: 500 });
  }
}
