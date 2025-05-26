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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    setLoading(true);

    try {
      const json = await convertExcelToJson(buffer, firma);
      setResult(JSON.stringify(json, null, 2));
      alert("✅ JSON başarıyla oluşturuldu!");
    } catch (err) {
      alert("Hata oluştu.");
      console.error("Dönüştürme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Excel Yükle (.xlsx)</h2>

      <label>Firma Seç:</label>
      <select value={firma} onChange={(e) => setFirma(e.target.value)}>
        {FIRMALAR.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      <br /><br />

      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleSubmit} style={{ marginLeft: 10 }} disabled={loading}>
        {loading ? "Yükleniyor..." : "Dönüştür"}
      </button>

      {result && (
        <pre style={{ marginTop: 20, background: "#f4f4f4", padding: 10 }}>
          {result}
        </pre>
      )}
    </div>
  );
}
