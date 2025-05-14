"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SozlesmePage() {
  const [form, setForm] = useState({
    musteriAdi: "",
    aracModel: "",
    baslangicTarihi: "",
    bitisTarihi: "",
    fiyat: "",
  });

  const [pdfUrl, setPdfUrl] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const res = await fetch("/api/sozlesme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (data?.url) {
      setPdfUrl(data.url);
      alert("✅ Sözleşme başarıyla oluşturuldu!");
    } else {
      alert("❌ Sözleşme oluşturulamadı.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-4">
      <h1 className="text-2xl font-bold">Sözleşme Oluştur</h1>

      <div className="space-y-2">
        <Label htmlFor="musteriAdi">Müşteri Adı</Label>
        <Input id="musteriAdi" name="musteriAdi" value={form.musteriAdi} onChange={handleChange} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="aracModel">Araç Modeli</Label>
        <Input id="aracModel" name="aracModel" value={form.aracModel} onChange={handleChange} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="baslangicTarihi">Başlangıç Tarihi</Label>
        <Input type="date" id="baslangicTarihi" name="baslangicTarihi" value={form.baslangicTarihi} onChange={handleChange} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bitisTarihi">Bitiş Tarihi</Label>
        <Input type="date" id="bitisTarihi" name="bitisTarihi" value={form.bitisTarihi} onChange={handleChange} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fiyat">Fiyat</Label>
        <Input id="fiyat" name="fiyat" value={form.fiyat} onChange={handleChange} />
      </div>

      <Button onClick={handleSubmit} className="mt-4">Sözleşme Oluştur</Button>

      {pdfUrl && (
        <div className="mt-6">
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            Sözleşmeyi Görüntüle
          </a>
        </div>
      )}
    </div>
  );
}
