import { NextResponse } from "next/server";
import { pdf, Font } from "@react-pdf/renderer";
import SozlesmePdf from "@/components/SozlesmePdf";
import { createClient } from "@supabase/supabase-js";
// fs ve path importları artık font yüklemesi için gerekmeyebilir.
// Eğer projenizin başka bir yerinde kullanılmıyorsa kaldırılabilirler.
// import fs from "fs";
// import path from "path";
import React from "react";

// ✅ Font yüklemesi Google Fonts URL'si ile güncellendi
Font.register({
  family: "Open Sans",
  src: "https://fonts.gstatic.com/s/opensans/v29/mem8YaGs126MiZpBA-UFVZ0e.ttf", // Görseldeki gibi Google Fonts URL'si ile güncellendi
});

// ✅ Supabase bağlantısı
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { musteriAdi, aracModel, baslangicTarihi, bitisTarihi, fiyat } = body;

    console.log("📥 Gelen Form Verisi:", body);

    // ✅ React.createElement ile PDF bileşeni oluştur
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
    const filePath = `sozlesmeler/${filename}`;

    // ✅ Supabase'e yükle
    const { error } = await supabase.storage
      .from("documents")
      .upload(filePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) {
      console.error("❌ Supabase yükleme hatası:", error.message);
      return NextResponse.json({ error: "Supabase yükleme hatası", detay: error.message }, { status: 500 });
    }

    const { data } = supabase.storage.from("documents").getPublicUrl(filePath);

    console.log("✅ Sözleşme başarıyla oluşturuldu:", data?.publicUrl);
    return NextResponse.json({ url: data?.publicUrl });
  } catch (err) {
    console.error("❌ PDF oluşturulamadı:", err);
    return NextResponse.json(
      {
        error: "PDF oluşturulamadı",
        detay: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
