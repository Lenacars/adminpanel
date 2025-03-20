import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { parse } from 'csv-parse/sync'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })
    }
    
    // CSV dosyasını oku
    const text = await file.text()
    
    // CSV'yi parse et
    const records = parse(text, {
      columns: true, // İlk satırı başlık olarak kullan
      skip_empty_lines: true,
      trim: true,
    })
    
    // Verileri Supabase'e ekle
    const { data, error } = await supabase
      .from('Araclar') // Tablonuzun adını buraya yazın
      .insert(records)
    
    if (error) {
      console.error('Supabase hatası:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `${records.length} kayıt başarıyla eklendi` 
    })
  } catch (error: any) {
    console.error('CSV yükleme hatası:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
