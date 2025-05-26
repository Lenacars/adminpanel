import { type NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { corsHeaders } from "@/lib/cors";

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
    const body = await request.json(); // JSON olarak gelen ürün listesi
    let successCount = 0;

    for (const item of body) {
      const { model, yakit, vites, stok_kodu, cover_image, gallery_images, varyasyonlar } = item;

      const { data: arac, error } = await supabase.from("Araclar").insert({
        title: model,
        yakit_turu: yakit,
        vites,
        stok_kodu,
        cover_image: cover_image?.replace(/^\/+/, ""),
        gallery_images: gallery_images?.map((img: string) => img.replace(/^\/+/, ""))
      }).select().single();

      if (error || !arac) continue;

      for (const varyasyon of varyasyonlar || []) {
        await supabase.from("variations").insert({
          arac_id: arac.id,
          fiyat: Number(varyasyon.fiyat),
          kilometre: varyasyon.km,
          sure: varyasyon.sure,
          status: "yayinda"
        });
      }

      successCount++;
    }

    return NextResponse.json({ message: `${successCount} ürün eklendi.` }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
