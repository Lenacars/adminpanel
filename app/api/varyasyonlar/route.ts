import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { corsHeaders } from "@/lib/cors";

export async function GET() {
  const { data, error } = await supabase
    .from("variations")
    .select(`
      id,
      kilometre,
      sure,
      fiyat,
      araclar:arac_id (
        stok_kodu,
        isim
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Varyasyon verisi alınamadı:", error);
    return NextResponse.json({ error: "Varyasyonlar çekilemedi" }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 200, headers: corsHeaders });
}
