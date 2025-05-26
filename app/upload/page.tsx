"use client";

import React, { useState } from "react";

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
    if (!file) {
      alert("Lütfen bir Excel dosyası seçin.");
      return;
    }

    setLoading(true);
    setResult("");
    console.clear();

    try {
      console.log("📁 Dosya seçildi:", file.name, file.size, "byte");
      console.log("🏷️ Firma değişti:", firma);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("firma", firma);

      console.log("🚀 API'ye istek gönderiliyor...");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert(`✅ ${data.message}`);
        console.log("🧾 Başarılı yanıt:", data);
      } else {
        alert(`❌ Hata: ${data.error}`);
        console.error("🚨 Hata:", data.error);
      }
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      alert("❌ Yükleme veya dönüşüm hatası.");
      console.error("🔥 try/catch:", err);
    } finally {
      setLoading(false);
      console.log("⏹️ Yükleme işlemi tamamlandı.");
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
        {loading ? "Yükleniyor..." : "Yükle"}
      </button>

      {result && (
        <pre style={{ marginTop: 20, background: "#f4f4f4", padding: 10, whiteSpace: "pre-wrap" }}>
          {result}
        </pre>
      )}
    </div>
  );
}
