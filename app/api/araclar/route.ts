// adminpanel projesinde (backend)
import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { corsHeaders } from "@/lib/cors"

export async function GET(request: NextRequest) {
  try {
    // CORS başlıklarını ekle
    const response = NextResponse.next()
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    // Verileri çek
    const { data, error } = await supabase.from("Araclar").select("*")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
    }

    return NextResponse.json({ data }, { headers: corsHeaders })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

