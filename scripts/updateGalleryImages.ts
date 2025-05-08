// scripts/updateGalleryImages.ts
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function updateGallery() {
  const { data: products, error } = await supabase.from("Araclar").select("id, isim");
  if (error || !products) throw error;

  const { data: files } = await supabase.storage.from("images").list("", { limit: 1000 });
  if (!files) throw new Error("📁 Bucket içeriği listelenemedi");

  for (const product of products) {
    const isimKodu = product.isim.toLowerCase().replace(/[^a-z0-9]/gi, "-");

    const matchedGallery = files
      .filter((f) =>
        f.name.toLowerCase().startsWith(isimKodu) &&
        !f.name.toLowerCase().includes("head") // sadece kapak olmayanlar
      )
      .map((f) => f.name);

    if (!matchedGallery.length) continue;

    const { error: updateError } = await supabase
      .from("Araclar")
      .update({ gallery_images: matchedGallery })
      .eq("id", product.id);

    if (updateError) {
      console.error(`❌ ${product.isim}:`, updateError.message);
    } else {
      console.log(`✅ ${product.isim} → ${matchedGallery.length} galeri görseli eklendi.`);
    }
  }
}

updateGallery();
