"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // shadcn/ui Input eklendi
import { 
  Download, Trash2, Search, ChevronDown, ChevronUp, 
  FileText, Loader2, FolderOpen // Gerekli ikonlar
} from "lucide-react";

interface Teklif {
  id: string;
  pdf_url: string;
  created_at: string;
  kullanici_id: string | null;
  ad: string | null;
  soyad: string | null;
  firma: string | null; // Firma bilgisi de kullanılabilir
}

export default function TekliflerPage() {
  const [teklifler, setTeklifler] = useState<Teklif[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openCustomer, setOpenCustomer] = useState<string | null>(null);

  // Kurumsal Renkler
  const corporateColor = "#6A3C96";
  const corporateColorDarker = "#522d73"; // Hover için daha koyu ton

  useEffect(() => {
    fetchTeklifler();
  }, []);

  const fetchTeklifler = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("teklif_dosyalar")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Teklifler alınamadı:", error.message);
    } else {
      setTeklifler(data || []);
    }
    setIsLoading(false);
  };

  const handleDelete = async (doc: Teklif) => {
    const confirmDelete = window.confirm(
      `Bu teklifi silmek istediğinize emin misiniz?\nDosya: ${doc.pdf_url.split("/").pop() || 'Bilinmeyen Dosya'}`
    );
    if (!confirmDelete) return;

    let path = "";
    try {
        const url = new URL(doc.pdf_url);
        const parts = url.pathname.split("/pdf-teklif/"); // 'pdf-teklif' bucket adınız olmalı
        if (parts.length > 1) {
            path = parts[1];
        } else {
            console.error("PDF dosya yolu ayrıştırılamadı:", doc.pdf_url);
            alert("PDF dosya yolu hatası nedeniyle silinemedi.");
            return;
        }
    } catch (e) {
        console.error("URL ayrıştırma hatası:", e);
        alert("Geçersiz PDF dosya URL'si.");
        return;
    }

    if (!path) {
      alert("PDF dosya yolu bulunamadı, silme işlemi yapılamıyor.");
      return;
    }
    
    const { error: storageError } = await supabase.storage
      .from("pdf-teklif") // Bucket adınız
      .remove([path]);

    if (storageError) {
      console.error("Dosya storage'dan silinemedi:", storageError.message);
      // "Not Found" hatası alırsak, DB'den silmeye devam et
      if (!storageError.message.includes("Not Found")) {
        alert("Dosya storage'dan silinemedi: " + storageError.message);
        return;
      }
      console.warn("Dosya storage'da bulunamadı, ancak veritabanından silinmeye çalışılacak:", path);
    }

    const { error: deleteError } = await supabase
      .from("teklif_dosyalar")
      .delete()
      .eq("id", doc.id);

    if (deleteError) {
      console.error("Veritabanından silinemedi:", deleteError.message);
      alert("Veritabanından silinemedi: " + deleteError.message);
    } else {
      alert("✅ Teklif başarıyla silindi.");
      fetchTeklifler();
    }
  };

  const filteredTeklifler = useMemo(() => {
    return teklifler.filter((doc) => {
      const normalizedSearchTerm = searchTerm.toLowerCase().trim();
      if (!normalizedSearchTerm) return true;

      const fullName = `${doc.ad ?? ""} ${doc.soyad ?? ""}`.toLowerCase();
      const userId = (doc.kullanici_id ?? "").toLowerCase();
      const firma = (doc.firma ?? "").toLowerCase();
      const fileName = (doc.pdf_url.split("/").pop() ?? "").toLowerCase();

      return (
        fullName.includes(normalizedSearchTerm) ||
        userId.includes(normalizedSearchTerm) ||
        firma.includes(normalizedSearchTerm) ||
        fileName.includes(normalizedSearchTerm)
      );
    });
  }, [teklifler, searchTerm]);

  const groupedByCustomer = useMemo(() => {
    return filteredTeklifler.reduce<Record<string, Teklif[]>>(
      (groups, teklif) => {
        const key = teklif.kullanici_id
          ? `${teklif.ad || "İsimsiz"} ${teklif.soyad || (teklif.ad ? "" : "Kullanıcı")} ${teklif.firma ? `(${teklif.firma})` : ''} - UID: ${teklif.kullanici_id}`
          : "Genel Teklifler / Bilinmeyen Kullanıcı"; // Eğer kullanıcı ID yoksa

        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(teklif);
        return groups;
      },
      {}
    );
  }, [filteredTeklifler]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: corporateColor }} />
        <p className="text-lg font-medium text-gray-700">Teklifler Yükleniyor...</p>
        <p className="text-sm text-gray-500">Lütfen bekleyiniz.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 bg-gray-50 min-h-screen">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
          <CardTitle className="text-2xl font-bold" style={{ color: corporateColor }}>
            Teklif Yönetimi
          </CardTitle>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Müşteri, UID, firma, dosya adı..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 text-sm focus-visible:ring-1"
              style={{ "--ring-color": corporateColor } as React.CSSProperties} // shadcn/ui Input focus rengi
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {Object.keys(groupedByCustomer).length === 0 ? (
            <div className="text-center py-10">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchTerm ? "Aramanızla Eşleşen Teklif Bulunamadı" : "Hiç Teklif Oluşturulmamış"}
              </h3>
              <p className="text-sm text-gray-500">
                {searchTerm ? "Lütfen arama teriminizi değiştirin veya tüm teklifleri listelemek için aramayı temizleyin." : "Sistemde henüz kayıtlı teklif yok."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedByCustomer).map(([customer, docs]) => (
                <div key={customer} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <button
                    onClick={() =>
                      setOpenCustomer(openCustomer === customer ? null : customer)
                    }
                    className={`w-full text-left p-4 font-semibold flex justify-between items-center transition-colors duration-150
                               ${openCustomer === customer 
                                 ? `text-white hover:bg-[${corporateColorDarker}]` 
                                 : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                               }`}
                    style={openCustomer === customer ? { backgroundColor: corporateColor } : {}}
                  >
                    <span>{customer} <span className="text-xs font-normal opacity-80">({docs.length} teklif)</span></span>
                    {openCustomer === customer ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out
                               ${openCustomer === customer ? 'max-h-[1000px] opacity-100 p-4' : 'max-h-0 opacity-0 p-0'}`}
                  >
                    {openCustomer === customer && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {docs.map((doc) => {
                            const fileName = doc.pdf_url.split("/").pop() || "Bilinmeyen PDF";
                            return (
                            <div
                                key={doc.id}
                                className="border border-gray-200 bg-white rounded-md p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start gap-3 mb-3">
                                <div className="mt-1">
                                    <FileText className="w-8 h-8 text-red-600" /> {/* PDF için standart ikon */}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 break-all" title={fileName}>
                                    {fileName}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                    Oluşturulma: {new Date(doc.created_at).toLocaleDateString("tr-TR", {
                                        year: 'numeric', month: 'short', day: 'numeric'
                                    })}
                                    </p>
                                </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 mt-auto pt-3 border-t border-gray-100">
                                <Button
                                    asChild
                                    size="sm"
                                    className="text-white hover:opacity-90 px-3 py-1.5 text-xs"
                                    style={{ backgroundColor: corporateColor }}
                                >
                                    <a href={doc.pdf_url} target="_blank" rel="noopener noreferrer">
                                    <Download className="w-3.5 h-3.5 mr-1.5" /> İndir
                                    </a>
                                </Button>
                                <Button
                                    onClick={() => handleDelete(doc)}
                                    variant="destructive"
                                    size="sm"
                                    className="px-3 py-1.5 text-xs"
                                >
                                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Sil
                                </Button>
                                </div>
                            </div>
                            );
                        })}
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
