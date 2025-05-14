import { NextResponse } from "next/server";
import { writeFile, readFile, unlink } from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import { createClient } from "@supabase/supabase-js";

// Supabase bağlantısı
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.json();

  // Geçici klasöre JSON veri dosyası yaz
  const filename = `sozlesme_${Date.now()}`;
  const tempDir = "/tmp";
  const jsonPath = path.join(tempDir, `${filename}.json`);
  const outputPdfPath = path.join(tempDir, `${filename}.pdf`);

  await writeFile(jsonPath, JSON.stringify(body, null, 2));

  // Python scripti çalıştır
  const scriptPath = path.join(process.cwd(), "scripts", "sozlesme", "sozlesme_olustur.py");

  const pythonProcess = spawn("python3", [scriptPath, jsonPath, outputPdfPath]);

  const result = await new Promise<{ success: boolean; error?: string }>((resolve) => {
    pythonProcess.on("close", (code) => {
      if (code === 0) {
        resolve({ success: true });
      } else {
        resolve({ success: false, error: `Kod: ${code}` });
      }
    });
  });

  if (!result.success) {
    return NextResponse.json({ error: "Python script çalıştırılamadı", detay: result.error }, { status: 500 });
  }

  // PDF dosyasını oku ve Supabase'e yükle
  const fileBuffer = await readFile(outputPdfPath);
  const storagePath = `sozlesmeler/${filename}.pdf`;

  const { data, error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, fileBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: "PDF yüklenemedi", detay: uploadError.message }, { status: 500 });
  }

  // Dosya URL'sini al
  const { data: publicUrlData } = supabase.storage.from("documents").getPublicUrl(storagePath);

  // Geçici dosyaları sil
  await unlink(jsonPath);
  await unlink(outputPdfPath);

  return NextResponse.json({ url: publicUrlData?.publicUrl });
}
