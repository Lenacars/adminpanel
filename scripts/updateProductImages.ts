// scripts/updateProductImages.ts

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function updateImages() {
  const { data: products, error } = await supabase.from("Araclar").select("*");
  if (error) throw error;

  const { data: files } = await supabase.storage.from("images").list("", { limit: 1000 });
  if (!files) throw new Error("Görseller listelenemedi");

  for (const product of products) {
    const isim = product.isim?.toLowerCase().replace(/\s+/g, "-");
    if (!isim) continue;

    const matching = files.find(f =>
      f.name.toLowerCase().startsWith(isim) && f.name.includes("head")
    );

    if (!matching) continue;

    const { error: updateError } = await supabase
      .from("Araclar")
      .update({ cover_image: matching.name })
      .eq("id", product.id);

    if (updateError) {
      console.error(`❌ ${product.isim}:`, updateError.message);
    } else {
      console.log(`✅ ${product.isim} → ${matching.name}`);
    }
  }
}

updateImages();
