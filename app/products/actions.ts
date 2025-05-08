"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createProduct(productData: any) {
  try {
    const {
      name,
      description,
      condition,
      brand,
      bodyType,
      segment,
      transmission,
      fuel,
      variations,
      categories,
      cover_url,
      gallery_urls,
      id
    } = productData;

    let productId = id;

    if (!id) {
      const { data, error } = await supabase.from("Araclar").insert([
        {
          isim: name,
          aciklama: description,
          stok_durumu: condition,
          marka: brand,
          kasa_tipi: bodyType,
          segment,
          vites_tipi: transmission,
          yakit_tipi: fuel,
          kategoriler: categories,
          kapak_gorseli: cover_url,
          galeri_gorseller: gallery_urls,
        },
      ]).select("id").single();

      if (error) throw error;
      productId = data.id;
    } else {
      const { error } = await supabase.from("Araclar").update({
        isim: name,
        aciklama: description,
        stok_durumu: condition,
        marka: brand,
        kasa_tipi: bodyType,
        segment,
        vites_tipi: transmission,
        yakit_tipi: fuel,
        kategoriler: categories,
        kapak_gorseli: cover_url,
        galeri_gorseller: gallery_urls,
      }).eq("id", id);

      if (error) throw error;

      await supabase.from("variations").delete().eq("arac_id", id);
    }

    if (variations && Array.isArray(variations)) {
      const formatted = variations.map((v: any) => ({
        arac_id: productId,
        kilometre: v.kilometre,
        sure: v.sure,
        fiyat: parseFloat(v.fiyat || "0"),
        status: v.status,
      }));

      const { error: varErr } = await supabase.from("variations").insert(formatted);
      if (varErr) throw varErr;
    }

    revalidatePath("/products");
    return { success: true };
  } catch (err) {
    console.error("createProduct hata:", err);
    throw err;
  }
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from("Araclar")
    .select("*, variations(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Ürün getirilemedi:", error.message);
    return null;
  }

  return data;
}

// Not: Bu dosyayı `app/products/actions.ts` veya `lib/actions/products.ts` olarak projeye dahil et.
// Daha sonra form bileşenlerinde bu fonksiyonları doğrudan import ederek kullanabilirsin.
