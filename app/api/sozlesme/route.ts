// app/api/sozlesme/route.ts

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

// Supabase istemcisi
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    console.log("🟡 POST isteği alındı");

    const { musteriAdi, adres, vergiDairesi, eposta } = await req.json();
    console.log("✅ Form verileri alındı:", { musteriAdi, adres, vergiDairesi, eposta });

    const templatePath = path.join(process.cwd(), "app", "templates", "sozlesme-template.html");
    console.log("📄 Şablon dosyası yolu:", templatePath);

    const htmlExists = fs.existsSync(templatePath);
    console.log("📁 Şablon dosyası mevcut mu?:", htmlExists);

    if (!htmlExists) {
      throw new Error("❌ sozlesme-template.html dosyası bulunamadı.");
    }

    let html = fs.readFileSync(templatePath, "utf8");
    html = html
      .replace(/{{musteriAdi}}/g, musteriAdi)
      .replace(/{{adres}}/g, adres)
      .replace(/{{vergiDairesi}}/g, vergiDairesi)
      .replace(/{{eposta}}/g, eposta);

    const tempHtmlPath = path.join(os.tmpdir(), `sozlesme-${uuidv4()}.html`);
    fs.writeFileSync(tempHtmlPath, html, "utf8");
    console.log("✅ Geçici HTML dosyası oluşturuldu:", tempHtmlPath);

    const executablePath = await chromium.executablePath();
    console.log("🧠 Chromium executable path:", executablePath);

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });
    console.log("✅ Puppeteer başlatıldı");

    const page = await browser.newPage();
    await page.goto(`file://${tempHtmlPath}`, { waitUntil: "networkidle0" });
    console.log("🧾 Sayfa HTML yüklendi");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });
    console.log("📄 PDF oluşturuldu");

    await browser.close();
    console.log("🔒 Browser kapatıldı");

    const fileName = `sozlesme-${uuidv4()}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("sozlesmeler")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.log("❌ Supabase dosya yükleme hatası:", uploadError);
      return NextResponse.json({ message: "Yükleme hatası", error: uploadError }, { status: 500 });
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sozlesmeler/${fileName}`;
    console.log("📤 PDF yüklendi. URL:", publicUrl);

    await supabase.from("sozlesmeler").insert([
      {
        musteri_adi: musteriAdi,
        adres,
        vergi_dairesi: vergiDairesi,
        eposta,
        pdf_url: publicUrl,
      },
    ]);
    console.log("📥 Supabase veritabanına kayıt tamamlandı");

    return NextResponse.json({ message: "Sözleşme oluşturuldu", url: publicUrl });
  } catch (err: any) {
    console.error("🚨 PDF HATASI:", err);
    return NextResponse.json({ message: "Sunucu hatası", error: err?.message }, { status: 500 });
  }
}
