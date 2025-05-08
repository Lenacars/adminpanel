// app/products/edit/[id]/page.tsx
import EditProductPage from "../../../../components/EditProductPage";
import { createClient } from "../../../../lib/supabase/server";
import { notFound } from "next/navigation";

interface Props {
  params: { id: string };
}

export default async function Page({ params }: Props) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("Araclar")
    .select("*, variations:variations!product_id(*)")
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    console.error("Supabase Hatası:", error.message);
    return (
      <div className="p-10 text-center text-red-500 text-lg">
        Ürün verisi alınırken bir hata oluştu.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-10 text-center text-red-500 text-lg">
        Ürün bulunamadı.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <EditProductPage initialData={data} />
    </div>
  );
}
