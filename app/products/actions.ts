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
          durum: condition,
          brand: brand,
          bodyType: bodyType,
          segment: segment,
          vites: transmission,
          yakit_turu: fuel,
          category: categories,
          cover_image: cover_url,
          gallery_images: gallery_urls,
        },
      ]).select("id").single();

      if (error) throw error;
      productId = data.id;
    } else {
      const { error } = await supabase.from("Araclar").update({
        isim: name,
        aciklama: description,
        durum: condition,
        brand: brand,
        bodyType: bodyType,
        segment: segment,
        vites: transmission,
        yakit_turu: fuel,
        category: categories,
        cover_image: cover_url,
        gallery_images: gallery_urls,
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
