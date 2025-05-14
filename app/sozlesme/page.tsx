"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SozlesmePage() {
  const [userId, setUserId] = useState<string | null>(null);

  const [form, setForm] = useState({
    musteriAdi: "",
    aracModel: "",
    baslangicTarihi: "",
    bitisTarihi: "",
    fiyat: "",
  });

  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!userId) {
      alert("Giriş yapmadan sözleşme oluşturamazsınız.");
      return;
    }

    const formWithUser = { ...form, userId };

    const res = await fetch("/api/sozlesme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formWithUser),
    });

    const data = await res.json();
    if (data?.url) {
      setPdfUrl(data.url);
      alert("✅ Sözleşme başarıyla oluşturuldu!");
    } else {
      alert("❌ Sözleşme oluşturulamadı: " + (data?.error || "Bilinmeyen hata"));
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
