"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Download, Search, ChevronDown, ChevronUp } from "lucide-react";

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

export default function EvrakListPage() {
  const [evraklar, setEvraklar] = useState<Evrak[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openCustomer, setOpenCustomer] = useState<string | null>(null);

  useEffect(() => {
    fetchEvraklar();
  }, []);

  const fetchEvraklar = async () => {
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
    } else {
      setEvraklar(data || []);
    }
  };

  const handleDelete = async (doc: Evrak) => {
    const confirmDelete = window.confirm(
      `Bu evrakı silmek istediğinize emin misiniz?\n\nEvrak: ${doc.file_name}`
    );
    if (!confirmDelete) return;

    const path = doc.file_url.split("/storage/v1/object/public/documents/")[1];
    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([path]);

    if (storageError) {
      alert("Dosya silinirken hata oluştu: " + storageError.message);
      return;
    }

    const { error: deleteError } = await supabase
      .from("evraklar")
      .delete()
      .eq("id", doc.id);

    if (deleteError) {
      alert("Veritabanından silinemedi: " + deleteError.message);
    } else {
      alert("✅ Evrak başarıyla silindi.");
      fetchEvraklar();
    }
  };

  // Arama filtresi (isim + UID)
  const filtered = evraklar.filter((doc) => {
    const fullName = `${doc.kullanici?.ad ?? ""} ${doc.kullanici?.soyad ?? ""}`.toLowerCase();
    const userId = (doc.kullanici?.id ?? "").toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      userId.includes(searchTerm.toLowerCase())
    );
  });

  // Kullanıcı bazlı gruplama (isim + UID)
  const groupedByCustomer = filtered.reduce<Record<string, Evrak[]>>((groups, evrak) => {
    const key = evrak.kullanici
      ? `${evrak.kullanici.ad} ${evrak.kullanici.soyad} - UID: ${evrak.kullanici.id}`
      : "Bilinmeyen Kullanıcı";

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(evrak);
    return groups;
  }, {});

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-2xl">Kullanıcı Evrakları</CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="İsim veya UID ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedByCustomer).length === 0 && (
            <p className="text-center text-gray-500 text-sm mt-6">Hiç evrak bulunamadı.</p>
          )}

          {Object.entries(groupedByCustomer).map(([customer, docs]) => (
            <div key={customer} className="border rounded mb-4">
              <button
                onClick={() =>
                  setOpenCustomer(openCustomer === customer ? null : customer)
                }
                className="w-full text-left p-4 font-semibold flex justify-between items-center bg-gray-100 hover:bg-gray-200"
              >
                <span>{customer}</span>
                {openCustomer === customer ? <ChevronUp /> : <ChevronDown />}
              </button>

              {openCustomer === customer && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {docs.map((doc) => {
                    const ext = doc.file_name.split(".").pop()?.toLowerCase();
                    const icon = (() => {
                      if (!ext) return "📁";
                      if (["pdf"].includes(ext)) return "📄";
                      if (["doc", "docx"].includes(ext)) return "📝";
                      if (["xls", "xlsx", "csv"].includes(ext)) return "📊";
                      if (["jpg", "jpeg", "png", "webp"].includes(ext)) return "🖼️";
                      if (["zip", "rar", "7z"].includes(ext)) return "🗜️";
                      return "📁";
                    })();

                    return (
                      <div
                        key={doc.id}
                        className="border rounded p-4 shadow-sm flex flex-col"
                      >
                        <div className="text-4xl mb-2">{icon}</div>
                        <p className="text-sm font-medium break-words">{doc.file_name}</p>
                        <p className="text-xs text-gray-500 mt-1">.{ext}</p>

                        <div className="flex gap-2 mt-3">
                          <a
                            href={doc.file_url}
                            target="_blank"
                            className="text-sm flex items-center gap-1 bg-[#6A3C96] text-white px-2 py-1 rounded hover:bg-[#502e74]"
                          >
                            <Download className="w-4 h-4" />
                            İndir
                          </a>
                          <Button
                            onClick={() => handleDelete(doc)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Sil
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
