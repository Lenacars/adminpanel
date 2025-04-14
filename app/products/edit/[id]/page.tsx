import EditProductPage from "@/components/EditProductPage";
import { supabase } from "@/lib/supabase";

export default async function Page({ params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from("Araclar")
    .select("*, variations(*)")
    .eq("id", params.id)
    .single();

  return <EditProductPage isEdit={true} initialData={data} />;
}
