"use client";

import React, { useState } from "react";
import { convertExcelToJson } from "@/scripts/convert-excel-to-json";

const FIRMALAR = [
  { label: "LeasePlan", value: "LP" },
  { label: "Turent", value: "TRF" },
  { label: "Çamkıran", value: "CMK" },
  { label: "VOX", value: "VX" },
  { label: "Garanti Filo", value: "GF" },
  { label: "OTOFLEX", value: "OFL" },
];

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [firma, setFirma] = useState("GF");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleSubmit = async () => {
    if (!file) return alert("Lütfen bir Excel dosyası seçin.");
    console.clear();

    console.log("📁 Dosya seçildi:", file.name, file.size, "byte");
    console.log("🏷️ Firma değişti:", firma);
    console.log("📤 Yükleme başlatıldı");

    const arrayBuffer = await file.arrayBuffer(); // ✅ sadece arrayBuffer kullanıyoruz
    console.log("📦 Dosya buffer'a çevrildi. Boyut:", arrayBuffer.byteLength);

    setLoading(true);

    try {
      const json = await convertExcelToJson(arrayBuffer, firma);
      console.log("✅ Excel → JSON başarıyla dönüştürüldü:", json);

      const res = await fetch("/api/araclar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ ${data.message}`);
      } else {
        alert(`❌ Hata: ${data.error}`);
      }

      console.log("🧾 Supabase yanıtı:", data);
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      alert("❌ Dönüştürme hatası.");
      console.error("🔥 Dönüştürme sırasında hata:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Excel'den Toplu Ürün Yükle (.xlsx)</h2>

      <label><strong>Firma Seç:</strong></label><br />
      <select value={firma} onChange={(e) => setFirma(e.target.value)}>
        {FIRMALAR.map((f) => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>

      <br /><br />
      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button onClick={handleSubmit} disabled={loading} style={{ marginLeft: 10 }}>
        {loading ? "Yükleniyor..." : "Dönüştür ve Yükle"}
      </button>

      {result && (
        <pre style={{ marginTop: 20, background: "#f4f4f4", padding: 10, whiteSpace: "pre-wrap" }}>
          {result}
        </pre>
      )}
    </div>
  );
}
