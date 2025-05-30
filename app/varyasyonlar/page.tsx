"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // sadece client supabase'i kullan

export default function VaryasyonTest() {
  const [veri, setVeri] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setYukleniyor(true);

      const { data, error } = await supabase
        .from("Araclar")
        .select("id, stok_kodu, isim, variations!inner(id, kilometre, sure, fiyat)")
        .order("stok_kodu");

      console.log("📦 Gelen veri:", data);
      console.log("❌ Hata varsa:", error);

      if (data) setVeri(data);
      setYukleniyor(false);
    };

    fetchData();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Varyasyon Görüntüleme</h1>

      {yukleniyor ? (
        <p>Yükleniyor...</p>
      ) : veri.length === 0 ? (
        <p>Veri bulunamadı</p>
      ) : (
        <div className="space-y-6">
          {veri.map((arac) => (
            <div key={arac.id} className="border border-gray-300 rounded-lg p-4 shadow">
              <p className="font-semibold text-purple-700">
                🚗 {arac.stok_kodu} — {arac.isim}
              </p>

              <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
                {arac.variations.map((v: any) => (
                  <li key={v.id}>
                    {v.kilometre} | {v.sure} → <strong>{v.fiyat} ₺</strong>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
