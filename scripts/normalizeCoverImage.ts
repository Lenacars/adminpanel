import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function normalizeCoverImages() {
  const { data: products, error } = await supabase.from("Araclar").select("id, cover_image");

  if (error) {
    console.error("❌ Veri çekilemedi:", error.message);
    return;
  }

  for (const product of products) {
    if (!product.cover_image) continue;

    try {
      const parts = product.cover_image.split("/");
      const fileName = parts[parts.length - 1];

      if (fileName === product.cover_image) continue; // zaten normal

      const { error: updateError } = await supabase
        .from("Araclar")
        .update({ cover_image: fileName })
        .eq("id", product.id);

      if (updateError) {
        console.error(`❌ ${product.id} güncellenemedi:`, updateError.message);
      } else {
        console.log(`✅ ${product.id} güncellendi -> ${fileName}`);
      }
    } catch (err) {
      console.error("⛔ Hata:", err);
    }
  }
}

normalizeCoverImages();
