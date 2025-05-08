"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Calisan {
  id: string;
  ad: string;
  soyad: string;
  email: string;
  telefon: string;
  rol: string;
  aktif: boolean;
}

const ROLLER = ["superadmin", "editor", "musteri_temsilcisi"];

export default function CalisanlarPage() {
  const [calisanlar, setCalisanlar] = useState<Calisan[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    ad: "",
    soyad: "",
    email: "",
    telefon: "",
    sifre: "", // 🔥 Şifre alanı eklendi
    rol: "editor",
    aktif: true,
  });

  const [duzenlenenId, setDuzenlenenId] = useState<string | null>(null);

  useEffect(() => {
    fetchCalisanlar();
  }, []);

  async function fetchCalisanlar() {
    const { data, error } = await supabase
      .from("calisanlar")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Çalışanlar alınamadı:", error.message);
    } else {
      setCalisanlar(data || []);
    }
    setLoading(false);
  }

  async function calisanKaydet() {
    if (!form.ad || !form.soyad || !form.email || !form.sifre || !form.rol) {
      alert("Lütfen tüm gerekli alanları doldurun.");
      return;
    }

    try {
      const response = await fetch("/api/calisanlar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ad: form.ad,
          soyad: form.soyad,
          email: form.email,
          telefon: form.telefon,
          rol: form.rol,
          sifre: form.sifre,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Başarılı:", result.message);
        resetForm();
        fetchCalisanlar();
      } else {
        console.error("Hata:", result.error);
        alert("Hata: " + result.error);
      }
    } catch (error) {
      console.error("Beklenmeyen hata:", error);
    }
  }

  function duzenlemeyiBaslat(calisan: Calisan) {
    setForm({
      ad: calisan.ad || "",
      soyad: calisan.soyad || "",
      email: calisan.email || "",
      telefon: calisan.telefon || "",
      sifre: "", // 🔥 Düzenleme modunda şifre boş bırakılacak
      rol: calisan.rol || "editor",
      aktif: calisan.aktif,
    });
    setDuzenlenenId(calisan.id);
  }

  function resetForm() {
    setForm({
      ad: "",
      soyad: "",
      email: "",
      telefon: "",
      sifre: "", // 🔥
      rol: "editor",
      aktif: true,
    });
  }

  return (
    <div className="p-4 space-y-4">
      <Card className="border-[#68399e]">
        <CardHeader>
          <CardTitle className="text-[#68399e] text-xl">
            {duzenlenenId ? "Çalışanı Düzenle" : "Yeni Çalışan Ekle"}
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Ad" value={form.ad} onChange={(e) => setForm({ ...form, ad: e.target.value })} />
            <Input placeholder="Soyad" value={form.soyad} onChange={(e) => setForm({ ...form, soyad: e.target.value })} />
            <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Telefon" value={form.telefon} onChange={(e) => setForm({ ...form, telefon: e.target.value })} />
            <Input placeholder="Şifre" type="password" value={form.sifre} onChange={(e) => setForm({ ...form, sifre: e.target.value })} />
            <select
              className="border rounded px-2 py-2"
              value={form.rol}
              onChange={(e) => setForm({ ...form, rol: e.target.value })}
            >
              {ROLLER.map((rol) => (
                <option key={rol} value={rol}>
                  {rol}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={calisanKaydet}
            className="bg-[#68399e] hover:bg-[#582f87] text-white mt-2"
          >
            {duzenlenenId ? "Güncelle" : "Ekle"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#68399e] text-xl">Çalışanlar</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Yükleniyor...</p>
          ) : (
            <table className="w-full border text-sm text-left">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Ad Soyad</th>
                  <th className="border px-2 py-1">Email</th>
                  <th className="border px-2 py-1">Telefon</th>
                  <th className="border px-2 py-1">Rol</th>
                  <th className="border px-2 py-1">Aktif</th>
                  <th className="border px-2 py-1">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {calisanlar.map((c) => (
                  <tr key={c.id}>
                    <td className="border px-2 py-1">{c.ad} {c.soyad}</td>
                    <td className="border px-2 py-1">{c.email}</td>
                    <td className="border px-2 py-1">{c.telefon}</td>
                    <td className="border px-2 py-1">{c.rol}</td>
                    <td className="border px-2 py-1">{c.aktif ? "✅" : "❌"}</td>
                    <td className="border px-2 py-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => duzenlemeyiBaslat(c)}
                        className="border-[#68399e] text-[#68399e]"
                      >
                        Düzenle
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
