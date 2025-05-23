// app/products/edit/[id]/page.tsx
import EditProductPage from "../../../../components/EditProductPage";
import { createClient } from "../../../../lib/supabase/server";
import { notFound } from "next/navigation";

interface Props {
  params: { id: string };
}

export default async function Page({ params }: Props) {
  const supabase = createClient();

  // 1. Ürün verisini çek
  const { data: productData, error: productError } = await supabase
    .from("Araclar")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (productError) {
    console.error("Ürün verisi alınırken hata:", productError.message);
    return (
      <div className="p-10 text-center text-red-500 text-lg">
        Ürün verisi alınırken bir hata oluştu.
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="p-10 text-center text-red-500 text-lg">
        Ürün bulunamadı.
      </div>
    );
  }

  // 2. Varyasyonları ayrı çek
  const { data: variationsData, error: variationsError } = await supabase
    .from("variations")
    .select("*")
    .eq("arac_id", params.id);

  if (variationsError) {
    console.error("Varyasyon verisi alınırken hata:", variationsError.message);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <EditProductPage
        initialData={productData}
        variations={variationsData || []}
        mode="edit"
      />
    </div>
  );
}
