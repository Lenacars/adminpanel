"use client";

import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// shadcn/ui Bileşenleri
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // shadcn/ui Textarea
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";


// lucide-react İkonları
import { Save, Trash2, ImageIcon, Loader2, ImageOff, FileText, Eye, Edit as EditIcon, Newspaper, AlertTriangle } from "lucide-react"; // EditIcon olarak yeniden adlandırdım

const MediaLibraryLoading = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60]">
    <div className="bg-white p-6 rounded-lg shadow-xl flex items-center dark:bg-slate-800">
      <Loader2 className="w-6 h-6 animate-spin mr-3 text-[#6A3C96]" />
      <span className="dark:text-slate-200">Medya Kütüphanesi Yükleniyor...</span>
    </div>
  </div>
);

const MediaLibraryModal = dynamic(() => import("@/components/MediaLibraryModal"), { 
  ssr: false,
  loading: () => <MediaLibraryLoading /> 
});

interface BlogFormState {
  title: string;
  slug: string;
  content: string;
  seo_title: string;
  seo_description: string;
  thumbnail_image: string;
  published: boolean;
  // Supabase'den gelen ek alanlar
  id?: string;
  created_at?: string;
}

const initialBlogFormState: BlogFormState = {
  title: "",
  slug: "",
  content: "<h1>Blog İçeriği</h1><p>HTML içeriğinizi buraya girin.</p>",
  seo_title: "",
  seo_description: "",
  thumbnail_image: "",
  published: false,
};

export default function EditBlogPage() {
  const { id } = useParams<{ id: string }>(); // id tipini belirttim
  const router = useRouter();
  
  const [form, setForm] = useState<BlogFormState | null>(null); // Veri yüklenene kadar null
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [errorLoading, setErrorLoading] = useState<string | null>(null);


  const corporateColor = "#6A3C96";

  const fetchBlogData = useCallback(async () => {
    if (!id) {
        setErrorLoading("Blog ID bulunamadı.");
        setLoadingInitialData(false);
        return;
    }
    setLoadingInitialData(true);
    setErrorLoading(null);
    try {
        const { data, error } = await supabase.from("bloglar").select("*").eq("id", id).single();
        if (error) throw error;
        if (data) {
            setForm({
                id: data.id,
                title: data.title || "",
                slug: data.slug || "",
                content: data.content || "",
                seo_title: data.seo_title || "",
                seo_description: data.seo_description || "",
                thumbnail_image: data.thumbnail_image || "",
                published: data.published || false,
                created_at: data.created_at,
            });
        } else {
            throw new Error("Blog yazısı bulunamadı.");
        }
    } catch (error: any) {
        console.error("Blog verisi alınamadı:", error);
        setErrorLoading(error.message || "Blog verisi yüklenirken bir hata oluştu.");
        toast({ title: "Hata", description: error.message || "Blog verisi yüklenemedi.", variant: "destructive" });
    } finally {
        setLoadingInitialData(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBlogData();
  }, [fetchBlogData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => prev ? { ...prev, [name]: value } : null);
  };

  const handleSwitchChange = (checked: boolean) => {
    setForm((prev) => prev ? { ...prev, published: checked } : null);
  };

  const handleContentChange = (newContent: string) => {
    setForm((prev) => prev ? { ...prev, content: newContent } : null);
  };

  const handleImageSelect = (url: string) => {
    setForm((prev) => prev ? { ...prev, thumbnail_image: url } : null);
    setShowMedia(false);
  };

  const handleUpdate = async () => {
    if (!form) return;
    if (!form.title.trim() || !form.slug.trim()) {
      toast({ title: "Eksik Bilgi", description: "Başlık ve slug alanı zorunludur.", variant: "destructive" });
      return;
    }
     if (!form.content.trim()) {
        toast({ title: "Eksik Bilgi", description: "İçerik alanı boş bırakılamaz.", variant: "destructive" });
        return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase.from("bloglar").update({
        title: form.title,
        slug: form.slug,
        content: form.content,
        seo_title: form.seo_title,
        seo_description: form.seo_description,
        thumbnail_image: form.thumbnail_image,
        published: form.published,
      }).eq("id", id);

      if (error) throw error;
      toast({ title: "Başarılı", description: "Blog yazısı başarıyla güncellendi." });
      router.push("/blogs");
    } catch (error: any) {
      toast({ title: "Hata", description: error.message || "Blog güncellenirken bir sorun oluştu.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!form || !id) return;
    const confirmDelete = window.confirm(`"${form.title}" başlıklı blog yazısını silmek istediğinizden emin misiniz?`);
    if (!confirmDelete) return;

    setIsSaving(true); // Hem silme hem güncelleme için kullanılabilir
    try {
        const { error } = await supabase.from("bloglar").delete().eq("id", id);
        if (error) throw error;
        toast({ title: "Başarılı", description: "Blog yazısı silindi." });
        router.push("/blogs");
    } catch (error: any) {
        toast({ title: "Silme Hatası", description: error.message || "Blog silinirken bir hata oluştu.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };


  if (loadingInitialData) {
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] p-8 bg-gray-50 dark:bg-slate-900">
            <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: corporateColor }} />
            <p className="text-lg font-medium text-gray-700 dark:text-slate-300">Blog Yazısı Yükleniyor...</p>
        </div>
    );
  }

  if (errorLoading || !form) {
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] p-8 bg-gray-50 dark:bg-slate-900">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-lg font-medium text-red-600 mb-2">Hata Oluştu</p>
            <p className="text-sm text-gray-600 dark:text-slate-400 text-center mb-6">{errorLoading || "Blog yazısı yüklenemedi."}</p>
            <Button variant="outline" onClick={() => router.push('/blogs')}>Blog Listesine Dön</Button>
        </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-4 border-b dark:border-slate-700">
            <h1 className="text-3xl font-bold flex items-center text-gray-800 dark:text-slate-100">
                <EditIcon className="w-8 h-8 mr-3" style={{color: corporateColor}}/>
                Blog Yazısını Düzenle
            </h1>
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
                <Button variant="outline" onClick={() => router.push('/blogs/new')} className="dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
                    <PlusCircle className="mr-2 h-4 w-4" /> Yeni Ekle
                </Button>
                <Button variant="outline" onClick={() => router.push('/blogs')} className="dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
                    Blog Listesine Dön
                </Button>
            </div>
        </div>

        <Card className="dark:bg-slate-850 dark:border-slate-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold flex items-center dark:text-slate-100" style={{color: corporateColor}}>
              <Newspaper className="w-6 h-6 mr-2" /> "{form.title || 'Başlıksız Blog'}"
            </CardTitle>
            <CardDescription className="dark:text-slate-400">
              Blog yazınızın detaylarını ve içeriğini buradan güncelleyebilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label htmlFor="title">Başlık <span className="text-red-500">*</span></Label>
                <Input id="title" name="title" value={form.title} onChange={handleChange} className="focus-visible:ring-1 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300" style={{ "--ring-color": corporateColor } as React.CSSProperties} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slug">URL (Slug) <span className="text-red-500">*</span></Label>
                <Input id="slug" name="slug" value={form.slug} onChange={handleChange} className="focus-visible:ring-1 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300" style={{ "--ring-color": corporateColor } as React.CSSProperties} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="content">İçerik (HTML Destekler) <span className="text-red-500">*</span></Label>
              <Textarea
                id="content" name="content"
                value={form.content}
                onChange={(e) => handleContentChange(e.target.value)} // Direkt value ile güncelleme
                className="min-h-[350px] font-mono text-sm p-3 focus-visible:ring-1 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                style={{ "--ring-color": corporateColor } as React.CSSProperties}
                placeholder="<p>Blog yazınızın içeriğini buraya HTML formatında girin...</p>"
              />
            </div>
            <div>
                <Label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 block flex items-center"><Eye className="w-4 h-4 mr-2" /> İçerik Önizlemesi</Label>
                <div className="border rounded-md p-4 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 shadow-inner min-h-[150px]">
                    <div dangerouslySetInnerHTML={{ __html: form.content }} className="prose prose-sm sm:prose dark:prose-invert max-w-none" />
                </div>
            </div>
            
            <Separator className="my-6 dark:bg-slate-700" />

            <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-200 mb-3">SEO Bilgileri (Opsiyonel)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <Label htmlFor="seo_title">SEO Başlık</Label>
                        <Input id="seo_title" name="seo_title" value={form.seo_title} onChange={handleChange} className="focus-visible:ring-1 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300" style={{ "--ring-color": corporateColor } as React.CSSProperties} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="seo_description">SEO Açıklama</Label>
                        <Textarea id="seo_description" name="seo_description" value={form.seo_description} onChange={(e) => handleChange(e)} rows={3} className="min-h-[80px] focus-visible:ring-1 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300" style={{ "--ring-color": corporateColor } as React.CSSProperties} />
                    </div>
                </div>
            </div>

            <Separator className="my-6 dark:bg-slate-700" />
            
            <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-200 mb-3">Görsel ve Yayın Ayarları</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-1.5">
                        <Label htmlFor="thumbnail_image">Kapak Görseli</Label>
                        <div className="flex flex-col items-start gap-3">
                            <Button variant="outline" size="sm" onClick={() => setShowMedia(true)} className="dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
                                <ImageIcon className="w-4 h-4 mr-2" /> Ortam Kütüphanesinden Seç
                            </Button>
                            {form.thumbnail_image && (
                            <div className="relative group w-full max-w-xs aspect-video rounded border dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800">
                                <img src={form.thumbnail_image} alt="Kapak Görseli Önizleme" className="w-full h-full object-contain" />
                                <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setForm(prev => prev ? {...prev, thumbnail_image: ''} : null)}><Trash className="h-4 w-4"/></Button>
                            </div>
                            )}
                            {!form.thumbnail_image && (
                                <div className="w-full max-w-xs aspect-video rounded border border-dashed dark:border-slate-700 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500">
                                    <ImageOff className="w-8 h-8 mb-1"/> <span className="text-xs">Kapak görseli seçilmedi</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1.5 pt-1 md:pt-0">
                        <Label htmlFor="published_switch" className="block mb-2">Yayın Durumu</Label>
                        <div className="flex items-center space-x-2">
                        <Switch
                            id="published_switch"
                            checked={form.published}
                            onCheckedChange={handleSwitchChange}
                            className="data-[state=checked]:bg-[#6A3C96]"
                        />
                        <Label htmlFor="published_switch" className="cursor-pointer text-sm font-medium dark:text-slate-300">
                            {form.published ? "Blog Yazısı Yayında" : "Blog Yazısı Taslak"}
                        </Label>
                        </div>
                    </div>
                </div>
            </div>

          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t dark:border-slate-700">
            <Button 
                variant="destructive"
                onClick={handleDelete} 
                disabled={isSaving} 
                className="w-full sm:w-auto order-2 sm:order-1"
            >
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Trash2 className="w-4 h-4 mr-2" />}
              Sil
            </Button>
            <Button 
                onClick={handleUpdate} 
                disabled={isSaving || !form.title.trim() || !form.slug.trim()}
                className="text-white min-w-[160px] h-11 text-base w-full sm:w-auto order-1 sm:order-2"
                style={{ backgroundColor: isSaving || !form.title.trim() || !form.slug.trim() ? undefined : corporateColor, opacity: isSaving || !form.title.trim() || !form.slug.trim() ? 0.6 : 1 }}
            >
              {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
              {isSaving ? "Güncelleniyor..." : "Değişiklikleri Kaydet"}
            </Button>
          </CardFooter>
        </Card>

        {showMedia && (
          <MediaLibraryModal // İsim MediaLibraryModal olarak güncellendi
            onSelect={handleImageSelect}
            onClose={() => setShowMedia(false)}
          />
        )}
      </div>
    </div>
  );
}
