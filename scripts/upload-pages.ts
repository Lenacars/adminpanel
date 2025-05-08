// scripts/upload-pages.ts

import { createClient } from "@supabase/supabase-js";
import { pages } from "./pages-data";

// 🔥 Burayı kendi Supabase bilgilerinle değiştirmen gerekiyor!
const supabaseUrl = "https://uxnpmdeizkzvnevpceiw.supabase.co"; 
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4bnBtZGVpemt6dm5ldnBjZWl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjMzMjY0MywiZXhwIjoyMDU3OTA4NjQzfQ.VGvyVaNKfZcaXsPjWsuSoMtDENFKk_FBUU6PFEZO8lM"; 

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadPages() {
  for (const page of pages) {
    const { data, error } = await supabase.from("Pages").insert([page]);

    if (error) {
      console.error(`❌ ${page.title} eklenemedi:`, error.message);
    } else {
      console.log(`✅ ${page.title} başarıyla eklendi!`);
    }
  }
}

uploadPages();
