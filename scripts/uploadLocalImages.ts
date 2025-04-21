// scripts/uploadLocalImages.ts
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import mime from "mime";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const LOCAL_FOLDER_PATH = "C:/Users/Lena/Desktop/Araç Görselleri"; // kendi klasör yolu

function getAllImageFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllImageFiles(fullPath, fileList);
    } else {
      const ext = path.extname(fullPath).toLowerCase();
      const allowed = [".jpg", ".jpeg", ".png", ".webp"];
      if (allowed.includes(ext)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

async function uploadAllImages() {
  const files = getAllImageFiles(LOCAL_FOLDER_PATH);
  for (const fullPath of files) {
    const fileName = path.basename(fullPath);
    const fileBuffer = fs.readFileSync(fullPath);
    const mimeType = mime.getType(fullPath) || "application/octet-stream";

    const { error } = await supabase.storage
      .from("images")
      .upload(fileName, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.error(`❌ ${fileName} yüklenemedi:`, error.message);
    } else {
      const url = `${process.env.SUPABASE_URL}/storage/v1/object/public/images/${fileName}`;
      console.log(`✅ ${fileName} yüklendi: ${url}`);
    }
  }
}

uploadAllImages();
