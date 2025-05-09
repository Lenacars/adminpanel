"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface Yorum {
  id: string;
  yorum: string;
  puan: number;
  created_at: string;
  user_id: string;
  kullanici?: {
    ad: string;
    soyad: string;
    email: string;
  };
}

export default function YorumlarPage() {
  const [yorumlar, setYorumlar] = useState<Yorum[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchYorumlar = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("yorumlar")
      .select("*, kullanici:kullanicilar(ad,soyad,email)")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Hata", description: "Yorumlar alınamadı", variant: "destructive" });
    } else {
      setYorumlar(data || []);
    }

    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const onay = confirm("Bu yorumu silmek istediğinize emin misiniz?");
    if (!onay) return;

    const { error } = await supabase.from("yorumlar").delete().eq("id", id);
    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Silindi", description: "Yorum başarıyla silindi." });
      setYorumlar(prev => prev.filter((y) => y.id !== id));
    }
  };

  useEffect(() => {
    fetchYorumlar();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Yorumlar</h1>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : yorumlar.length === 0 ? (
        <p>Hiç yorum bulunamadı.</p>
      ) : (
        <div className="space-y-4">
          {yorumlar.map((y) => (
            <div key={y.id} className="border p-4 rounded bg-white shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-700">
                  <strong>{y.kullanici?.ad} {y.kullanici?.soyad}</strong>{" "}
                  <span className="text-gray-500">({y.kullanici?.email})</span>
                </div>
                <div className="text-sm text-gray-600">{new Date(y.created_at).toLocaleString()}</div>
              </div>
              <div className="text-gray-800 mb-2">{y.yorum}</div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-600 font-semibold">{y.puan} ⭐</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(y.id)}
                >
                  Sil
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
