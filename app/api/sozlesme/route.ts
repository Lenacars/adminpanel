import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11 },
  section: { marginBottom: 10 },
});

const DummyPdf = () =>
  React.createElement(
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

export async function POST() {
  try {
    const pdfBuffer = await pdf(React.createElement(DummyPdf)).toBuffer();

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
    return NextResponse.json(
      { error: "PDF oluşturulamadı", detay: String(err) },
      { status: 500 }
    );
  }
}
