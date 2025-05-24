"use client";

import React, { useState, useEffect } from "react"; // useEffect eklendi
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// shadcn/ui Bileşenleri
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // shadcn/ui Textarea kullanacağız
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

// lucide-react İkonları
import { Save, PlusCircle, ImageIcon, Loader2, ImageOff, Trash, FileText, Eye } from "lucide-react";

// MediaLibraryModal'ı MediaLibraryLoading ile sarmalayalım
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
  content: string; // HTML içeriği için
  seo_title: string;
  seo_description: string;
  thumbnail_image: string;
  published: boolean;
}

export default function NewBlogPage() {
  const router = useRouter();
  const [showMedia, setShowMedia] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Kaydetme durumu için
  const [form, setForm] = useState<BlogFormState>({
    title: "",
    slug: "",
    content: "<h1>Yeni Blog Yazısı</h1><p>Harika bir içerik oluşturmaya başlayın...</p>", // Varsayılan içerik
    seo_title: "",
    seo_description: "",
    thumbnail_image: "",
    published: false,
  });

  const corporateColor = "#6A3C96";

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '')
      .trim();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "title") {
        if (!prev.slug || prev.slug === generateSlug(prev.title)) {
          updated.slug = generateSlug(value);
        }
      }
      return updated;
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setForm((prev) => ({ ...prev, published: checked }));
  };
  
  const handleContentChange = (newContent: string) => {
    setForm((prev) => ({ ...prev, content: newContent }));
  };

  const handleImageSelect = (url: string) => {
    setForm((prev) => ({ ...prev, thumbnail_image: url }));
    setShowMedia(false);
  };

  const handleSubmit = async () => {
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
      const { error } = await supabase.from("bloglar").insert([
        {
          title: form.title,
          slug: form.slug,
          content: form.content, // HTML içerik
          seo_title: form.seo_title,
          seo_description: form.seo_description,
          thumbnail_image: form.thumbnail_image,
          published: form.published,
        }
      ]);

      if (error) throw error;

      toast({ title: "Başarılı", description: "Blog yazısı başarıyla eklendi." });
      router.push("/blogs"); // veya oluşturulan blogun edit sayfasına: router.push(`/blogs/edit/${data[0].id}`)
    } catch (error: any) {
      toast({ title: "Hata", description: error.message || "Blog eklenirken bir sorun oluştu.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-4 border-b dark:border-slate-700">
            <h1 className="text-3xl font-bold flex items-center text-gray-800 dark:text-slate-100">
                <PlusCircle className="w-8 h-8 mr-3" style={{color: corporateColor}}/>
                Yeni Blog Yazısı Oluştur
            </h1>
            <Button variant="outline" onClick={() => router.push('/blogs')} className="mt-4 sm:mt-0 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
                Blog Listesine Dön
            </Button>
        </div>

        <Card className="dark:bg-slate-850 dark:border-slate-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold flex items-center dark:text-slate-100" style={{color: corporateColor}}>
              <FileText className="w-6 h-6 mr-2" /> Blog Detayları
            </CardTitle>
            <CardDescription className="dark:text-slate-400">
              Yeni blog yazınız için gerekli bilgileri ve içeriği girin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label htmlFor="title">Başlık <span className="text-red-500">*</span></Label>
                <Input
                  id="title" name="title" placeholder="Etkileyici bir blog başlığı"
                  value={form.title} onChange={handleChange}
                  className="focus-visible:ring-1 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                  style={{ "--ring-color": corporateColor } as React.CSSProperties}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slug">URL (Slug) <span className="text-red-500">*</span></Label>
                <Input
                  id="slug" name="slug" placeholder="blog-basligi-url-yapisi (otomatik oluşur)"
                  value={form.slug} onChange={handleChange}
                  className="focus-visible:ring-1 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                  style={{ "--ring-color": corporateColor } as React.CSSProperties}
                />
              </div>
            </div>

            {/* HTML İçerik Alanı */}
            <div className="space-y-1.5">
              <Label htmlFor="content">İçerik (HTML Destekler) <span className="text-red-500">*</span></Label>
              <Textarea
                id="content" name="content"
                placeholder="<p>Blog yazınızın içeriğini buraya HTML formatında girin...</p>"
                value={form.content}
                onChange={handleContentChange} // Textarea için özel handler (veya handleChange'i uyarlayın)
                className="min-h-[300px] font-mono text-sm p-3 focus-visible:ring-1 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                style={{ "--ring-color": corporateColor } as React.CSSProperties}
              />
            </div>
            <div>
                <Label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 block flex items-center">
                    <Eye className="w-4 h-4 mr-2" /> İçerik Önizlemesi
                </Label>
                <div className="border rounded-md p-4 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 shadow-inner min-h-[150px]">
                    <div dangerouslySetInnerHTML={{ __html: form.content }} className="prose prose-sm sm:prose dark:prose-invert max-w-none" />
                </div>
            </div>

            {/* SEO Bilgileri */}
            <div className="space-y-4 pt-4 border-t dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-200">SEO Bilgileri (Opsiyonel)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <Label htmlFor="seo_title">SEO Başlık</Label>
                        <Input
                        id="seo_title" name="seo_title" placeholder="Google’da görünecek başlık"
                        value={form.seo_title} onChange={handleChange}
                        className="focus-visible:ring-1 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                        style={{ "--ring-color": corporateColor } as React.CSSProperties}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="seo_description">SEO Açıklama</Label>
                        <Textarea // SEO Açıklama için Input yerine Textarea daha uygun olabilir
                        id="seo_description" name="seo_description" placeholder="Google arama açıklaması (max 160 karakter)"
                        value={form.seo_description} onChange={handleContentChange} // Textarea için özel handler
                        rows={3}
                        className="min-h-[80px] focus-visible:ring-1 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                        style={{ "--ring-color": corporateColor } as React.CSSProperties}
                        />
                    </div>
                </div>
            </div>
            
            {/* Kapak Görseli ve Yayın Durumu */}
            <div className="space-y-4 pt-4 border-t dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-200">Görsel ve Yayın Ayarları</h3>
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
                                <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setForm(prev => ({...prev, thumbnail_image: ''}))}><Trash className="h-4 w-4"/></Button>
                            </div>
                            )}
                            {!form.thumbnail_image && (
                                <div className="w-full max-w-xs aspect-video rounded border border-dashed dark:border-slate-700 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500">
                                    <ImageOff className="w-8 h-8 mb-1"/> <span className="text-xs">Kapak görseli seçilmedi</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1.5 pt-1 md:pt-0"> {/* Mobil için hizalama */}
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
          <CardFooter className="flex justify-end pt-6 border-t dark:border-slate-700">
            <Button 
                onClick={handleSubmit} 
                disabled={isSaving || !form.title.trim() || !form.slug.trim()}
                className="text-white min-w-[160px] h-11 text-base"
                style={{ backgroundColor: isSaving || !form.title.trim() || !form.slug.trim() ? undefined : corporateColor, opacity: isSaving || !form.title.trim() || !form.slug.trim() ? 0.6 : 1 }}
            >
              {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
              {isSaving ? "Kaydediliyor..." : "Blog Yazısını Kaydet"}
            </Button>
          </CardFooter>
        </Card>

        {/* MediaLibraryModal dinamik olarak yüklenecek */}
        {showMedia && (
          <MediaLibraryModal
            onSelect={handleImageSelect}
            onClose={() => setShowMedia(false)}
          />
        )}
      </div>
    </div>
  );
}
