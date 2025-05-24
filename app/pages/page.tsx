"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast"; // shadcn/ui toast

// shadcn/ui Bileşenleri
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Toplu işlemler için

// lucide-react İkonları
import { 
  FileText, Edit, Trash2, CheckSquare, Square, ListCollapse, Loader2, Files, PackageOpen, GripVertical, PlusCircle
} from "lucide-react";

interface Page {
  id: string;
  title: string;
  slug: string;
  status: string; // "published" | "draft"
  created_at?: string; // Opsiyonel olarak eklenebilir
}

export default function PageList() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const router = useRouter();

  const corporateColor = "#6A3C96";

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pages"); // API endpoint'inizin doğru olduğundan emin olun
      if (!res.ok) {
        throw new Error(`API hatası: ${res.status}`);
      }
      const data = await res.json();
      setPages(data.sort((a: Page, b: Page) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())); // created_at'e göre sıralama
    } catch (error: any) {
      console.error("Sayfalar yüklenemedi:", error);
      toast({ title: "Hata", description: "Sayfalar yüklenirken bir sorun oluştu.", variant: "destructive" });
    } finally {
      setLoading(false);
      setSelectedPages([]);
      setSelectAll(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // selectedPages veya pages değiştiğinde selectAll durumunu güncelle
  useEffect(() => {
    if (pages.length > 0 && selectedPages.length === pages.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedPages, pages]);


  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedPages([]);
    } else {
      setSelectedPages(pages.map((p) => p.id));
    }
    setSelectAll(!selectAll);
  };

  const togglePageSelect = (id: string) => {
    setSelectedPages((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((pid) => pid !== id)
        : [...prevSelected, id]
    );
  };

  const handleDelete = async (id: string, title: string) => {
    const onay = window.confirm(`"${title}" başlıklı sayfayı silmek istediğinize emin misiniz?`);
    if (!onay) return;

    try {
      const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Bilinmeyen bir silme hatası oluştu." }));
        throw new Error(errorData.message || "Sayfa silinirken sunucu hatası oluştu.");
      }
      toast({ title: "Başarılı", description: `"${title}" sayfası silindi.` });
      fetchPages(); // Listeyi yenile
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPages.length === 0) {
      toast({ title: "Uyarı", description: "Lütfen silmek için en az bir sayfa seçin.", variant: "default" });
      return;
    }
    const onay = window.confirm(`${selectedPages.length} sayfayı silmek istediğinize emin misiniz?`);
    if (!onay) return;

    try {
      // Promise.all ile tüm silme isteklerini aynı anda gönderip sonuçlarını bekleyebiliriz.
      const deletePromises = selectedPages.map(id => 
        fetch(`/api/pages/${id}`, { method: "DELETE" }).then(res => {
          if (!res.ok) return res.json().then(err => Promise.reject(err)); // Hata varsa reject et
          return res.ok;
        })
      );
      await Promise.all(deletePromises);
      
      toast({ title: "Başarılı", description: `${selectedPages.length} sayfa başarıyla silindi.` });
      fetchPages(); // Listeyi yenile
    } catch (error: any) {
      console.error("Toplu silme hatası:", error);
      toast({ title: "Toplu Silme Hatası", description: error.message || "Seçili sayfalar silinirken bir hata oluştu.", variant: "destructive" });
      fetchPages(); // Hata olsa bile listeyi yenilemeye çalış
    }
  };

  const renderPageCards = () => {
    if (loading) {
      return Array.from({ length: 3 }).map((_, index) => (
        <Card key={`skeleton-${index}`} className="shadow-sm">
          <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
            <Skeleton className="h-5 w-5 rounded" /> {/* Checkbox için */}
            <div className="flex-1 space-y-1">
              <Skeleton className="h-5 w-3/4" /> {/* Title */}
              <Skeleton className="h-3 w-1/2" /> {/* Slug */}
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pb-3">
            <Skeleton className="h-5 w-20" /> {/* Status Badge */}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Skeleton className="h-9 w-20" /> {/* Edit Button */}
            <Skeleton className="h-9 w-20" /> {/* Delete Button */}
          </CardFooter>
        </Card>
      ));
    }

    if (pages.length === 0) {
      return (
        <div className="md:col-span-2 xl:col-span-3 text-center py-16">
          <PackageOpen className="w-20 h-20 mx-auto mb-6 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Henüz Sayfa Oluşturulmamış</h3>
          <p className="text-sm text-gray-500 mb-6">Yeni bir sayfa ekleyerek başlayabilirsiniz.</p>
          <Button style={{backgroundColor: corporateColor}} className="text-white hover:opacity-90" onClick={() => router.push('/pages/new')}>
            <PlusCircle className="w-4 h-4 mr-2" /> Yeni Sayfa Ekle
          </Button>
        </div>
      );
    }

    return pages.map((page) => (
      <Card key={page.id} className="shadow-sm hover:shadow-md transition-shadow flex flex-col">
        <CardHeader className="flex flex-row items-start gap-x-4 space-y-0 pb-2 pt-4 px-4">
          <Checkbox
            id={`select-${page.id}`}
            checked={selectedPages.includes(page.id)}
            onCheckedChange={() => togglePageSelect(page.id)}
            className="mt-1 data-[state=checked]:bg-[#6A3C96] data-[state=checked]:border-[#6A3C96]"
          />
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-800 leading-tight">{page.title}</CardTitle>
            <CardDescription className="text-xs text-gray-500 mt-0.5">/{page.slug}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3 pt-1 flex-grow">
          <Badge variant={page.status === "published" ? "default" : "outline"}
                 className={`text-xs font-medium ${
                   page.status === "published"
                     ? "bg-green-100 text-green-700 border-green-200"
                     : "bg-yellow-100 text-yellow-700 border-yellow-200"
                 }`}
          >
            {page.status === "published" ? "Yayında" : "Taslak"}
          </Badge>
          {page.created_at && (
             <p className="text-xs text-gray-400 mt-2">
                Oluşturulma: {new Date(page.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
             </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2 px-4 pb-4 pt-2 border-t bg-slate-50/50 dark:bg-slate-800/50">
          <Button variant="outline" size="sm" onClick={() => router.push(`/pages/edit/${page.id}`)} className="text-xs h-8 px-3">
            <Edit className="w-3.5 h-3.5 mr-1.5" /> Düzenle
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete(page.id, page.title)} className="text-xs h-8 px-3">
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Sil
          </Button>
        </CardFooter>
      </Card>
    ));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto"> {/* max-w-6xl yerine max-w-7xl daha geniş bir alan için */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b">
          <div className="flex items-center">
            <FileText className="w-8 h-8 mr-3" style={{color: corporateColor}}/>
            <h1 className="text-3xl font-bold" style={{color: corporateColor}}>Tüm Sayfalar</h1>
          </div>
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAll}
              disabled={pages.length === 0 || loading}
              className="h-9"
            >
              {selectAll ? <ListCollapse className="w-4 h-4 mr-2" /> : <CheckSquare className="w-4 h-4 mr-2" />}
              {selectAll ? "Seçimi Kaldır" : "Tümünü Seç"}
            </Button>
            {selectedPages.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="h-9"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Seçili ({selectedPages.length}) Sayfayı Sil
              </Button>
            )}
             <Button style={{backgroundColor: corporateColor}} className="text-white hover:opacity-90 h-9" onClick={() => router.push('/pages/new')}>
                <PlusCircle className="w-4 h-4 mr-2" /> Yeni Sayfa Ekle
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"> {/* Daha fazla kart için xl:grid-cols-4 */}
          {renderPageCards()}
        </div>
      </div>
    </div>
  );
}
