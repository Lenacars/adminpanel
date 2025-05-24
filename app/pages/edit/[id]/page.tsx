"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase"; // Supabase client (görsel URL'leri için gerekebilir)
import { toast } from "@/hooks/use-toast";

// shadcn/ui Bileşenleri
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch"; // Durum için Switch
import { Separator } from "@/components/ui/separator"; // Ayırıcı

// lucide-react İkonları
import { Save, Trash2, ImageIcon, ExternalLink, Settings, Info, Eye, Search, Loader2, Newspaper, Link2, ImageOff, Trash } from "lucide-react";

const MediaLibrary = dynamic(() => import("@/components/MediaLibrary"), { 
  ssr: false,
  loading: () => <div className="flex justify-center items-center p-4"><Loader2 className="w-6 h-6 animate-spin"/> Medya Kütüphanesi Yükleniyor...</div>
});

interface PageFormState {
  title: string;
  slug: string;
  html_content: string;
  seo_title: string;
  seo_description: string;
  banner_image: string;
  thumbnail_image: string;
  menu_group: string;
  status: "draft" | "published";
  parent: string;
  external_url: string;
}

interface ParentPage {
  id: string;
  title: string;
}

export default function EditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState<PageFormState>({
    title: "",
    slug: "",
    html_content: "<h1>Sayfa İçeriği</h1><p>Buraya HTML içeriğinizi girin.</p>",
    seo_title: "",
    seo_description: "",
    banner_image: "",
    thumbnail_image: "",
    menu_group: "",
    status: "draft",
    parent: "",
    external_url: "",
  });

  const [parentPages, setParentPages] = useState<ParentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [imageTarget, setImageTarget] = useState<keyof Pick<PageFormState, "banner_image" | "thumbnail_image"> | null>(null);

  const corporateColor = "#6A3C96";

  const fetchPageAndParents = useCallback(async () => {
    if (!id) {
      setLoading(false);
      toast({ title: "Hata", description: "Sayfa ID bulunamadı.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const [pageRes, parentPagesRes] = await Promise.all([
        fetch(`/api/pages/${id}`),
        fetch("/api/pages") // Tüm sayfaları çekiyoruz, sonra filtreleyeceğiz
      ]);

      if (!pageRes.ok) {
        throw new Error("Sayfa verisi alınamadı.");
      }
      const pageData = await pageRes.json();
      setForm({
        title: pageData.title || "",
        slug: pageData.slug || "",
        html_content: pageData.html_content || "<h1>Sayfa İçeriği</h1>",
        seo_title: pageData.seo_title || "",
        seo_description: pageData.seo_description || "",
        banner_image: pageData.banner_image || "",
        thumbnail_image: pageData.thumbnail_image || "",
        menu_group: pageData.menu_group || "",
        status: pageData.status || "draft",
        parent: pageData.parent || "",
        external_url: pageData.external_url || "",
      });

      if (!parentPagesRes.ok) {
        throw new Error("Üst sayfa listesi alınamadı.");
      }
      const allPages = await parentPagesRes.json();
      if (Array.isArray(allPages)) {
        const filtered = allPages.filter(
          (p) => p.id !== id // Kendisini üst sayfa olarak seçemesin
        );
        setParentPages(filtered);
      }

    } catch (error: any) {
      console.error("Veri alım hatası:", error);
      toast({ title: "Veri Alım Hatası", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPageAndParents();
  }, [fetchPageAndParents]);


  const handleChange = (key: keyof PageFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "title" && !form.slug && mode === 'create') { // Sadece create modunda ve slug boşken title'dan slug üret (opsiyonel)
        const newSlug = value
            .toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^\w\s-]/g, '') // Remove non-word characters except spaces and hyphens
            .replace(/\s+/g, '-')     // Replace spaces with hyphens
            .replace(/--+/g, '-')     // Replace multiple hyphens with single
            .trim();
        setForm((prev) => ({ ...prev, slug: newSlug }));
    }
  };
  
  const mode = id ? (id === 'new' ? 'create' : 'edit') : 'create'; // 'new' ID'si ile create modunu belirle

  const handleImageSelect = (filename: string) => {
    if (imageTarget) {
      // Supabase URL'sini MediaLibrary'den alıyorsak, direkt o URL'i kullanabiliriz.
      // Eğer sadece dosya adı geliyorsa, burada oluşturmamız gerekir.
      // Varsayım: MediaLibrary tam URL veya sadece dosya adı dönebilir.
      // Eğer sadece dosya adı dönüyorsa:
      const imageUrl = filename.startsWith('http') ? filename : `https://uxnpmdeizkzvnevpceiw.supabase.co/storage/v1/object/public/images/${filename}`;
      handleChange(imageTarget, imageUrl);
    }
    setShowMedia(false);
    setImageTarget(null);
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    const apiEndpoint = mode === 'create' ? '/api/pages' : `/api/pages/${id}`;
    const apiMethod = mode === 'create' ? 'POST' : 'PUT';

    const dataToSave: Partial<PageFormState> & { published: boolean, parent: string | null } = {
      ...form,
      published: form.status === "published",
      parent: form.parent || null, // Boş string ise null gönder
    };
    // Create modunda ID göndermiyoruz, Supabase/API oluşturacak
    if (mode === 'create') {
        delete (dataToSave as any).id;
    }


    try {
      const res = await fetch(apiEndpoint, {
        method: apiMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Bilinmeyen bir sunucu hatası." }));
        throw new Error(errorData.message || `Sayfa ${mode === 'create' ? 'oluşturulurken' : 'güncellenirken'} hata oluştu.`);
      }
      
      const resultData = await res.json();
      toast({ title: "Başarılı", description: `Sayfa başarıyla ${mode === 'create' ? 'oluşturuldu' : 'güncellendi'}!` });
      if (mode === 'create' && resultData.id) {
        router.push(`/pages/edit/${resultData.id}`); // Oluşturduktan sonra düzenleme sayfasına yönlendir
      } else if (mode === 'edit') {
        router.push("/pages"); // Düzenledikten sonra liste sayfasına
      } else {
        fetchPageAndParents(); // Veya formu sıfırla/yenile
      }

    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (mode === 'create' || !id) return; // Oluşturma modunda silme olmaz
    if (!window.confirm("Bu sayfayı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Bilinmeyen bir silme hatası." }));
        throw new Error(errorData.message || "Sayfa silinirken bir hata oluştu.");
      }
      toast({ title: "Başarılı", description: "Sayfa başarıyla silindi." });
      router.push("/pages");
    } catch (error: any) {
      toast({ title: "Silme Hatası", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  const openMediaLibrary = (target: keyof Pick<PageFormState, "banner_image" | "thumbnail_image">) => {
    setImageTarget(target);
    setShowMedia(true);
  };

  if (loading && mode === 'edit') { // Sadece edit modunda ve ID varsa yükleniyor göster
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)]">
            <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: corporateColor }} />
            <p className="text-lg font-medium text-gray-700">Sayfa Bilgileri Yükleniyor...</p>
        </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-4 border-b">
            <h1 className="text-3xl font-bold flex items-center" style={{color: corporateColor}}>
                <Newspaper className="w-8 h-8 mr-3"/>
                {mode === 'create' ? "Yeni Sayfa Oluştur" : "Sayfa Düzenle"}
            </h1>
            <div className="flex gap-2 mt-4 sm:mt-0">
                {mode === 'edit' && (
                     <Button variant="outline" onClick={() => router.push('/pages/new')}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Yeni Ekle
                    </Button>
                )}
                <Button variant="outline" onClick={() => router.push('/pages')}>
                    Sayfa Listesine Dön
                </Button>
            </div>
        </div>

        <div className="space-y-8">
          {/* Temel Bilgiler ve Harici Bağlantı */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl"><Info className="w-5 h-5 mr-2" style={{color: corporateColor}} /> Temel Sayfa Bilgileri</CardTitle>
              <CardDescription>Sayfanızın başlığını, URL yapısını (slug) ve eğer bir dış bağlantıya yönlendirecekse o adresi girin.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label htmlFor="title">Sayfa Başlığı *</Label>
                <Input id="title" placeholder="Etkileyici bir başlık girin" value={form.title} onChange={(e) => handleChange("title", e.target.value)} style={{ "--ring-color": corporateColor } as React.CSSProperties}/>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slug">URL (Slug) *</Label>
                <Input id="slug" placeholder="sayfa-url-yapisi" value={form.slug} onChange={(e) => handleChange("slug", e.target.value)} style={{ "--ring-color": corporateColor } as React.CSSProperties}/>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="external_url">Harici Bağlantı (Opsiyonel)</Label>
                <Input id="external_url" placeholder="https://www.orneksite.com (Doluysa içerik yerine buraya yönlenir)" value={form.external_url} onChange={(e) => handleChange("external_url", e.target.value)} style={{ "--ring-color": corporateColor } as React.CSSProperties}/>
                <p className="text-xs text-gray-500 pt-1">Eğer bu alan doluysa, sayfa içeriği yerine kullanıcılar bu adrese yönlendirilir.</p>
              </div>
            </CardContent>
          </Card>

          {/* HTML İçeriği ve Önizleme */}
          {!form.external_url && ( // Sadece harici bağlantı yoksa göster
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl"><FileText className="w-5 h-5 mr-2" style={{color: corporateColor}} /> Sayfa İçeriği (HTML)</CardTitle>
                <CardDescription>Sayfanızın ana içeriğini HTML formatında düzenleyin. Değişiklikleri canlı önizlemede görebilirsiniz.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  className="min-h-[350px] font-mono text-sm border rounded-md p-3 focus-visible:ring-1"
                  placeholder="<p>HTML içeriği buraya...</p>"
                  value={form.html_content}
                  onChange={(e) => handleChange("html_content", e.target.value)}
                  style={{ "--ring-color": corporateColor } as React.CSSProperties}
                />
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center"><Eye className="w-4 h-4 mr-2" /> Canlı Önizleme</Label>
                  <div className="border rounded-md p-4 bg-slate-50 shadow-inner min-h-[200px]">
                    <div dangerouslySetInnerHTML={{ __html: form.html_content }} className="prose prose-sm sm:prose max-w-none" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEO Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl"><Search className="w-5 h-5 mr-2" style={{color: corporateColor}} /> SEO Ayarları</CardTitle>
              <CardDescription>Arama motorları için sayfanızın başlığını ve açıklamasını optimize edin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="seo_title">SEO Başlığı</Label>
                <Input id="seo_title" placeholder="Arama motorlarında görünecek başlık" value={form.seo_title} onChange={(e) => handleChange("seo_title", e.target.value)} style={{ "--ring-color": corporateColor } as React.CSSProperties}/>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seo_description">SEO Açıklaması</Label>
                <Textarea id="seo_description" rows={3} placeholder="Sayfanızın kısa ve etkili açıklaması (max 160 karakter)" value={form.seo_description} onChange={(e) => handleChange("seo_description", e.target.value)} className="min-h-[80px] focus-visible:ring-1" style={{ "--ring-color": corporateColor } as React.CSSProperties}/>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Google Önizlemesi:</Label>
                <div className="p-4 rounded-md border bg-white dark:bg-slate-800 dark:border-slate-700">
                  <p className="text-xs text-green-600 dark:text-green-400 truncate">https://lenacars.com/{form.slug || "sayfa-adresiniz"}</p>
                  <p className="text-blue-600 text-lg font-medium truncate dark:text-blue-400 hover:underline cursor-pointer">{form.seo_title || form.title || "Sayfa Başlığı"}</p>
                  <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2">{form.seo_description || "Sayfanız için çekici bir meta açıklaması buraya gelecek. Kullanıcıların tıklamasını sağlayacak bilgiler verin."}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Görseller ve Sayfa Ayarları */}
          <Card>
             <CardHeader>
                <CardTitle className="flex items-center text-xl"><Settings className="w-5 h-5 mr-2" style={{color: corporateColor}}/> Genel Ayarlar ve Görseller</CardTitle>
                <CardDescription>Sayfanızın menüdeki yeri, durumu ve görsellerini buradan ayarlayın.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
              <div className="space-y-1.5">
                <Label htmlFor="menu_group">Menü Grubu</Label>
                <Select value={form.menu_group} onValueChange={(value) => handleChange("menu_group", value)}>
                  <SelectTrigger id="menu_group" style={{ "--ring-color": corporateColor } as React.CSSProperties}><SelectValue placeholder="Menü grubu seçin..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Ana Menüde Gösterme</SelectItem>
                    <SelectItem value="kurumsal">Kurumsal</SelectItem>
                    <SelectItem value="kiralama">Kiralama</SelectItem>
                    <SelectItem value="ikinci-el">İkinci El</SelectItem>
                    <SelectItem value="lenacars-bilgilendiriyor">LenaCars Bilgilendiriyor</SelectItem>
                    <SelectItem value="basin-kosesi">Basın Köşesi</SelectItem>
                    <SelectItem value="elektrikli-araclar">Elektrikli Araçlar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="parent">Üst Sayfa (Hiyerarşi)</Label>
                <Select value={form.parent} onValueChange={(value) => handleChange("parent", value)}>
                  <SelectTrigger id="parent" style={{ "--ring-color": corporateColor } as React.CSSProperties}><SelectValue placeholder="Üst sayfa seçin (opsiyonel)..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Yok (Ana Sayfa)</SelectItem>
                    {parentPages.map((page) => (
                      <SelectItem key={page.id} value={page.id}>{page.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="block text-sm font-medium">Banner Görseli</Label>
                {form.banner_image ? (
                  <div className="relative group w-full h-40 rounded border overflow-hidden">
                    <img src={form.banner_image} alt="Banner Görseli" className="w-full h-full object-cover" />
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleChange('banner_image', '')}><Trash className="h-4 w-4"/></Button>
                  </div>
                ) : (
                  <div className="w-full h-40 rounded border border-dashed flex flex-col items-center justify-center bg-slate-50 text-gray-500">
                    <ImageOff className="w-10 h-10 mb-2"/>
                    <span>Banner Seçilmedi</span>
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full" onClick={() => openMediaLibrary("banner_image")}>
                  <ImageIcon className="w-4 h-4 mr-2" /> Banner Görseli Seç/Değiştir
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="block text-sm font-medium">Thumbnail (Önizleme) Görseli</Label>
                 {form.thumbnail_image ? (
                  <div className="relative group w-full h-40 rounded border overflow-hidden">
                    <img src={form.thumbnail_image} alt="Thumbnail Görseli" className="w-full h-full object-cover" />
                     <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleChange('thumbnail_image', '')}><Trash className="h-4 w-4"/></Button>
                  </div>
                ) : (
                  <div className="w-full h-40 rounded border border-dashed flex flex-col items-center justify-center bg-slate-50 text-gray-500">
                     <ImageOff className="w-10 h-10 mb-2"/>
                     <span>Thumbnail Seçilmedi</span>
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full" onClick={() => openMediaLibrary("thumbnail_image")}>
                  <ImageIcon className="w-4 h-4 mr-2" /> Thumbnail Seç/Değiştir
                </Button>
              </div>
              
              <div className="md:col-span-2 flex items-center space-x-2 pt-2">
                <Switch id="status" checked={form.status === "published"} onCheckedChange={(checked) => handleChange("status", checked ? "published" : "draft")} 
                        className="data-[state=checked]:bg-[#6A3C96]" />
                <Label htmlFor="status" className="cursor-pointer text-sm font-medium">
                  {form.status === "published" ? "Sayfa Yayında" : "Sayfa Taslak Olarak Kayıtlı"}
                </Label>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-8"/>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            {mode === 'edit' && (
              <Button variant="destructive" onClick={handleDelete} disabled={isSaving} className="w-full sm:w-auto">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Trash2 className="w-4 h-4 mr-2" />}
                Sayfayı Sil
              </Button>
            )}
            <Button 
              onClick={handleUpdate} 
              disabled={isSaving || !form.title.trim()} 
              className="w-full sm:w-auto text-white hover:opacity-90"
              style={{ backgroundColor: isSaving || !form.title.trim() ? undefined : corporateColor, opacity: isSaving || !form.title.trim() ? 0.6 : 1 }}
            >
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isSaving ? (mode === 'create' ? "Oluşturuluyor..." : "Güncelleniyor...") : (mode === 'create' ? "Sayfayı Oluştur" : "Sayfayı Güncelle")}
            </Button>
          </div>
        </div>
      </div>

      {/* MediaLibrary modalı dinamik olarak yüklenecek */}
      {showMedia && <MediaLibrary onSelect={handleImageSelect} onClose={() => {setShowMedia(false); setImageTarget(null);}} />}
    </div>
  );
}
