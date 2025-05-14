import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import SozlesmePdf from "@/components/SozlesmePdf";
import { createClient } from "@supabase/supabase-js";
import React from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Gelen veri:", body);

    const {
      musteriAdi,
      aracModel,
      baslangicTarihi,
      bitisTarihi,
      fiyat,
      userId,
    } = body;

    // 🛡️ Eksik alan kontrolü
    if (!musteriAdi || !aracModel || !baslangicTarihi || !bitisTarihi || !fiyat || !userId) {
      console.error("❌ Eksik alan var!");
      return NextResponse.json({ error: "Eksik alan var" }, { status: 400 });
    }

    // 💬 PDF’e gönderilecek verileri logla
    const safeMusteriAdi = String(musteriAdi ?? "");
    const safeAracModel = String(aracModel ?? "");
    const safeBaslangicTarihi = String(baslangicTarihi ?? "");
    const safeBitisTarihi = String(bitisTarihi ?? "");
    const safeFiyat = String(fiyat ?? "");

    console.log("📄 PDF’e giden veriler:", {
      safeMusteriAdi,
      safeAracModel,
      safeBaslangicTarihi,
      safeBitisTarihi,
      safeFiyat,
    });

    // 📄 PDF oluştur
    const pdfBuffer = await pdf(
      React.createElement(SozlesmePdf, {
        musteriAdi: safeMusteriAdi,
        aracModel: safeAracModel,
        baslangicTarihi: safeBaslangicTarihi,
        bitisTarihi: safeBitisTarihi,
        fiyat: safeFiyat,
      })
    ).toBuffer();

    const filename = `sozlesme_${Date.now()}.pdf`;
    const filePath = `sozlesme_${filename}`;

    // 📤 Supabase'e yükle
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

    const { data: publicUrlData } = supabase.storage
      .from("sozlesmeler")
      .getPublicUrl(filePath);
    const fileUrl = publicUrlData?.publicUrl;

    // 🗃️ Veritabanı kaydı
    const { error: insertError } = await supabase.from("sozlesmeler").insert([
      {
        user_id: userId,
        musteri_adi: safeMusteriAdi,
        arac_modeli: safeAracModel,
        baslangic_tarihi: safeBaslangicTarihi,
        bitis_tarihi: safeBitisTarihi,
        fiyat: safeFiyat,
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
