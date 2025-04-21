"use client";

import React, { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleSubmit = async () => {
    if (!file) {
      alert("Lütfen bir CSV dosyası seçin.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
      alert(data.message || "Yükleme tamamlandı");
    } catch (err) {
      alert("Bir hata oluştu.");
      console.error("Yükleme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>CSV Yükle</h2>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        onClick={handleSubmit}
        style={{ marginLeft: 10 }}
        disabled={loading}
      >
        {loading ? "Yükleniyor..." : "CSV Yükle"}
      </button>

      {result && (
        <pre style={{ marginTop: 20, background: "#f4f4f4", padding: 10 }}>
          {result}
        </pre>
      )}
    </div>
  );
}
