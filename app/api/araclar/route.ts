import { type NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { corsHeaders } from "@/lib/cors";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  try {
    const { data: products, error } = await supabase
      .from("Araclar")
      .select("*, variations:variations!arac_id(fiyat, status)")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }

    const formatted = products.map((item) => ({
      ...item,
      cover_image: item.cover_image?.replace(/^\/+/, ""),
      gallery_images: item.gallery_images?.map((img: string) => img.replace(/^\/+/, "")),
      variations: item.variations || []
    }));

    return NextResponse.json({ data: formatted }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let successCount = 0;

    for (const item of body) {
      const {
        model,
        yakit,
        vites,
        stok_kodu,
        cover_image,
        gallery_images,
        varyasyonlar = []
      } = item;

      const arac_id = uuidv4();
      const fiyat = parseFloat(varyasyonlar[0]?.fiyat || "0");

      const { error: insertError } = await supabase.from("Araclar").insert({
        id: arac_id,
        isim: model,
        yakit_turu: yakit,
        vites,
        stok_kodu,
        cover_image: cover_image?.replace(/^\/+/, ""),
        gallery_images: gallery_images?.map((img: string) => img.replace(/^\/+/, "")),
        fiyat
      });

      if (insertError) {
        console.error("❌ Araç ekleme hatası:", insertError.message);
        continue;
      }

      const varyasyonInsert = varyasyonlar.map((v: any) => ({
        id: uuidv4(),
        arac_id,
        fiyat: parseFloat(v.fiyat || "0"),
        kilometre: v.km,
        sure: v.sure,
        status: "Yayında"
      }));

      if (varyasyonInsert.length > 0) {
        const { error: varError } = await supabase.from("variations").insert(varyasyonInsert);
        if (varError) {
          console.error("⚠️ Varyasyon ekleme hatası:", varError.message);
        }
      }

      successCount++;
    }

    return NextResponse.json({ message: `${successCount} ürün başarıyla eklendi.` }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("🔥 Hata:", error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
