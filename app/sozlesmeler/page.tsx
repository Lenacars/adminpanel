"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function SozlesmeFormPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    unvan: "",
    adres: "",
    vergiBilgisi: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      toast({
        title: "✅ Sözleşme Oluşturuldu",
        description: "PDF başarıyla oluşturuldu.",
      });
    } else {
      toast({
        title: "❌ Hata",
        description: data.message || "Bir hata oluştu.",
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded space-y-4">
      <h2 className="text-lg font-semibold text-center">Sözleşme Bilgileri</h2>

      <div>
        <Label>Kiracı Unvanı</Label>
        <Input name="unvan" value={form.unvan} onChange={handleChange} />
      </div>

      <div>
        <Label>Kiracı Adresi</Label>
        <Input name="adres" value={form.adres} onChange={handleChange} />
      </div>

      <div>
        <Label>Vergi Dairesi - Vergi Numarası</Label>
        <Input name="vergiBilgisi" value={form.vergiBilgisi} onChange={handleChange} />
      </div>

      <div>
        <Label>Fatura E-posta Adresi</Label>
        <Input name="email" value={form.email} onChange={handleChange} />
      </div>

      <Button className="w-full mt-4" onClick={handleSubmit} disabled={loading}>
        {loading ? "Oluşturuluyor..." : "Sözleşme PDF Oluştur"}
      </Button>
    </div>
  );
}
