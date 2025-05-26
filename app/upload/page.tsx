"use client";

import React, { useState } from "react";
import { convertExcelToJson } from "@/scripts/convert-excel-to-json";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleSubmit = async () => {
    if (!file) {
      alert("Lütfen bir Excel dosyası seçin.");
      return;
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    setLoading(true);

    try {
      const json = await convertExcelToJson(buffer);
      setResult(JSON.stringify(json, null, 2));
      alert("✅ JSON başarıyla oluşturuldu!");
    } catch (err) {
      alert("Bir hata oluştu.");
      console.error("Dönüştürme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Excel Yükle (.xlsx)</h2>
      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        onClick={handleSubmit}
        style={{ marginLeft: 10 }}
        disabled={loading}
      >
        {loading ? "Yükleniyor..." : "Excel Dönüştür"}
      </button>

      {result && (
        <pre style={{ marginTop: 20, background: "#f4f4f4", padding: 10 }}>
          {result}
        </pre>
      )}
    </div>
  );
}
