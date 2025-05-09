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
  const [openUser, setOpenUser] = useState<string | null>(null);

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

  const grouped = yorumlar.reduce((acc, yorum) => {
    const key = yorum.user_id;
    if (!acc[key]) acc[key] = { kullanici: yorum.kullanici, yorumlar: [] };
    acc[key].yorumlar.push(yorum);
    return acc;
  }, {} as Record<string, { kullanici?: Yorum["kullanici"]; yorumlar: Yorum[] }>);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Yorumlar</h1>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : Object.keys(grouped).length === 0 ? (
        <p>Hiç yorum bulunamadı.</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([userId, group]) => (
            <div key={userId} className="bg-[#6a3c96] rounded text-white">
              <button
                className="w-full text-left p-4 font-semibold flex justify-between items-center"
                onClick={() => setOpenUser(openUser === userId ? null : userId)}
              >
                <span>
                  {group.kullanici?.ad} {group.kullanici?.soyad} - {group.kullanici?.email}
                </span>
                <span>{openUser === userId ? "▲" : "▼"}</span>
              </button>

              {openUser === userId && (
                <div className="bg-white text-black space-y-2 p-4">
                  {group.yorumlar.map((y) => (
                    <div key={y.id} className="border p-3 rounded shadow-sm">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{new Date(y.created_at).toLocaleString()}</span>
                        <span>{y.puan} ⭐</span>
                      </div>
                      <p className="mt-2">{y.yorum}</p>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="mt-3"
                        onClick={() => handleDelete(y.id)}
                      >
                        Sil
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
