"use client";

import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Mevcut shadcn/ui importlarınız
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"; // Düzeltme 1: Separator import edildi

// lucide-react İkonları
import { Save, Trash2, ImageIcon, Loader2, ImageOff, Eye, Edit as EditIcon, Newspaper, PlusCircle, LinkIcon, AlertTriangle } from "lucide-react"; // Düzeltme 3: AlertTriangle eklendi

// MediaLibraryModal
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

interface BlogForm {
  id?: string;
  title: string;
  slug: string;
  content: string; // HTML içerik için
  seo_title: string;
  seo_description: string;
  thumbnail_image: string;
  published: boolean;
  created_at?: string;
  html_content?: string;
  banner_image?: string;
  menu_group?: string;
  status?: "draft" | "published";
  parent?: string;
  external_url?: string;
}

const initialBlogFormState: BlogForm = {
    title: "",
    slug: "",
    content: "<h1>Blog İçeriği</h1><p>HTML içeriğinizi buraya girin.</p>",
    seo_title: "",
    seo_description: "",
    thumbnail_image: "",
    published: false,
    html_content: "<h1>Blog İçeriği</h1><p>HTML içeriğinizi buraya girin.</p>",
    banner_image: "",
    menu_group: "",
    status: "draft",
    parent: "",
    external_url: "",
};


export default function EditBlogPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<BlogForm | null>(null);
  const [showMedia, setShowMedia] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [imageTarget, setImageTarget] = useState<"thumbnail_image" | null>(null);

  const corporateColor = "#6A3C96";
  const inputClassName = `border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 px-3 py-2 w-full rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-offset-0 focus:ring-[${corporateColor}] dark:text-slate-100`;
  // const selectClassName = `${inputClassName} appearance-none`; // HTML select için (kullanılmıyorsa kaldırılabilir)

  const fetchBlog = useCallback(async () => {
    if (!id) {
      toast({ title: "Hata", description: "Blog ID bulunamadı.", variant: "destructive" });
      setIsLoadingData(false);
      router.push("/blogs");
      return;
    }
    setIsLoadingData(true);
    const { data, error } = await supabase.from("bloglar").select("*").eq("id", id).single();
    
    if (error || !data) {
      toast({ title: "Hata", description: error?.message || "Blog verisi alınamadı.", variant: "destructive" });
      setIsLoadingData(false);
      router.push("/blogs");
      return;
    }
    setForm({
        id: data.id,
        title: data.title || "",
        slug: data.slug || "",
        content: data.content || initialBlogFormState.content,
        seo_title: data.seo_title || "",
        seo_description: data.seo_description || "",
        thumbnail_image: data.thumbnail_image || "",
        published: data.published || false,
        created_at: data.created_at,
        html_content: data.content || initialBlogFormState.content,
        banner_image: data.banner_image || "",
        menu_group: data.menu_group || "",
        status: data.published ? "published" : "draft",
        parent: data.parent || "",
        external_url: data.external_url || "",
    });
    setIsLoadingData(false);
  }, [id, router]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    
    setForm((prev) => {
        if (!prev) return null;
        const newForm = {
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        };
        if (name === "status") {
            newForm.published = value === "published";
        } else if (name === "published" && type === "checkbox") {
            newForm.status = checked ? "published" : "draft";
        }
        if (name === "content") {
            newForm.html_content = value;
        } else if (name === "html_content") {
            newForm.content = value;
        }
        return newForm;
    });
  };
  
  const handleImageSelect = (url: string) => {
    if (imageTarget) {
        setForm((prev) => prev ? { ...prev, [imageTarget]: url } : null);
    }
    setShowMedia(false);
    setImageTarget(null);
  };

  const handleSubmit = async () => {
    if (!form || !form.title || !form.slug) {
      toast({ title: "Eksik Bilgi", description: "Başlık ve slug alanı zorunludur.", variant: "destructive" });
      return;
    }
    if (!form.content?.trim()) {
        toast({ title: "Eksik Bilgi", description: "İçerik alanı boş bırakılamaz.", variant: "destructive" });
        return;
    }

    setIsSaving(true);
    const updateData = {
        title: form.title,
        slug: form.slug,
        content: form.content,
        seo_title: form.seo_title,
        seo_description: form.seo_description,
        thumbnail_image: form.thumbnail_image,
        published: form.published,
        // Diğer Supabase'e gönderilecek alanlar varsa:
        // external_url: form.external_url,
        // menu_group: form.menu_group,
        // parent: form.parent,
    };

    const { error } = await supabase.from("bloglar").update(updateData).eq("id", id);
    
    if (error) {
        toast({ title: "Hata", description: error.message, variant: "destructive" });
    } else {
        toast({ title: "Başarılı", description: "Blog yazısı başarıyla güncellendi." });
        router.push("/blogs");
        router.refresh(); // Sayfanın yenilenerek güncel veriyi çekmesini sağlayabilir
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!form || !id) return;
    const confirmDelete = window.confirm(`"${form.title}" başlıklı blog yazısını silmek istediğinizden emin misiniz?`);
    if (!confirmDelete) return;

    setIsSaving(true);
    try {
        const { error } = await supabase.from("bloglar").delete().eq("id", id);
        if (error) throw error;
        toast({ title: "Başarılı", description: "Blog yazısı silindi." });
        router.push("/blogs");
        router.refresh(); // Sayfanın yenilenerek güncel veriyi çekmesini sağlayabilir
    } catch (error: any) {
        toast({ title: "Silme Hatası", description: error.message || "Blog silinirken bir hata oluştu.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoadingData) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] p-8 bg-gray-50 dark:bg-slate-900">
            <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: corporateColor }} />
            <p className="text-lg font-medium text-gray-700 dark:text-slate-300">Blog Yazısı Yükleniyor...</p>
        </div>
    );
  }

  if (!form) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] p-8 bg-gray-50 dark:bg-slate-900">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" /> {/* Düzeltme 3: AlertTriangle kullanılıyor */}
            <p className="text-lg font-medium text-red-600 mb-2">Veri Bulunamadı</p>
            <p className="text-sm text-gray-600 dark:text-slate-400 text-center mb-6">Blog yazısı yüklenemedi veya bulunamadı.</p>
            <Button variant="outline" onClick={() => router.push('/blogs')} className="dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">Blog Listesine Dön</Button>
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
              Blog yazınızın detaylarını ve içeriğini güncelleyin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Temel Bilgiler */}
            <div className="space-y-4 p-4 border rounded-md dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-200 mb-2">Temel Bilgiler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="title" className="font-medium dark:text-slate-300">Başlık <span className="text-red-500">*</span></Label>
                        <Input id="title" name="title" value={form.title} onChange={handleChange} className={inputClassName} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="slug" className="font-medium dark:text-slate-300">Slug <span className="text-red-500">*</span></Label>
                        <Input id="slug" name="slug" value={form.slug} onChange={handleChange} className={inputClassName} />
                    </div>
                </div>
            </div>

            {/* HTML İçerik Alanı */}
            <div className="space-y-1.5 p-4 border rounded-md dark:border-slate-700">
              <Label htmlFor="content" className="text-lg font-semibold text-gray-700 dark:text-slate-200 mb-2 block">İçerik (HTML Destekler) <span className="text-red-500">*</span></Label>
              <textarea
                id="content" name="content"
                value={form.content || ""}
                onChange={handleChange}
                rows={18}
                className={`${inputClassName} min-h-[400px] font-mono text-sm p-3`}
                placeholder="<p>Blog yazınızın içeriğini buraya HTML formatında girin...</p>"
              />
              <div className="mt-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 block flex items-center"><Eye className="w-4 h-4 mr-2" /> İçerik Önizlemesi</Label>
                <div className="border rounded-md p-4 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 shadow-inner min-h-[150px]">
                    <div dangerouslySetInnerHTML={{ __html: form.content || "" }} className="prose prose-sm sm:prose dark:prose-invert max-w-none" />
                </div>
              </div>
            </div>
            
            {/* SEO Bilgileri */}
            <div className="space-y-4 p-4 border rounded-md dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-200 mb-2">SEO Bilgileri (Opsiyonel)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="seo_title" className="font-medium dark:text-slate-300">SEO Başlık</Label>
                        <Input id="seo_title" name="seo_title" value={form.seo_title || ""} onChange={handleChange} className={inputClassName} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="seo_description" className="font-medium dark:text-slate-300">SEO Açıklama</Label>
                        <textarea 
                            id="seo_description" 
                            name="seo_description" 
                            value={form.seo_description || ""} 
                            onChange={handleChange} 
                            rows={3} 
                            className={`${inputClassName} min-h-[80px]`}
                            placeholder="Google arama açıklaması (max 160 karakter)"
                        />
                    </div>
                </div>
            </div>
            
            {/* Kapak Görseli ve Yayın Durumu */}
            <div className="space-y-4 p-4 border rounded-md dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-200 mb-3">Görsel ve Yayın Ayarları</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-1.5">
                        <Label htmlFor="thumbnail_image_button" className="font-medium dark:text-slate-300">Kapak Görseli</Label>
                        {form.thumbnail_image && (
                        <div className="relative group w-full max-w-xs aspect-video rounded border dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 mt-1">
                            <img src={form.thumbnail_image} alt="Kapak Görseli Önizleme" className="w-full h-full object-contain" />
                            <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setForm(prev => prev ? {...prev, thumbnail_image: ''} : null)}>
                                <Trash2 className="h-4 w-4"/> {/* Düzeltme 2: Trash -> Trash2 */}
                            </Button>
                        </div>
                        )}
                        {!form.thumbnail_image && (
                            <div className="mt-1 w-full max-w-xs aspect-video rounded border border-dashed dark:border-slate-700 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500">
                                <ImageOff className="w-8 h-8 mb-1"/> <span className="text-xs">Kapak görseli seçilmedi</span>
                            </div>
                        )}
                        <Button 
                            id="thumbnail_image_button"
                            variant="outline" 
                            size="sm" 
                            onClick={() => {setImageTarget("thumbnail_image"); setShowMedia(true);}}
                            className="mt-2 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700"
                        >
                            <ImageIcon className="w-4 h-4 mr-2" /> Ortam Kütüphanesinden Seç
                        </Button>
                    </div>
                    <div className="space-y-1.5 pt-1 md:pt-0">
                        <Label htmlFor="published" className="block mb-2 font-medium dark:text-slate-300">Yayın Durumu</Label>
                        <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="published"
                            checked={form.published || false}
                            onChange={handleChange} // Düzeltme 4: handlePublishedChange -> handleChange
                            id="published"
                            className={`h-5 w-5 rounded border-gray-300 dark:border-slate-600 text-[${corporateColor}] focus:ring-2 focus:ring-[${corporateColor}] dark:bg-slate-700 dark:checked:bg-[${corporateColor}]`}
                        />
                        <Label htmlFor="published" className="cursor-pointer text-sm font-medium dark:text-slate-300">
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
                onClick={handleSubmit} 
                disabled={isSaving || !form.title?.trim() || !form.slug?.trim()}
                className="text-white min-w-[160px] h-11 text-base w-full sm:w-auto order-1 sm:order-2"
                style={{ backgroundColor: isSaving || !form.title?.trim() || !form.slug?.trim() ? undefined : corporateColor, opacity: isSaving || !form.title?.trim() || !form.slug?.trim() ? 0.6 : 1 }}
            >
              {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
              {isSaving ? "Güncelleniyor..." : "Değişiklikleri Kaydet"}
            </Button>
          </CardFooter>
        </Card>

        {showMedia && (
          <MediaLibraryModal
            onSelect={handleImageSelect}
            onClose={() => {setShowMedia(false); setImageTarget(null);}}
          />
        )}
      </div>
    </div>
  );
}
