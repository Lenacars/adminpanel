"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Trash2, Download, Search, ChevronDown, ChevronUp,
  FileText, FileImage, FileArchive, FileQuestion, Loader2, FolderOpen // Eklenen ikonlar
} from "lucide-react";

interface Evrak {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  created_at: string;
  kullanici?: {
    id: string;
    ad: string;
    soyad: string;
    email: string;
    firma?: string;
  };
}

// Dosya uzantısına göre ikon döndüren yardımcı fonksiyon
const getFileIcon = (fileName: string | undefined): React.ReactNode => {
  if (!fileName) return <FileQuestion className="w-8 h-8 text-gray-500" />;
  const ext = fileName.split(".").pop()?.toLowerCase();
  
  if (!ext) return <FileQuestion className="w-8 h-8 text-gray-500" />;
  if (["pdf"].includes(ext)) return <FileText className="w-8 h-8 text-red-500" />;
  if (["doc", "docx"].includes(ext)) return <FileText className="w-8 h-8 text-blue-500" />;
  if (["xls", "xlsx", "csv"].includes(ext)) return <FileText className="w-8 h-8 text-green-500" />; // FileSpreadsheet ikonu da olabilir
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return <FileImage className="w-8 h-8 text-purple-500" />;
  if (["zip", "rar", "7z"].includes(ext)) return <FileArchive className="w-8 h-8 text-yellow-500" />;
  return <FileQuestion className="w-8 h-8 text-gray-500" />;
};


export default function EvrakListPage() {
  const [evraklar, setEvraklar] = useState<Evrak[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Yükleme durumu eklendi
  const [searchTerm, setSearchTerm] = useState("");
  const [openCustomer, setOpenCustomer] = useState<string | null>(null);

  // Kurumsal Renk
  const corporateColor = "#6A3C96";
  const corporateColorDarker = "#522d73"; // Hover için daha koyu ton

  useEffect(() => {
    fetchEvraklar();
  }, []);

  const fetchEvraklar = async () => {
    setIsLoading(true); // Yükleme başladı
    const { data, error } = await supabase
      .from("evraklar")
      .select(`
        id,
        user_id,
        file_name,
        file_url,
        created_at,
        kullanici:kullanicilar (
          id,
          ad,
          soyad,
          email,
          firma
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Evraklar alınamadı:", error.message);
      // Hata bildirimi eklenebilir
    } else {
      setEvraklar(data || []);
    }
    setIsLoading(false); // Yükleme bitti
  };

  const handleDelete = async (doc: Evrak) => {
    const confirmDelete = window.confirm(
      `Bu evrakı silmek istediğinize emin misiniz?\n\nEvrak: ${doc.file_name}`
    );
    if (!confirmDelete) return;

    // Dosya yolu Supabase storage URL formatına göre düzeltilmeli
    // Örnek: https://<project_ref>.supabase.co/storage/v1/object/public/documents/<path_to_file>
    // `documents` bucket adınızsa, path `doc.user_id + "/" + doc.file_name` gibi olabilir.
    // Mevcut kodunuzdaki path çıkarma mantığı doğruysa devam edin.
    // Eğer file_url tam path'i içeriyorsa:
    let path = "";
    try {
        const url = new URL(doc.file_url);
        // Genellikle path, /object/public/bucket_name/ sonrası kısımdır.
        const parts = url.pathname.split("/documents/"); // 'documents' bucket adınız olmalı
        if (parts.length > 1) {
            path = parts[1];
        } else {
            console.error("Dosya yolu ayrıştırılamadı:", doc.file_url);
            alert("Dosya yolu hatası nedeniyle silinemedi.");
            return;
        }
    } catch (e) {
        console.error("URL ayrıştırma hatası:", e);
        alert("Geçersiz dosya URL'si.");
        return;
    }
    
    if (!path) {
        alert("Dosya yolu bulunamadı, silme işlemi yapılamıyor.");
        return;
    }


    const { error: storageError } = await supabase.storage
      .from("documents") // Bucket adınız 'documents' ise doğru
      .remove([path]);

    if (storageError) {
      alert("Dosya depolamadan silinirken hata oluştu: " + storageError.message);
      // Eğer dosya zaten yoksa ama DB'de kaydı varsa, DB'den silmeye devam et
      if (storageError.message.includes("Not Found")) {
        console.warn("Dosya depolamada bulunamadı, ancak veritabanından silinmeye çalışılacak:", path);
      } else {
        return; // Diğer depolama hatalarında işlemi durdur
      }
    }

    const { error: deleteError } = await supabase
      .from("evraklar")
      .delete()
      .eq("id", doc.id);

    if (deleteError) {
      alert("Evrak kaydı veritabanından silinirken hata oluştu: " + deleteError.message);
    } else {
      alert("✅ Evrak başarıyla silindi.");
      fetchEvraklar(); // Listeyi yenile
    }
  };

  const filteredEvraklar = useMemo(() => {
    return evraklar.filter((doc) => {
      const normalizedSearchTerm = searchTerm.toLowerCase().trim();
      if (!normalizedSearchTerm) return true;

      const kullanici = doc.kullanici;
      const fullName = `${kullanici?.ad ?? ""} ${kullanici?.soyad ?? ""}`.toLowerCase();
      const userId = (kullanici?.id ?? "").toLowerCase();
      const email = (kullanici?.email ?? "").toLowerCase();
      const firma = (kullanici?.firma ?? "").toLowerCase();
      const fileName = (doc.file_name ?? "").toLowerCase();

      return (
        fullName.includes(normalizedSearchTerm) ||
        userId.includes(normalizedSearchTerm) ||
        email.includes(normalizedSearchTerm) ||
        firma.includes(normalizedSearchTerm) ||
        fileName.includes(normalizedSearchTerm)
      );
    });
  }, [evraklar, searchTerm]);

  const groupedByCustomer = useMemo(() => {
    return filteredEvraklar.reduce<Record<string, Evrak[]>>((groups, evrak) => {
      const kullanici = evrak.kullanici;
      const key = kullanici
        ? `${kullanici.ad || "İsimsiz"} ${kullanici.soyad || "Kullanıcı"} (UID: ${kullanici.id || "N/A"})`
        : "Bilinmeyen Kullanıcı";

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(evrak);
      return groups;
    }, {});
  }, [filteredEvraklar]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]"> {/* Yüksekliği ayarlandı */}
        <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: corporateColor }} />
        <p className="text-lg font-medium text-gray-700">Evraklar Yükleniyor...</p>
        <p className="text-sm text-gray-500">Lütfen bekleyiniz.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 bg-gray-50 min-h-screen">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
          <CardTitle className="text-2xl font-bold" style={{ color: corporateColor }}>
            Kullanıcı Evrakları Yönetimi
          </CardTitle>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Müşteri, UID, e-posta, dosya adı..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 text-sm focus-visible:ring-1" // shadcn/ui Input focus stili
              style={{ "--ring-color": corporateColor } as React.CSSProperties}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {Object.keys(groupedByCustomer).length === 0 ? (
            <div className="text-center py-10">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchTerm ? "Aramanızla Eşleşen Evrak Bulunamadı" : "Hiç Evrak Yüklenmemiş"}
              </h3>
              <p className="text-sm text-gray-500">
                {searchTerm ? "Lütfen arama teriminizi değiştirin veya tüm evrakları listelemek için aramayı temizleyin." : "Sistemde henüz kayıtlı evrak yok."}
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
                    <span>{customer} <span className="text-xs font-normal opacity-80">({docs.length} evrak)</span></span>
                    {openCustomer === customer ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>

                  {/* Akordiyon içeriği için animasyonlu geçiş */}
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out
                               ${openCustomer === customer ? 'max-h-[1000px] opacity-100 p-4' : 'max-h-0 opacity-0 p-0'}`} // 1000px yeterince büyük bir değer
                  >
                    {openCustomer === customer && ( // max-h-0 durumunda render etmemek için
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {docs.map((doc) => (
                            <div
                            key={doc.id}
                            className="border border-gray-200 bg-white rounded-md p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                            >
                            <div className="flex items-start gap-3 mb-3">
                                <div className="mt-1">
                                {getFileIcon(doc.file_name)}
                                </div>
                                <div className="flex-1 min-w-0"> {/* Taşan metin için */}
                                <p className="text-sm font-semibold text-gray-800 break-all" title={doc.file_name}>
                                    {doc.file_name}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Uzantı: .{doc.file_name.split(".").pop()?.toLowerCase() || "N/A"}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Tarih: {doc.created_at ? new Date(doc.created_at).toLocaleDateString("tr-TR", {
                                    year: 'numeric', month: 'short', day: 'numeric'
                                    }) : "-"}
                                </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 mt-auto pt-3 border-t border-gray-100">
                                <Button
                                asChild // Button'ı link gibi davranması için
                                size="sm"
                                className="text-white hover:opacity-90 px-3 py-1.5 text-xs"
                                style={{ backgroundColor: corporateColor }}
                                >
                                <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                    <Download className="w-3.5 h-3.5 mr-1.5" /> İndir
                                </a>
                                </Button>
                                <Button
                                onClick={() => handleDelete(doc)}
                                variant="destructive" // shadcn/ui destructive varyantı
                                size="sm"
                                className="px-3 py-1.5 text-xs"
                                >
                                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Sil
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
