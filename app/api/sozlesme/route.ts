import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import SozlesmePdf from "@/components/SozlesmePdf";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

console.log("🔄 Sözleşme API başladı");

// Supabase client başlatılıyor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log("🌍 SUPABASE URL:", supabaseUrl);
console.log("🔐 SUPABASE KEY var mı:", !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    console.log("📩 POST isteği geldi");

    const body = await req.json();
    console.log("📦 Gelen body:", body);

    const { musteriAdi, aracModel, baslangicTarihi, bitisTarihi, fiyat } = body;

    if (!musteriAdi || !aracModel || !baslangicTarihi || !bitisTarihi || !fiyat) {
      console.error("❌ Eksik alanlar");
      return NextResponse.json({ message: "Eksik alanlar var" }, { status: 400 });
    }

    const fileName = `sozlesme-${uuidv4()}.pdf`;
    console.log("📄 Dosya adı:", fileName);

    const component = React.createElement(SozlesmePdf, {
      musteriAdi,
      aracModel,
      baslangicTarihi,
      bitisTarihi,
      fiyat,
    });

    const pdfBuffer = await pdf(component).toBuffer();
    console.log("✅ PDF buffer oluşturuldu. Boyut:", pdfBuffer.length);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("sozlesmeler")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("🚨 PDF yükleme hatası:", uploadError);
      return NextResponse.json({ message: "PDF yüklenemedi", error: uploadError }, { status: 500 });
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/sozlesmeler/${fileName}`;
    console.log("📂 PDF URL:", publicUrl);

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
      console.error("📛 DB kayıt hatası:", insertError);
      return NextResponse.json({ message: "Veritabanına kayıt eklenemedi", error: insertError }, { status: 500 });
    }

    console.log("✅ Başarıyla tamamlandı.");
    return NextResponse.json({ message: "Başarıyla yüklendi", url: publicUrl });
  } catch (error) {
    console.error("🔥 Beklenmeyen sunucu hatası:", error);
    return NextResponse.json({ message: "Sunucu hatası", error }, { status: 500 });
  }
}
