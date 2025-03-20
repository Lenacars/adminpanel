// adminpanel projesinde (backend)
import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { parse } from "csv-parse/sync"
import { corsHeaders } from "@/lib/cors"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400, headers: corsHeaders })
    }

    // CSV dosyasını oku
    const text = await file.text()

    // CSV'yi parse et
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    // Verileri Supabase'e ekle
    const { data, error } = await supabase.from("Araclar").insert(records)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
    }

    return NextResponse.json(
      {
        success: true,
        message: `${records.length} kayıt başarıyla eklendi`,
      },
      { headers: corsHeaders },
    )
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

