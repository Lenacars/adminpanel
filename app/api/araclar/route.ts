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

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
