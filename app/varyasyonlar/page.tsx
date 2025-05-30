import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";

interface Varyasyon {
  id: string;
  kilometre: string;
  sure: string;
  fiyat: number;
  araclar: {
    stok_kodu: string;
    isim: string;
  } | null;
}

export default async function VaryasyonListPage() {
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
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Varyasyon Fiyat Listesi</h1>
        <p className="text-red-500">Veri alınırken hata oluştu: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Varyasyon Fiyat Listesi</h1>

      {(!data || data.length === 0) && (
        <p className="text-gray-500">Veri bulunamadı</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.map((item: Varyasyon) => (
          <Card key={item.id}>
            <CardContent className="p-4 space-y-1">
              <p><strong>Stok Kodu:</strong> {item.araclar?.stok_kodu || "-"}</p>
              <p><strong>Araç:</strong> {item.araclar?.isim || "-"}</p>
              <p><strong>Kilometre:</strong> {item.kilometre}</p>
              <p><strong>Süre:</strong> {item.sure}</p>
              <p><strong>Fiyat:</strong> ₺{item.fiyat.toLocaleString("tr-TR")}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
