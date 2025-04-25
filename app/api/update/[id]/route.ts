import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const data = await request.json()

    // ID'yi kaldır (Supabase'de ID güncellenemez)
    delete data.id

    // created_at ve updated_at gibi alanları kaldır
    delete data.created_at
    delete data.updated_at

    const { error } = await supabase.from("Araclar").update(data).eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

