// app/products/edit/[id]/page.tsx
import EditProductPage from "../../../../components/EditProductPage";
import { createClient } from "../../../../lib/supabase/server";
import { notFound } from "next/navigation"; // Next.js'in notFound fonksiyonu
import Link from "next/link"; // Link bileşeni
import { Button } from "@/components/ui/button"; // shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // shadcn/ui
import { AlertTriangle, FileSearch } from "lucide-react"; // İkonlar

interface Props {
  params: { id: string };
}

// Kurumsal renk (hata/bilgi kartlarındaki butonlarda kullanılabilir)
const corporateColor = "#6A3C96";

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
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <Card className="w-full max-w-lg text-center shadow-xl">
          <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-700">Bir Hata Oluştu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Ürün bilgileri yüklenirken beklenmedik bir sorunla karşılaşıldı. Lütfen daha sonra tekrar deneyin veya sistem yöneticisi ile iletişime geçin.
            </p>
            <Button asChild variant="outline">
              <Link href="/products">Araç Listesine Dön</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!productData) {
    notFound(); // Ürün bulunamadıysa Next.js'in not-found mekanizmasını tetikle
    // Bu, app/products/not-found.tsx veya app/not-found.tsx dosyasını render eder.
    // Alternatif olarak, aşağıdaki gibi özel bir mesaj da gösterebilirsiniz:
    /*
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <Card className="w-full max-w-lg text-center shadow-xl">
          <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 mb-4">
              <FileSearch className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-yellow-700">Ürün Bulunamadı</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Aradığınız ID'ye ({params.id}) sahip bir araç bulunamadı. Lütfen ID'yi kontrol edin veya araç listesine geri dönün.
            </p>
            <Button asChild style={{ backgroundColor: corporateColor, color: 'white' }} className="hover:opacity-90">
              <Link href="/products">Araç Listesine Dön</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
    */
  }

  // 2. Varyasyonları ayrı çek
  // Not: Eğer varyasyonlar kritikse ve yüklenemezse, productData gibi bir hata mesajı gösterilebilir.
  // Şimdilik sadece logluyoruz ve boş dizi geçiyoruz.
  const { data: variationsData, error: variationsError } = await supabase
    .from("variations")
    .select("*")
    .eq("arac_id", params.id);

  if (variationsError) {
    console.error("Varyasyon verisi alınırken hata (sayfa yine de yüklenecek):", variationsError.message);
    // İsteğe bağlı: Kullanıcıya varyasyonların yüklenemediğine dair bir uyarı gösterilebilir.
    // toast({ title: "Uyarı", description: "Araca ait varyasyonlar yüklenirken bir sorun oluştu.", variant: "default" });
    // Bu bir server component olduğu için toast doğrudan burada kullanılamaz.
    // Bu uyarı EditProductPage içinde client-side olarak gösterilebilir.
  }

  return (
    // EditProductPage'in kendi padding'i varsa bu dış sarmalayıcıya padding gerekmeyebilir.
    // NewProductPage'deki gibi bir genel sayfa yapısı için:
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
        {/* EditProductPage zaten kendi Card yapısını içeriyor, bu yüzden burada doğrudan render ediyoruz.
            NewProductPage'de ise EditProductPage bir Card içine alınmıştı çünkü NewProductPage'in kendi başlığı vardı.
            Burada başlık EditProductPage içinde (mode === 'edit' durumuna göre) yönetiliyor.
        */}
      <EditProductPage
        initialData={productData} // Product tip uyumluluğu EditProductPage'de sağlanmalı
        initialVariations={variationsData || []} // EditProductPage bu prop adını bekliyor
        mode="edit"
      />
    </div>
  );
}
