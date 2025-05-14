import { NextResponse } from "next/server";
import { pdf, Font } from "@react-pdf/renderer";
import SozlesmePdf from "@/components/SozlesmePdf";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Open Sans fontu yükle
const fontBuffer = fs.readFileSync(path.resolve("fonts/OpenSans-Regular.ttf"));
Font.register({
  family: "Open Sans",
  fonts: [{ src: fontBuffer }],
});

// Supabase bağlantısı
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { musteriAdi, aracModel, baslangicTarihi, bitisTarihi, fiyat } = body;

    const pdfBuffer = await pdf(
      <SozlesmePdf
        musteriAdi={musteriAdi}
        aracModel={aracModel}
        baslangicTarihi={baslangicTarihi}
        bitisTarihi={bitisTarihi}
        fiyat={fiyat}
      />
    ).toBuffer();

    const filename = `sozlesme_${Date.now()}.pdf`;
    const filePath = `sozlesmeler/${filename}`;

    const { error } = await supabase.storage
      .from("documents")
      .upload(filePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = supabase.storage.from("documents").getPublicUrl(filePath);
    return NextResponse.json({ url: data?.publicUrl });
  } catch (err) {
    return NextResponse.json({ error: "PDF oluşturulamadı", detay: String(err) }, { status: 500 });
  }
}
