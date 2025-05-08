"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Search, ChevronDown, ChevronUp } from "lucide-react";

interface Teklif {
  id: string;
  pdf_url: string;
  created_at: string;
  kullanici_id: string | null;
  ad: string | null;
  soyad: string | null;
  firma: string | null;
}

export default function TekliflerPage() {
  const [teklifler, setTeklifler] = useState<Teklif[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openCustomer, setOpenCustomer] = useState<string | null>(null);

  useEffect(() => {
    fetchTeklifler();
  }, []);

  const fetchTeklifler = async () => {
    const { data, error } = await supabase
      .from("teklif_dosyalar")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Teklifler alınamadı:", error.message);
    } else {
      setTeklifler(data || []);
    }
  };

  const handleDelete = async (doc: Teklif) => {
    const confirmDelete = window.confirm(
      `Bu teklifi silmek istediğinize emin misiniz?`
    );
    if (!confirmDelete) return;

    // 1️⃣ Storage'dan dosyayı sil
    const path = doc.pdf_url.split("/storage/v1/object/public/pdf-teklif/")[1];

    if (path) {
      const { error: storageError } = await supabase.storage
        .from("pdf-teklif")
        .remove([path]);

      if (storageError) {
        console.error("Dosya storage'dan silinemedi:", storageError.message);
        alert("Dosya storage'dan silinemedi: " + storageError.message);
        return;
      }
    } else {
      console.warn("Path bulunamadı, storage silme atlandı.");
    }

    // 2️⃣ Veritabanından kaydı sil
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

  // Arama filtresi (isim + UID)
  const filtered = teklifler.filter((doc) => {
    const fullName = `${doc.ad ?? ""} ${doc.soyad ?? ""}`.toLowerCase();
    const userId = (doc.kullanici_id ?? "").toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      userId.includes(searchTerm.toLowerCase())
    );
  });

  // Kullanıcı bazlı gruplama (isim + UID)
  const groupedByCustomer = filtered.reduce<Record<string, Teklif[]>>(
    (groups, teklif) => {
      const key = teklif.kullanici_id
        ? `${teklif.ad ?? "Ad Yok"} ${teklif.soyad ?? ""} - UID: ${teklif.kullanici_id}`
        : "Bilinmeyen Kullanıcı";

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(teklif);
      return groups;
    },
    {}
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-2xl">Teklifler</CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="İsim veya UID ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border rounded p-2 w-full"
            />
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedByCustomer).length === 0 && (
            <p className="text-center text-gray-500 text-sm mt-6">
              Hiç teklif bulunamadı.
            </p>
          )}

          {Object.entries(groupedByCustomer).map(([customer, docs]) => (
            <div key={customer} className="border rounded mb-4">
              <button
                onClick={() =>
                  setOpenCustomer(openCustomer === customer ? null : customer)
                }
                className="w-full text-left p-4 font-semibold flex justify-between items-center bg-[#68399e] text-white rounded"
              >
                <span>{customer}</span>
                {openCustomer === customer ? <ChevronUp /> : <ChevronDown />}
              </button>

              {openCustomer === customer && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {docs.map((doc) => {
                    const fileName = doc.pdf_url.split("/").pop();
                    return (
                      <div
                        key={doc.id}
                        className="border rounded p-4 shadow-sm flex flex-col"
                      >
                        <div className="font-medium break-words mb-2">
                          {fileName}
                        </div>
                        <div className="text-xs text-gray-500">
                          Oluşturma tarihi:{" "}
                          {new Date(doc.created_at).toLocaleString("tr-TR")}
                        </div>

                        <div className="flex gap-2 mt-3">
                          <a
                            href={doc.pdf_url}
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
