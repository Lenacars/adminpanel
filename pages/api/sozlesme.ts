import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";
import puppeteer from "puppeteer-core";

// Supabase istemcisi
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Puppeteer executable path (local Chromium)
const chromiumExecPath = process.platform === "win32"
  ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  : "/usr/bin/google-chrome"; // Linux/macOS için ayarla

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Sadece POST isteklerine izin verilir." });
  }

  try {
    const { musteriAdi, adres, vergiDairesi, eposta } = req.body;

    // HTML şablonunu oku
    const htmlTemplatePath = path.join(process.cwd(), "public", "sozlesme-template.html");
    let html = fs.readFileSync(htmlTemplatePath, "utf8");

    // Şablondaki alanları değiştir
    html = html
      .replace(/{{musteriAdi}}/g, musteriAdi || "")
      .replace(/{{adres}}/g, adres || "")
      .replace(/{{vergiDairesi}}/g, vergiDairesi || "")
      .replace(/{{eposta}}/g, eposta || "");

    // Geçici HTML dosyası
    const tempHtmlPath = path.join(os.tmpdir(), `sozlesme-${uuidv4()}.html`);
    fs.writeFileSync(tempHtmlPath, html, "utf8");

    // Puppeteer ile PDF oluştur
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

    // Supabase'e yükle
    const { error: uploadError } = await supabase.storage
      .from("sozlesmeler")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      return res.status(500).json({ message: "Yükleme hatası", error: uploadError });
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sozlesmeler/${fileName}`;

    await supabase.from("sozlesmeler").insert([
      {
        musteri_adi: musteriAdi,
        adres,
        vergi_dairesi: vergiDairesi,
        eposta,
        pdf_url: publicUrl,
      },
    ]);

    return res.status(200).json({ message: "Sözleşme başarıyla oluşturuldu", url: publicUrl });
  } catch (err: any) {
    console.error("🚨 HATA:", err);
    return res.status(500).json({ message: "Sunucu hatası", error: err?.message });
  }
}
