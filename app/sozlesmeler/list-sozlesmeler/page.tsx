"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// shadcn/ui Bileşenleri
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

// lucide-react İkonları
import { FileText, Download, Loader2, Inbox, AlertTriangle, FileArchive } from "lucide-react";

interface SozlesmeKaydi {
  id: string;
  created_at: string;
  musteri_adi: string; // Bu alanın "sozlesmeler" tablosunda olduğunu varsayıyoruz
  pdf_url: string;
  // Diğer olası alanlar buraya eklenebilir
}

export default function ListSozlesmeler() {
  const [data, setData] = useState<SozlesmeKaydi[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  const corporateColor = "#6A3C96";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorState(null);
      const { data: fetchedData, error } = await supabase
        .from("sozlesmeler") // Tablo adı güncellendi
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Sözleşmeler alınamadı:", error.message);
        setErrorState("Sözleşmeler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
        setData([]);
      } else {
        setData(fetchedData || []);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const renderTableContent = () => {
    if (loading) {
      return (
        Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={`skeleton-${index}`}>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
          </TableRow>
        ))
      );
    }

    if (errorState) {
      return (
        <TableRow>
          <TableCell colSpan={3} className="h-40 text-center">
            <div className="flex flex-col items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-3" />
              <p className="font-medium text-red-600">Hata Oluştu</p>
              <p className="text-sm text-gray-600">{errorState}</p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (data.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={3} className="h-40 text-center">
            <div className="flex flex-col items-center justify-center">
              <Inbox className="w-12 h-12 text-gray-400 mb-3" />
              <p className="font-medium text-gray-700">Kayıt Bulunamadı</p>
              <p className="text-sm text-gray-500">Henüz oluşturulmuş sözleşme bulunmamaktadır.</p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return data.map((item) => (
      <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors">
        <TableCell className="py-3 whitespace-nowrap">
          {new Date(item.created_at).toLocaleDateString("tr-TR", {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
          })}
        </TableCell>
        <TableCell className="font-medium py-3">{item.musteri_adi || "-"}</TableCell>
        <TableCell className="text-right py-3">
          <Button asChild variant="outline" size="sm" className="text-xs px-2.5 py-1 hover:border-current" style={{color: corporateColor, borderColor: corporateColor}}>
            <Link href={item.pdf_url} target="_blank" rel="noopener noreferrer">
              <FileText className="w-3.5 h-3.5 mr-1.5" /> PDF Görüntüle
            </Link>
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <Card className="w-full max-w-4xl mx-auto shadow-xl">
        <CardHeader className="border-b">
          <div className="flex items-center">
            <FileArchive className="w-7 h-7 mr-2.5" style={{ color: corporateColor }}/> {/* İkon değiştirildi */}
            <CardTitle className="text-2xl font-bold" style={{ color: corporateColor }}>
              Oluşturulmuş Sözleşmeler
            </CardTitle>
          </div>
          <CardDescription className="mt-1.5">
            Daha önce oluşturulmuş tüm sözleşmeleri buradan görüntüleyebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold py-3.5" style={{color: corporateColor}}>Oluşturulma Tarihi</TableHead>
                  <TableHead className="font-semibold py-3.5" style={{color: corporateColor}}>Müşteri Adı</TableHead>
                  <TableHead className="text-right font-semibold py-3.5" style={{color: corporateColor}}>PDF Dosyası</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderTableContent()}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
