import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import os from "os";
import path from "path";
import PDFDocument from "pdfkit";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Sadece POST isteklerine izin verilir" });
  }

  try {
    const {
      musteriAdi,
      adres,
      vergiDairesi,
      eposta,
      aracMarka,
      adet,
      kiraSuresi,
      kmLimiti,
      kiraTutari,
    } = req.body;

    const fontPath = path.join(process.cwd(), "fonts", "OpenSans-Regular.ttf");
    if (!fs.existsSync(fontPath)) throw new Error("❌ Font dosyası bulunamadı.");

    const fileName = `siparis-${uuidv4()}.pdf`;
    const tempPath = path.join(os.tmpdir(), fileName);

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.registerFont("OpenSans", fontPath);
    doc.font("OpenSans");

    const stream = fs.createWriteStream(tempPath);
    doc.pipe(stream);

    // Başlık
    doc.fontSize(14).text("SİPARİŞ ONAY FORMU", { align: "center" }).moveDown();
    doc.fontSize(10);

    // Taraflar
    doc.text(`1. Taraflar`);
    doc.text(`LENACARS: Eyüp Sultan Mah. Yadigâr Sk. No:30-38A İç Kapı No:78 Sancaktepe/İSTANBUL`);
    doc.text(`MÜŞTERİ: ${musteriAdi} - ${adres}`).moveDown();

    // Konu
    doc.text(`2. Konu`);
    doc.text(`Araç kiralamaya ilişkin detaylar aşağıda sunulmuştur.`).moveDown();

    // Araç Bilgisi Tablosu
    doc.text(`3. Araç Bilgileri`);
    doc.text(`Araç Marka/Model: ${aracMarka}`);
    doc.text(`Adet: ${adet}`);
    doc.text(`Kira Süresi: ${kiraSuresi}`);
    doc.text(`Km Limiti/Ay: ${kmLimiti}`);
    doc.text(`Kira Tutarı/Ay: ${kiraTutari} + KDV`).moveDown();

    // Genel Hükümlerden örnekler
    doc.text(`3.1 Aşım ücreti: Fazla her km için 6 TL + KDV.`);
    doc.text(`3.2 Kasko muafiyet oranı: Kasko değerinin %2’si.`);
    doc.text(`3.3 Teslim noktası: İstanbul Sancaktepe OTOSTAT.`).moveDown();

    // Ödeme ve Teminat
    doc.text(`4. Ödeme Şartları`);
    doc.text(`Ödemeler fatura tarihinden itibaren 5 gün içinde yapılacaktır.`);
    doc.text(`Kredi kartı tanımlanarak otomatik çekim yapılabilir.`).moveDown();

    doc.text(`5. Depozito ve Teminat`);
    doc.text(`20.000 TL depozito alınacak, borç yoksa iade edilecektir.`).moveDown();

    // İmza bölümü
    doc.moveDown().text(`Tarih: ${new Date().toLocaleDateString("tr-TR")}`);
    doc.moveDown().text(`LENA MAMA YAYINCILIK TİC. A.Ş.`, { continued: true }).text(`                             MÜŞTERİ: ${musteriAdi}`);

    doc.end();
    await new Promise((resolve) => stream.on("finish", resolve));

    const pdfBuffer = fs.readFileSync(tempPath);
    const { error: uploadError } = await supabase.storage
      .from("siparisler")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/siparisler/${fileName}`;
    const { error: dbError } = await supabase.from("siparisler").insert([
      {
        musteri_adi: musteriAdi,
        adres,
        vergi_dairesi: vergiDairesi,
        eposta,
        arac_marka: aracMarka,
        kira_suresi: kiraSuresi,
        kira_tutari: kiraTutari,
        pdf_url: publicUrl,
      },
    ]);

    if (dbError) throw dbError;

    return res.status(200).json({ message: "Sipariş PDF oluşturuldu", url: publicUrl });
  } catch (err: any) {
    console.error("🚨 Hata:", err);
    return res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
}
