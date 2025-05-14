import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { createClient } from "@supabase/supabase-js";

// Detaylı log ekleyelim
console.log("🔍 API Route başlatılıyor...");
console.log("🔍 Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("🔍 Supabase Key var mı:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

// Supabase bağlantısı
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

console.log("🔍 Supabase client oluşturuluyor...");
const supabase = createClient(supabaseUrl, supabaseKey);
console.log("🔍 Supabase client oluşturuldu");

// PDF stilleri
const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11 },
  section: { marginBottom: 10 },
});

// Dummy PDF oluşturma
console.log("🔍 PDF şablonu hazırlanıyor...");
const DummyPdf = React.createElement(
  Document,
  null,
  React.createElement(
    Page,
    { size: "A4", style: styles.page },
    React.createElement(
      View,
      { style: styles.section },
      React.createElement(Text, { style: { fontSize: 14, fontWeight: "bold" } }, "✅ Test Başarılı"),
      React.createElement(Text, null, "Bu PDF dışa aktarım sistemi doğru çalışıyor.")
    )
  )
);
console.log("🔍 PDF şablonu hazırlandı");

export async function POST() {
  console.log("🔍 POST isteği alındı");
  try {
    console.log("🔍 PDF buffer oluşturuluyor...");
    const pdfBuffer = await pdf(DummyPdf).toBuffer();
    console.log("🔍 PDF buffer oluşturuldu, boyut:", pdfBuffer.length);

    const filename = `testpdf_${Date.now()}.pdf`;
    const filePath = `sozlesme_${filename}`;
    console.log("🔍 Dosya yolu:", filePath);

    console.log("🔍 Supabase'e yükleme başlıyor...");
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("sozlesmeler")
      .upload(filePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("🔥 Yükleme hatası:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    console.log("🔍 Yükleme başarılı, data:", uploadData);
    console.log("🔍 Public URL alınıyor...");
    
    const { data: publicUrlData } = supabase.storage
      .from("sozlesmeler")
      .getPublicUrl(filePath);
    
    console.log("🔍 Public URL data:", publicUrlData);
    const fileUrl = publicUrlData?.publicUrl;
    console.log("🔍 File URL:", fileUrl);

    return NextResponse.json({ url: fileUrl });
  } catch (err: any) {
    console.error("🔥 HATA:", err);
    console.error("🔥 HATA stack:", err.stack);
    
    // Hata detaylarını daha ayrıntılı görelim
    let errorDetails = {
      message: err.message,
      name: err.name,
      stack: err.stack,
      toString: String(err)
    };
    
    return NextResponse.json(
      { 
        error: "PDF oluşturulamadı", 
        detay: String(err),
        errorDetails
      },
      { status: 500 }
    );
  }
}

// Test için GET metodu ekleyelim
export async function GET() {
  console.log("🔍 GET isteği alındı - Supabase bağlantı testi");
  try {
    // Supabase bağlantısını test et
    console.log("🔍 Bucket listesi alınıyor...");
    const { data, error } = await supabase.storage.getBuckets();
    
    if (error) {
      console.error("🔥 Bucket listesi alınamadı:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log("🔍 Bucket listesi alındı:", data);
    return NextResponse.json({ 
      success: true, 
      message: "Supabase bağlantısı başarılı", 
      buckets: data?.map(b => b.name) 
    });
  } catch (err: any) {
    console.error("🔥 Supabase test hatası:", err);
    return NextResponse.json(
      { error: "Supabase bağlantı testi başarısız", detay: String(err) },
      { status: 500 }
    );
  }
}
