import { supabase } from "@/lib/supabase"
import EditForm from "@/components/edit-form"

// Veri tipini tanımlayalım (tablonuzdaki alanlara göre düzenleyin)
interface Arac {
  id: number
  // Tablonuzdaki diğer alanları buraya ekleyin
  [key: string]: any
}

export default async function EditPage({ params }: { params: { id: string } }) {
  const id = params.id

  // Veriyi çek
  const { data, error } = await supabase.from("Araclar").select("*").eq("id", id).single()

  if (error) {
    return <div className="p-8 text-red-500">Veri çekilirken bir hata oluştu: {error.message}</div>
  }

  if (!data) {
    return <div className="p-8">Kayıt bulunamadı</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Araç Düzenle</h1>
      <EditForm arac={data as Arac} />
    </div>
  )
}

