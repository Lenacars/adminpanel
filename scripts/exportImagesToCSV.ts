// scripts/exportImagesToCSV.ts
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Supabase bilgilerin
const supabase = createClient(
  "https://uxnpmdeizkzvnevpceiw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
);

async function exportImageListToCSV() {
  const { data, error } = await supabase.storage.from("images").list("", {
    limit: 9999,
  });

  if (error) {
    console.error("❌ Hata:", error.message);
    return;
  }

  const fileList = data.map((file) => file.name);
  const csvContent = fileList.join("\n");

  const outputPath = path.join(__dirname, "images.csv");
  fs.writeFileSync(outputPath, csvContent);

  console.log(`✅ ${fileList.length} dosya listelendi ve CSV olarak kaydedildi: ${outputPath}`);
}

exportImageListToCSV();
