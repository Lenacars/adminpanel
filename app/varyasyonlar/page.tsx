"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // client tarafı
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface Arac {
  id: string;
  stok_kodu: string;
  isim: string;
  variations: Varyasyon[];
}

interface Varyasyon {
  id: string;
  kilometre: string;
  sure: string;
  fiyat: number;
}

export default function VaryasyonFiyatListesi() {
  const [araclar, setAraclar] = useState<Arac[]>([]);
  const [loading, setLoading] = useState(false);
  const [edited, setEdited] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("Araclar")
        .select(`
          id,
          stok_kodu,
          isim,
          variations!inner(id, kilometre, sure, fiyat)
        `)
        .order("stok_kodu");

      if (error) {
        toast({ title: "Hata", description: error.message });
      } else {
        setAraclar(data as Arac[]);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleFiyatChange = (id: string, value: string) => {
    setEdited((prev) => ({ ...prev, [id]: value }));
  };

  const handleFiyatKaydet = async (varyasyonId: string) => {
    const yeniFiyat = Number(edited[varyasyonId]);
    if (isNaN(yeniFiyat)) return;

    const { error } = await supabase
      .from("variations")
      .update({ fiyat: yeniFiyat })
      .eq("id", varyasyonId);

    if (error) {
      toast({ title: "Hata", description: error.message });
    } else {
      toast({ title: "Başarılı", description: "Fiyat güncellendi" });
      setEdited((prev) => {
        const copy = { ...prev };
        delete copy[varyasyonId];
        return copy;
      });

      setAraclar((prev) =>
        prev.map((a) => ({
          ...a,
          variations: a.variations.map((v) =>
            v.id === varyasyonId ? { ...v, fiyat: yeniFiyat } : v
          ),
        }))
      );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Varyasyon Fiyat Listesi</h1>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <table className="w-full table-auto border text-sm bg-white shadow rounded overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Stok Kodu</th>
              <th className="p-3 text-left">Araç</th>
              <th className="p-3 text-left">Kilometre</th>
              <th className="p-3 text-left">Süre</th>
              <th className="p-3 text-left">Fiyat (₺)</th>
              <th className="p-3 text-left">Kaydet</th>
            </tr>
          </thead>
          <tbody>
            {araclar.flatMap((arac) =>
              arac.variations.map((v) => (
                <tr key={v.id} className="border-t">
                  <td className="p-2">{arac.stok_kodu}</td>
                  <td className="p-2">{arac.isim}</td>
                  <td className="p-2">{v.kilometre}</td>
                  <td className="p-2">{v.sure}</td>
                  <td className="p-2">
                    <Input
                      type="number"
                      className="w-32"
                      defaultValue={v.fiyat}
                      onChange={(e) => handleFiyatChange(v.id, e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handleFiyatKaydet(v.id)}
                      className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                    >
                      Kaydet
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
