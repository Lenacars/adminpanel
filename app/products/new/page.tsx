"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import EditProductPage from "@/components/EditProductPage";

export default function NewProductPage() {
  const [saving, setSaving] = useState(false);

  const emptyProduct = {
    id: "",
    isim: "",
    aciklama: "",
    kisa_aciklama: "",
    stok_kodu: "",
    segment: "Ekonomik",
    yakit_turu: "Benzin",
    vites: "Manuel",
    durum: "Sıfır",
    brand: "Audi",
    category: "",
    fiyat: 0,
    bodyType: "Sedan",
    cover_image: "",
    gallery_images: [],
  };

  const emptyVariations = [
    {
      id: uuidv4(),
      kilometre: "1.000 KM/Ay",
      sure: "3 Ay",
      fiyat: 0,
      status: "Aktif",
    },
  ];

  const handleSave = async (product: any, variations: any[]) => {
    setSaving(true);
    try {
      // Ürünü ekle
      const { data: newProduct, error: productError } = await supabase
        .from("Araclar")
        .insert([
          {
            isim: product.isim,
            stok_kodu: product.stok_kodu,
            kisa_aciklama: product.kisa_aciklama,
            aciklama: product.aciklama,
            yakit_turu: product.yakit_turu,
            vites: product.vites,
            brand: product.brand,
            segment: product.segment,
            bodyType: product.bodyType,
            durum: product.durum,
            fiyat: product.fiyat,
            cover_image: product.cover_image,
            gallery_images: product.gallery_images,
            category: product.category,
          },
        ])
        .select()
        .single();

      if (productError) {
        console.error("Ürün ekleme hatası:", productError);
        alert("Ürün eklenirken bir hata oluştu: " + productError.message);
        setSaving(false);
        return;
      }

      // Varyasyonları ekle
      if (newProduct?.id) {
        const variationsToInsert = variations.map((v) => ({
          kilometre: v.kilometre,
          sure: v.sure,
          fiyat: v.fiyat,
          status: v.status,
          arac_id: newProduct.id,
        }));

        const { error: variationsError } = await supabase
          .from("variations")
          .insert(variationsToInsert);

        if (variationsError) {
          console.error("Varyasyon ekleme hatası:", variationsError);
          alert("Varyasyonlar eklenirken bir hata oluştu: " + variationsError.message);
          setSaving(false);
          return;
        }
      }

      alert("Ürün başarıyla eklendi ✅");
      // İstersen burada formu sıfırlayabiliriz
    } catch (error) {
      console.error("Genel kayıt hatası:", error);
      alert("Beklenmeyen bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <EditProductPage
        initialData={emptyProduct}
        variations={emptyVariations}
        mode="create"
      />
    </div>
  );
}
