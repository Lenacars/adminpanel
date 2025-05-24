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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// lucide-react İkonları
import { 
  Newspaper, PlusCircle, Edit, CheckCircle2, XCircle, FileClock, // Yayın durumu için
  Loader2, Inbox, AlertTriangle 
} from "lucide-react";

interface Blog {
  id: string;
  title: string;
  slug: string;
  published: boolean; // veya status: 'published' | 'draft' şeklinde de olabilir
  created_at: string;
  // Gerekirse diğer alanlar eklenebilir
}

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  const corporateColor = "#6A3C96";

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    setErrorState(null);
    const { data, error } = await supabase
      .from("bloglar")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Bloglar alınamadı:", error.message);
      setErrorState("Blog yazıları yüklenirken bir hata oluştu.");
      setBlogs([]);
    } else {
      setBlogs(data || []);
    }
    setLoading(false);
  };

  const renderTableContent = () => {
    if (loading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          <TableCell><Skeleton className="h-5 w-40" /></TableCell>
          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
          <TableCell><Skeleton className="h-6 w-20" /></TableCell> {/* Badge için */}
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-9 w-24 ml-auto" /></TableCell>
        </TableRow>
      ));
    }

    if (errorState) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="h-56 text-center">
            <div className="flex flex-col items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-lg font-medium text-red-600 mb-2">Hata Oluştu</p>
              <p className="text-sm text-gray-600">{errorState}</p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (blogs.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="h-56 text-center">
            <div className="flex flex-col items-center justify-center">
              <Inbox className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">Blog Yazısı Bulunamadı</p>
              <p className="text-sm text-gray-500">Henüz oluşturulmuş blog yazısı bulunmamaktadır.</p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return blogs.map((blog) => (
      <TableRow key={blog.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
        <TableCell className="font-medium py-3 text-gray-800 dark:text-slate-100">{blog.title}</TableCell>
        <TableCell className="text-sm text-gray-600 dark:text-slate-400 py-3">/{blog.slug}</TableCell>
        <TableCell className="py-3">
          <Badge 
            variant={blog.published ? "default" : "outline"}
            className={`text-xs ${
              blog.published 
                ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-700/20 dark:text-green-400 dark:border-green-700/30" 
                : "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-700/20 dark:text-yellow-400 dark:border-yellow-700/30"
            }`}
          >
            {blog.published ? <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> : <FileClock className="w-3.5 h-3.5 mr-1.5" />}
            {blog.published ? "Yayında" : "Taslak"}
          </Badge>
        </TableCell>
        <TableCell className="text-sm text-gray-600 dark:text-slate-300 py-3 whitespace-nowrap">
          {new Date(blog.created_at).toLocaleDateString("tr-TR", {
            year: 'numeric', month: 'short', day: 'numeric'
          })}
        </TableCell>
        <TableCell className="text-right py-3">
          <Button asChild variant="outline" size="sm" className="text-xs px-3 py-1.5 h-9 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
            <Link href={`/blogs/edit/${blog.id}`}>
              <Edit className="w-3.5 h-3.5 mr-1.5" /> Düzenle
            </Link>
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900 min-h-screen">
      <Card className="w-full max-w-5xl mx-auto shadow-xl dark:bg-slate-850 dark:border-slate-700"> {/* max-w artırıldı */}
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 dark:border-slate-700">
          <div className="flex items-center">
            <Newspaper className="w-7 h-7 mr-2.5" style={{ color: corporateColor }}/>
            <CardTitle className="text-2xl font-bold dark:text-slate-50" style={{ color: corporateColor }}>
              Blog Yönetimi
            </CardTitle>
          </div>
          <Link href="/blogs/new">
            <Button style={{ backgroundColor: corporateColor }} className="text-white hover:opacity-90 h-10 text-sm px-5 w-full sm:w-auto">
              <PlusCircle className="w-4 h-4 mr-2" /> Yeni Blog Yazısı
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent dark:hover:bg-transparent border-b dark:border-slate-700">
                  <TableHead className="font-semibold py-3.5 text-sm dark:text-slate-300" style={{color: corporateColor}}>Başlık</TableHead>
                  <TableHead className="font-semibold py-3.5 text-sm dark:text-slate-300" style={{color: corporateColor}}>URL (Slug)</TableHead>
                  <TableHead className="font-semibold py-3.5 text-sm dark:text-slate-300" style={{color: corporateColor}}>Yayın Durumu</TableHead>
                  <TableHead className="font-semibold py-3.5 text-sm dark:text-slate-300 hidden md:table-cell" style={{color: corporateColor}}>Oluşturulma Tarihi</TableHead>
                  <TableHead className="text-right font-semibold py-3.5 text-sm dark:text-slate-300" style={{color: corporateColor}}>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y dark:divide-slate-700">
                {renderTableContent()}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
