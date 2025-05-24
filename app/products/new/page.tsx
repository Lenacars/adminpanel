"use client";

import React, { useState }
from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import EditProductPage from "@/components/EditProductPage"; // Bu bileşenin var olduğunu ve propları alabileceğini varsayıyoruz
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // shadcn/ui Card bileşenleri
import { toast } from "@/hooks/use-toast"; // shadcn/ui toast

// EditProductPage'in alabileceği proplar için bir interface (varsayımsal)
// Gerçek EditProductPage bileşeninizin proplarına göre ayarlamanız gerekebilir.
interface ProductData {
  id?: string; // Yeni üründe ID olmayabilir veya UUID ile oluşturulabilir
  isim: string;
  aciklama: string;
  kisa_aciklama: string;
  stok_kodu: string;
  segment: string;
  yakit_turu: string;
  vites: string;
  durum: string;
  brand: string;
  category: string;
  fiyat: number;
  bodyType: string;
  cover_image: string;
  gallery_images: string[];
}

interface VariationData {
  id: string;
  kilometre: string;
  sure: string;
  fiyat: number;
  status: string;
  arac_id?: string; // Yeni eklenirken bu olmayabilir, kayıttan sonra atanır
}


export default function NewProductPage() {
  const [saving, setSaving] = useState(false);

  // Kurumsal Renk (Başlıkta kullanılabilir)
  const corporateColor = "#6A3C96";

  const emptyProduct: ProductData = {
    // id: uuidv4(), // ID'yi Supabase'in oluşturmasına izin vermek daha iyi olabilir veya form içinde üretilebilir. Şimdilik boş.
    isim: "",
    aciklama: "",
    kisa_aciklama: "",
    stok_kodu: "",
    segment: "Ekonomik", // Varsayılan değerler
    yakit_turu: "Benzin",
    vites: "Manuel",
    durum: "Sıfır",
    brand: "Audi", // Varsayılan bir marka veya boş bırakılabilir
    category: "",
    fiyat: 0,
    bodyType: "Sedan",
    cover_image: "",
    gallery_images: [],
  };

  const emptyVariations: VariationData[] = [
    {
      id: uuidv4(), // Her varyasyon için benzersiz bir client-side ID
      kilometre: "1.000 KM/Ay", // Varsayılan değerler
      sure: "3 Ay",
      fiyat: 0,
      status: "Aktif",
    },
  ];

  const handleSave = async (productData: ProductData, variationsData: VariationData[]) => {
    setSaving(true);
    try {
      // Ürünü ekle
      const productToInsert = {
        isim: productData.isim,
        stok_kodu: productData.stok_kodu,
        kisa_aciklama: productData.kisa_aciklama,
        aciklama: productData.aciklama,
        yakit_turu: productData.yakit_turu,
        vites: productData.vites,
        brand: productData.brand,
        segment: productData.segment,
        bodyType: productData.bodyType,
        durum: productData.durum,
        fiyat: productData.fiyat,
        cover_image: productData.cover_image,
        gallery_images: productData.gallery_images,
        category: productData.category,
        // id: productData.id || undefined, // Eğer client'da ID oluşturuluyorsa
      };

      const { data: newProduct, error: productError } = await supabase
        .from("Araclar")
        .insert([productToInsert])
        .select()
        .single();

      if (productError) {
        console.error("Ürün ekleme hatası:", productError);
        toast({
          title: "Hata",
          description: `Ürün eklenirken bir hata oluştu: ${productError.message}`,
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      // Varyasyonları ekle
      if (newProduct?.id) {
        const variationsToInsert = variationsData.map((v) => ({
          kilometre: v.kilometre,
          sure: v.sure,
          fiyat: v.fiyat,
          status: v.status,
          arac_id: newProduct.id, // Yeni eklenen aracın ID'si
          // id: v.id, // Eğer client-side ID'yi DB'ye de kaydetmek isterseniz (opsiyonel)
        }));

        if (variationsToInsert.length > 0) {
            const { error: variationsError } = await supabase
            .from("variations")
            .insert(variationsToInsert);

            if (variationsError) {
            console.error("Varyasyon ekleme hatası:", variationsError);
            toast({
                title: "Hata",
                description: `Varyasyonlar eklenirken bir hata oluştu: ${variationsError.message}`,
                variant: "destructive",
            });
            // Burada işlem yarıda kaldı, newProduct silinmeli mi? (rollback logic) - şimdilik basit tutuyoruz.
            setSaving(false);
            return;
            }
        }
      }

      toast({
        title: "Başarılı",
        description: "Araç ve varyasyonları başarıyla eklendi.",
        variant: "default", // veya "success" temanızda varsa
      });
      
      // Formu sıfırlamak veya kullanıcıyı ürün listesine yönlendirmek gibi işlemler burada yapılabilir.
      // Örneğin: router.push('/products');
      // Veya EditProductPage'e bir reset callback'i geçilebilir.

    } catch (error: any) {
      console.error("Genel kayıt hatası:", error);
      toast({
        title: "Beklenmedik Hata",
        description: error.message || "Bir hata oluştu, lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <Card className="max-w-4xl mx-auto shadow-lg"> {/* Formun max genişliği ayarlandı */}
        <CardHeader>
          <CardTitle className="text-2xl font-bold" style={{ color: corporateColor }}>
            Yeni Araç Ekle
          </CardTitle>
          <CardDescription>
            Yeni bir araç ve kiralama varyasyonlarını sisteme ekleyin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditProductPage
            initialData={emptyProduct}
            initialVariations={emptyVariations} // Prop adı initialVariations olarak değiştirildi (daha anlamlı)
            mode="create"
            onSave={handleSave} // Kaydetme fonksiyonu prop olarak geçirildi
            isSaving={saving}   // Yüklenme durumu prop olarak geçirildi
          />
        </CardContent>
      </Card>
    </div>
  );
}
