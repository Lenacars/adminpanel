import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import SozlesmePdf from "@/components/SozlesmePdf";
import { createClient } from "@supabase/supabase-js";
import React from "react";

// Supabase bağlantısı
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Formdan gelen veri:", body);

    const {
      musteriAdi,
      aracModel,
      baslangicTarihi,
      bitisTarihi,
      fiyat,
      userId,
    } = body;

    console.log("➡️ musteriAdi:", musteriAdi);
    console.log("➡️ userId:", userId);

    // Eksik alan kontrolü
    if (!musteriAdi || !aracModel || !baslangicTarihi || !bitisTarihi || !fiyat || !userId) {
      console.error("❌ Eksik alan var!");
      return NextResponse.json({ error: "Eksik alan var" }, { status: 400 });
    }

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
    const filePath = `sozlesme_${filename}`;

    // PDF'yi Supabase'e yükle
    const { error: uploadError } = await supabase.storage
      .from("sozlesmeler")
      .upload(filePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ PDF yükleme hatası:", uploadError.message);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Public URL al
    const { data: publicUrlData } = supabase.storage.from("sozlesmeler").getPublicUrl(filePath);
    const fileUrl = publicUrlData?.publicUrl;

    console.log("📎 Oluşan dosya URL:", fileUrl);

    // Veritabanına kayıt ekle
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
      console.error("❌ Veritabanı kayıt hatası:", insertError.message);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ url: fileUrl });
  } catch (err) {
    console.error("❌ Genel hata:", err);
    return NextResponse.json(
      {
        error: "PDF oluşturulamadı",
        detay: String(err),
      },
      { status: 500 }
    );
  }
}
