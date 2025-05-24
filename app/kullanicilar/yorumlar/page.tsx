"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Input bileşeni import edildi
import { 
  ChevronDown, ChevronUp, Star, Trash2, Loader2, MessageSquareWarning, Search // Search ikonu import edildi
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Yıldız Puanlama Bileşeni
const StarRating = ({ rating, totalStars = 5 }: { rating: number; totalStars?: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(totalStars)].map((_, index) => (
        <Star
          key={index}
          className={`w-4 h-4 ${index < Math.round(rating) ? 'fill-yellow-400 text-yellow-500' : 'fill-gray-200 text-gray-400'}`}
        />
      ))}
      <span className="ml-1.5 text-xs text-gray-600">({rating.toFixed(1)}/{totalStars})</span>
    </div>
  );
};

interface Yorum {
  id: string;
  yorum: string;
  puan: number;
  created_at: string;
  user_id: string;
  kullanici?: {
    ad?: string | null;
    soyad?: string | null;
    email?: string | null;
  } | null;
}

export default function YorumlarPage() {
  const [yorumlar, setYorumlar] = useState<Yorum[]>([]);
  const [loading, setLoading] = useState(true);
  const [openUser, setOpenUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); // Arama için state eklendi

  // Kurumsal Renkler
  const corporateColor = "#6A3C96";
  const corporateColorDarker = "#522d73";

  const fetchYorumlar = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("yorumlar")
      .select("*, kullanici:kullanicilar(ad,soyad,email)")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Hata", description: `Yorumlar alınamadı: ${error.message}`, variant: "destructive" });
    } else {
      setYorumlar(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const onay = window.confirm("Bu yorumu silmek istediğinize emin misiniz?");
    if (!onay) return;

    const { error } = await supabase.from("yorumlar").delete().eq("id", id);
    if (error) {
      toast({ title: "Hata", description: `Yorum silinemedi: ${error.message}`, variant: "destructive" });
    } else {
      toast({ title: "Başarılı", description: "Yorum başarıyla silindi.", variant: "default" });
      setYorumlar(prev => prev.filter((y) => y.id !== id));
    }
  };

  useEffect(() => {
    fetchYorumlar();
  }, []);

  // Yorumları arama terimine göre filtrele
  const filteredYorumlar = useMemo(() => {
    if (!searchQuery.trim()) {
      return yorumlar;
    }
    const lowercasedQuery = searchQuery.toLowerCase().trim();
    return yorumlar.filter(yorum => {
      const ad = yorum.kullanici?.ad?.toLowerCase() || "";
      const soyad = yorum.kullanici?.soyad?.toLowerCase() || "";
      const email = yorum.kullanici?.email?.toLowerCase() || "";
      const fullName = `${ad} ${soyad}`.trim();

      return (
        ad.includes(lowercasedQuery) ||
        soyad.includes(lowercasedQuery) ||
        fullName.includes(lowercasedQuery) ||
        email.includes(lowercasedQuery)
      );
    });
  }, [yorumlar, searchQuery]);

  // Filtrelenmiş yorumları kullanıcıya göre grupla
  const groupedByKullanici = useMemo(() => {
    return filteredYorumlar.reduce((acc, yorum) => {
      const kullaniciKey = yorum.kullanici && yorum.user_id 
        ? yorum.user_id 
        : "bilinmeyen_kullanici";
      
      const displayName = yorum.kullanici 
        ? `${yorum.kullanici.ad || "İsimsiz"} ${yorum.kullanici.soyad || "Kullanıcı"} (${yorum.kullanici.email || "E-posta Yok"})`
        : "Bilinmeyen Kullanıcı";

      if (!acc[kullaniciKey]) {
        acc[kullaniciKey] = { 
          displayName: displayName, 
          kullaniciDetay: yorum.kullanici,
          yorumlar: [] 
        };
      }
      acc[kullaniciKey].yorumlar.push(yorum);
      return acc;
    }, {} as Record<string, { displayName: string; kullaniciDetay?: Yorum["kullanici"]; yorumlar: Yorum[] }>);
  }, [filteredYorumlar]);


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: corporateColor }} />
        <p className="text-lg font-medium text-gray-700">Yorumlar Yükleniyor...</p>
        <p className="text-sm text-gray-500">Lütfen bekleyiniz.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
          <CardTitle className="text-2xl font-bold whitespace-nowrap" style={{ color: corporateColor }}>
            Müşteri Yorumları
          </CardTitle>
          <div className="relative w-full md:w-80"> {/* Arama kutusu için sarmalayıcı */}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Müşteri adı veya e-posta ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-sm focus-visible:ring-1" // shadcn/ui Input focus stili
              style={{ "--ring-color": corporateColor } as React.CSSProperties} // Focus rengi için
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {Object.keys(groupedByKullanici).length === 0 ? (
            <div className="text-center py-10">
              <MessageSquareWarning className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchQuery ? "Aramanızla Eşleşen Yorum Bulunamadı" : "Henüz Yorum Bulunmamaktadır"}
              </h3>
              <p className="text-sm text-gray-500">
                {searchQuery ? "Lütfen arama teriminizi değiştirin veya tüm yorumları listelemek için aramayı temizleyin." : "Sistemde kayıtlı müşteri yorumu yok."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedByKullanici).map(([key, group]) => (
                <div key={key} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <button
                    className={`w-full text-left p-4 font-semibold flex justify-between items-center transition-colors duration-150
                               ${openUser === key 
                                 ? `text-white hover:bg-[${corporateColorDarker}]` 
                                 : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                               }`}
                    style={openUser === key ? { backgroundColor: corporateColor } : {}}
                    onClick={() => setOpenUser(openUser === key ? null : key)}
                  >
                    <span className="truncate mr-2"> {/* truncate ve mr-2 eklendi */}
                      {group.displayName} 
                      <span className="text-xs font-normal opacity-80 ml-2">({group.yorumlar.length} yorum)</span>
                    </span>
                    {openUser === key ? <ChevronUp className="w-5 h-5 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 flex-shrink-0" />} {/* ml-2 kaldırıldı, flex-shrink-0 eklendi */}
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out bg-white
                               ${openUser === key ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`} // max-h artırıldı
                  >
                    {openUser === key && (
                        <div className="divide-y divide-gray-100 p-2 sm:p-4">
                        {group.yorumlar.map((y) => (
                            <div key={y.id} className="py-4 px-2 hover:bg-slate-50 rounded transition-colors duration-100">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1.5">
                                <StarRating rating={y.puan} />
                                <span className="text-xs text-gray-500 mt-1 sm:mt-0 whitespace-nowrap">
                                {new Date(y.created_at).toLocaleDateString("tr-TR", {
                                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                                </span>
                            </div>
                            <p className="text-gray-800 text-sm leading-relaxed mt-1 mb-3">{y.yorum}</p>
                            <div className="text-right">
                                <Button
                                variant="destructive"
                                size="sm"
                                className="px-3 py-1.5 text-xs"
                                onClick={() => handleDelete(y.id)}
                                >
                                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                Sil
                                </Button>
                            </div>
                            </div>
                        ))}
                        </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
