import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Geçici test bileşeni
const DummyPdf = () => (
  <Document>
    <Page size="A4" style={{ padding: 40 }}>
      <View>
        <Text style={{ fontSize: 14, fontWeight: "bold" }}>✅ Test Başarılı</Text>
        <Text>Bu PDF dışa aktarım sistemi doğru çalışıyor.</Text>
      </View>
    </Page>
  </Document>
);

export async function POST() {
  try {
    const pdfBuffer = await pdf(<DummyPdf />).toBuffer();

    const filename = `testpdf_${Date.now()}.pdf`;
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

    return NextResponse.json({ url: fileUrl });
  } catch (err: any) {
    return NextResponse.json({ error: "PDF oluşturulamadı", detay: String(err) }, { status: 500 });
  }
}
