// app/api/sozlesme/route.ts

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import puppeteer from "puppeteer-core";
import { createClient } from "@supabase/supabase-js";

// Supabase bağlantısı
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Chrome yolunu belirle (lokal için)
const chromiumExecPath = process.platform === "win32"
  ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  : "/usr/bin/google-chrome"; // Linux/macOS

export async function POST(req: Request) {
  try {
    const { musteriAdi, adres, vergiDairesi, eposta } = await req.json();

    // HTML şablon yolu (DOĞRU KLASÖR)
    const templatePath = path.join(process.cwd(), "app", "templates", "sozlesme-template.html");

    // HTML oku ve değişkenleri değiştir
    let html = fs.readFileSync(templatePath, "utf8");
    html = html
      .replace(/{{musteriAdi}}/g, musteriAdi)
      .replace(/{{adres}}/g, adres)
      .replace(/{{vergiDairesi}}/g, vergiDairesi)
      .replace(/{{eposta}}/g, eposta);

    // Geçici HTML oluştur
    const tempHtmlPath = path.join(os.tmpdir(), `sozlesme-${uuidv4()}.html`);
    fs.writeFileSync(tempHtmlPath, html, "utf8");

    // Puppeteer başlat
    const browser = await puppeteer.launch({
      headless: "new",
      executablePath: chromiumExecPath,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(`file://${tempHtmlPath}`, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
      printBackground: true,
    });

    await browser.close();

    const fileName = `sozlesme-${uuidv4()}.pdf`;

    // PDF'yi Supabase'e yükle
    const { error: uploadError } = await supabase.storage
      .from("sozlesmeler")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ message: "Yükleme hatası", error: uploadError }, { status: 500 });
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sozlesmeler/${fileName}`;

    // Veritabanına kaydet
    await supabase.from("sozlesmeler").insert([
      {
        musteri_adi: musteriAdi,
        adres,
        vergi_dairesi: vergiDairesi,
        eposta,
        pdf_url: publicUrl,
      },
    ]);

    return NextResponse.json({ message: "Sözleşme oluşturuldu", url: publicUrl });
  } catch (err: any) {
    console.error("🚨 PDF HATASI:", err);
    return NextResponse.json({ message: "Sunucu hatası", error: err?.message }, { status: 500 });
  }
}
