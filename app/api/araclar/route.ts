import { type NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { corsHeaders } from "@/lib/cors";

export async function GET(request: NextRequest) {
  try {
    const { data: products, error } = await supabase
      .from("Araclar")
      .select("*"); // sadece ürün verileri çekiliyor, variations çıkarıldı

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }

    return NextResponse.json({ data: products }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
