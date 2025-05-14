"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

export default function SozlesmeFormPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    musteriAdi: "",
    aracModel: "",
    baslangicTarihi: "",
    bitisTarihi: "",
    fiyat: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch("/api/sozlesme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      toast({ title: "✅ Sözleşme Oluşturuldu", description: "PDF başarıyla yüklendi." });
    } else {
      toast({ title: "❌ Hata", description: data.message || "Bir sorun oluştu." });
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded space-y-4">
      <h2 className="text-lg font-semibold">Araç Kiralama Sözleşmesi Oluştur</h2>
      <div>
        <Label>Müşteri Adı</Label>
        <Input name="musteriAdi" onChange={handleChange} value={form.musteriAdi} />
      </div>
      <div>
        <Label>Araç Model</Label>
        <Input name="aracModel" onChange={handleChange} value={form.aracModel} />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <Label>Başlangıç Tarihi</Label>
          <Input type="date" name="baslangicTarihi" onChange={handleChange} value={form.baslangicTarihi} />
        </div>
        <div className="flex-1">
          <Label>Bitiş Tarihi</Label>
          <Input type="date" name="bitisTarihi" onChange={handleChange} value={form.bitisTarihi} />
        </div>
      </div>
      <div>
        <Label>Kira Bedeli (₺)</Label>
        <Input name="fiyat" onChange={handleChange} value={form.fiyat} />
      </div>
      <Button onClick={handleSubmit} disabled={loading} className="w-full mt-4">
        {loading ? "Oluşturuluyor..." : "Sözleşme PDF Oluştur"}
      </Button>
    </div>
  );
}
