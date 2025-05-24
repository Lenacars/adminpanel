"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase"; // Supabase importu
import { toast } from "@/hooks/use-toast";

// shadcn/ui Bileşenleri (Sadece Button, Card ve Label gibi temel olanlar)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label"; // shadcn/ui Label
import { Separator } from "@/components/ui/separator";

// lucide-react İkonları
import { Save, Trash2, ImageIcon, ExternalLink, Settings, Info, Eye, Loader2, Newspaper, Link2, ImageOff, XCircle, UploadCloud } from "lucide-react";

// MediaLibrary'nin yüklenme durumu için basit bir bileşen
const MediaLibraryLoading = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60]">
    <div className="bg-white p-6 rounded-lg shadow-xl flex items-center">
      <Loader2 className="w-6 h-6 animate-spin mr-3 text-[#6A3C96]" />
      Medya Kütüphanesi Yükleniyor...
    </div>
  </div>
);

const MediaLibrary = dynamic(() => import("@/components/MediaLibrary"), { 
  ssr: false,
  loading: () => <MediaLibraryLoading />
});

// Tip tanımları (sizin kodunuzdaki gibi)
interface PageFormState {
  title: string;
  slug: string;
  html_content: string;
  seo_title: string;
  seo_description: string;
  banner_image: string;
  thumbnail_image: string;
  menu_group: string;
  status: "draft" | "published"; // string yerine union type
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
    html_content: "<h1>Sayfa İçeriği</h1><p>Buraya HTML girin.</p>",
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
  const [loading, setLoading] = useState(true); // Sayfa verisi yükleme durumu
  const [isSaving, setIsSaving] = useState(false); // Kaydetme/güncelleme durumu
  const [showMedia, setShowMedia] = useState(false);
  const [imageTarget, setImageTarget] = useState<keyof Pick<PageFormState, "banner_image" | "thumbnail_image"> | null>(null);

  const corporateColor = "#6A3C96";
  const corporateColorDarker = "#522d73";

  // Form elemanları için ortak Tailwind sınıfları
  const inputClassName = "border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 w-full rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-900";
  const selectClassName = `${inputClassName} appearance-none`; // Select için de benzer stil

  const fetchPageAndParents = useCallback(async () => {
    if (!id || id === 'new') { // 'new' ID'si için veri çekme (EditPage varsayılanı, NewPage kendi mantığını kullanır)
        setLoading(false);
        // Gerekirse NewPage'den gelen initialData burada kullanılabilir, ama bu EditPage olduğu için id'ye göre çekiyoruz.
        // Eğer id 'new' ise, bu sayfanın çağrılmaması veya farklı bir mantık izlenmesi gerekebilir.
        // Şimdilik id yoksa veya 'new' ise erken çıkıyoruz.
        if (id === 'new') {
            toast({title: "Uyarı", description: "Yeni sayfa oluşturmak için lütfen ilgili menüyü kullanın.", variant: "default"});
            router.push("/pages/new"); // Veya uygun bir sayfaya yönlendir
        }
        return;
    }
    setLoading(true);
    try {
      const [pageRes, parentPagesRes] = await Promise.all([
        fetch(`/api/pages/${id}`),
        fetch("/api/pages")
      ]);

      if (!pageRes.ok) {
        const errorData = await pageRes.json().catch(() => ({ message: "Sayfa verileri alınamadı."}));
        throw new Error(errorData.message);
      }
      const pageData = await pageRes.json();
      setForm({
        title: pageData.title || "",
        slug: pageData.slug || "",
        html_content: pageData.html_content || "<h1>Sayfa İçeriği</h1><p>Buraya HTML girin.</p>",
        seo_title: pageData.seo_title || "",
        seo_description: pageData.seo_description || "",
        banner_image: pageData.banner_image || "",
        thumbnail_image: pageData.thumbnail_image || "",
        menu_group: pageData.menu_group || "",
        status: pageData.status || "draft",
        parent: pageData.parent || "",
        external_url: pageData.external_url || "",
      });

      if (parentPagesRes.ok) {
        const allPages = await parentPagesRes.json();
        if (Array.isArray(allPages)) {
          const filtered = allPages.filter((p) => p.id !== id);
          setParentPages(filtered);
        }
      } else {
        console.warn("Üst sayfa listesi alınamadı.");
      }

    } catch (error: any) {
      console.error("Veri alım hatası:", error);
      toast({ title: "Veri Alım Hatası", description: error.message, variant: "destructive" });
      router.push("/pages"); // Hata durumunda listeye yönlendir
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchPageAndParents();
  }, [fetchPageAndParents]);

  const handleChange = (key: keyof PageFormState, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageSelect = (filename: string) => {
    if (imageTarget) {
      const imageUrl = filename.startsWith('http') ? filename : 
                       filename ? `https://uxnpmdeizkzvnevpceiw.supabase.co/storage/v1/object/public/images/${filename}` : "";
      handleChange(imageTarget, imageUrl);
    }
    setShowMedia(false);
    setImageTarget(null);
  };

  const handleUpdate = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
        toast({title: "Eksik Bilgi", description: "Lütfen Sayfa Başlığı ve URL (Slug) alanlarını doldurun.", variant: "destructive"});
        return;
    }
    setIsSaving(true);
    const updatedData = {
      ...form,
      published: form.status === "published",
      parent: form.parent || null,
    };

    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Bilinmeyen bir sunucu hatası." }));
        throw new Error(errorData.message || "Sayfa güncellenirken bir hata oluştu.");
      }
      toast({ title: "Başarılı", description: "Sayfa başarıyla güncellendi!" });
      router.push("/pages");
    } catch (error: any) {
      toast({ title: "Güncelleme Hatası", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`"${form.title}" başlıklı sayfayı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;
    setIsSaving(true); // Silme işlemi sırasında da butonu disable edebiliriz
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


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] p-8 bg-gray-50 dark:bg-slate-900">
        <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: corporateColor }} />
        <p className="text-lg font-medium text-gray-700 dark:text-slate-300">Sayfa Bilgileri Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-4 border-b dark:border-slate-700">
            <h1 className="text-3xl font-bold flex items-center text-gray-800 dark:text-slate-100">
                <Newspaper className="w-8 h-8 mr-3" style={{color: corporateColor}}/>
                Sayfa Düzenle
            </h1>
            <div className="flex gap-2 mt-4 sm:mt-0">
                <Button variant="outline" onClick={() => router.push('/pages/new')} className="dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
                    <PlusCircle className="mr-2 h-4 w-4" /> Yeni Ekle
                </Button>
                <Button variant="outline" onClick={() => router.push('/pages')} className="dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
                    Sayfa Listesine Dön
                </Button>
            </div>
        </div>

        <div className="space-y-8">
          {/* Temel Bilgiler */}
          <Card className="dark:bg-slate-850 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-semibold dark:text-slate-100"><Info className="w-5 h-5 mr-2" style={{color: corporateColor}} /> Temel Sayfa Bilgileri</CardTitle>
              <CardDescription className="dark:text-slate-400">Sayfanızın başlığını, URL yapısını (slug) ve harici bağlantısını girin.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="font-medium dark:text-slate-300">Sayfa Başlığı *</Label>
                <input id="title" placeholder="Etkileyici bir başlık girin" value={form.title} onChange={(e) => handleChange("title", e.target.value)} className={`${inputClassName} focus:ring-[${corporateColor}]`} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slug" className="font-medium dark:text-slate-300">URL (Slug) *</Label>
                <input id="slug" placeholder="sayfa-url-yapisi" value={form.slug} onChange={(e) => handleChange("slug", e.target.value)} className={`${inputClassName} focus:ring-[${corporateColor}]`} required />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="external_url" className="font-medium dark:text-slate-300 flex items-center"><ExternalLink className="w-4 h-4 mr-2 text-gray-500"/> Harici Bağlantı (Opsiyonel)</Label>
                <input id="external_url" placeholder="https://... (Doluysa içerik yerine buraya yönlenir)" value={form.external_url} onChange={(e) => handleChange("external_url", e.target.value)} className={`${inputClassName} focus:ring-[${corporateColor}]`} />
                <p className="text-xs text-gray-500 dark:text-slate-400 pt-1">Eğer bu alan doluysa, sayfa içeriği yerine kullanıcılar bu adrese yönlendirilir.</p>
              </div>
            </CardContent>
          </Card>

          {/* HTML İçeriği (Harici bağlantı yoksa) */}
          {!form.external_url && (
            <Card className="dark:bg-slate-850 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold dark:text-slate-100"><FileText className="w-5 h-5 mr-2" style={{color: corporateColor}} /> Sayfa İçeriği (HTML)</CardTitle>
                <CardDescription className="dark:text-slate-400">Sayfanızın ana içeriğini HTML formatında düzenleyin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  className={`${inputClassName} focus:ring-[${corporateColor}] min-h-[350px] font-mono text-sm p-3`}
                  placeholder="<p>HTML içeriği buraya...</p>"
                  value={form.html_content}
                  onChange={(e) => handleChange("html_content", e.target.value)}
                />
                <div>
                  <Label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 block flex items-center"><Eye className="w-4 h-4 mr-2" /> Canlı Önizleme</Label>
                  <div className="border rounded-md p-4 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 shadow-inner min-h-[200px]">
                    <div dangerouslySetInnerHTML={{ __html: form.html_content }} className="prose prose-sm sm:prose dark:prose-invert max-w-none" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEO Bilgileri */}
          <Card className="dark:bg-slate-850 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-semibold dark:text-slate-100"><Search className="w-5 h-5 mr-2" style={{color: corporateColor}} /> SEO Ayarları</CardTitle>
              <CardDescription className="dark:text-slate-400">Arama motorları için sayfanızın başlığını ve açıklamasını optimize edin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="seo_title" className="font-medium dark:text-slate-300">SEO Başlığı</Label>
                <input id="seo_title" placeholder="Arama motorlarında görünecek başlık" value={form.seo_title} onChange={(e) => handleChange("seo_title", e.target.value)} className={`${inputClassName} focus:ring-[${corporateColor}]`} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seo_description" className="font-medium dark:text-slate-300">SEO Açıklaması</Label>
                <textarea id="seo_description" rows={3} placeholder="Sayfanızın kısa ve etkili açıklaması (max 160 karakter)" value={form.seo_description} onChange={(e) => handleChange("seo_description", e.target.value)} className={`${inputClassName} focus:ring-[${corporateColor}] min-h-[80px]`} />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 block">Google Önizlemesi:</Label>
                <div className="p-4 rounded-md border bg-white dark:bg-slate-900 dark:border-slate-700">
                  <p className="text-xs text-green-600 dark:text-green-400 truncate">https://lenacars.com/{form.slug || "sayfa-adresiniz"}</p>
                  <p className="text-blue-600 text-lg font-medium truncate dark:text-blue-400 hover:underline cursor-pointer">{form.seo_title || form.title || "Sayfa Başlığı"}</p>
                  <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2">{form.seo_description || "Sayfanız için çekici bir meta açıklaması buraya gelecek..."}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ayarlar & Görseller */}
          <Card className="dark:bg-slate-850 dark:border-slate-700">
             <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold dark:text-slate-100"><Settings className="w-5 h-5 mr-2" style={{color: corporateColor}}/> Genel Ayarlar ve Görseller</CardTitle>
                <CardDescription className="dark:text-slate-400">Sayfanızın menüdeki yeri, durumu ve görsellerini buradan ayarlayın.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
              <div className="space-y-1.5">
                <Label htmlFor="menu_group" className="font-medium dark:text-slate-300">Menü Grubu</Label>
                <select id="menu_group" value={form.menu_group} onChange={(e) => handleChange("menu_group", e.target.value)} className={`${selectClassName} focus:ring-[${corporateColor}]`}>
                  <option value="">Ana Menüde Gösterme</option>
                  <option value="kurumsal">Kurumsal</option>
                  <option value="kiralama">Kiralama</option>
                  {/* Diğer options */}
                  <option value="ikinci-el">İkinci El</option>
                  <option value="lenacars-bilgilendiriyor">LenaCars Bilgilendiriyor</option>
                  <option value="basin-kosesi">Basın Köşesi</option>
                  <option value="elektrikli-araclar">Elektrikli Araçlar</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="parent" className="font-medium dark:text-slate-300">Üst Sayfa (Hiyerarşi)</Label>
                <select id="parent" value={form.parent} onChange={(e) => handleChange("parent", e.target.value)} className={`${selectClassName} focus:ring-[${corporateColor}]`}>
                  <option value="">Yok (Ana Kategori)</option>
                  {parentPages.map((page) => (
                    <option key={page.id} value={page.id}>{page.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="block text-sm font-medium dark:text-slate-300">Banner Görseli</Label>
                {form.banner_image ? (
                  <div className="relative group w-full aspect-video rounded border dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={form.banner_image} alt="Banner" className="w-full h-full object-contain" />
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleChange('banner_image', '')}><Trash className="h-4 w-4"/></Button>
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded border border-dashed dark:border-slate-700 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400">
                    <ImageOff className="w-10 h-10 mb-2"/> <span>Banner Seçilmedi</span>
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700" onClick={() => openMediaLibrary("banner_image")}>
                  <ImageIcon className="w-4 h-4 mr-2" /> Banner Seç/Değiştir
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="block text-sm font-medium dark:text-slate-300">Thumbnail Görseli</Label>
                 {form.thumbnail_image ? (
                  <div className="relative group w-full aspect-video rounded border dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={form.thumbnail_image} alt="Thumbnail" className="w-full h-full object-contain" />
                     <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleChange('thumbnail_image', '')}><Trash className="h-4 w-4"/></Button>
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded border border-dashed dark:border-slate-700 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400">
                     <ImageOff className="w-10 h-10 mb-2"/> <span>Thumbnail Seçilmedi</span>
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700" onClick={() => openMediaLibrary("thumbnail_image")}>
                  <ImageIcon className="w-4 h-4 mr-2" /> Thumbnail Seç/Değiştir
                </Button>
              </div>
              
              <div className="md:col-span-2 flex items-center space-x-3 pt-2">
                <Label htmlFor="status" className="cursor-pointer text-sm font-medium dark:text-slate-300 whitespace-nowrap">Sayfa Durumu:</Label>
                <select id="status" value={form.status} onChange={(e) => handleChange("status", e.target.value as "draft" | "published")} className={`${selectClassName} focus:ring-[${corporateColor}] w-auto`}>
                  <option value="draft">Taslak</option>
                  <option value="published">Yayında</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-8 dark:bg-slate-700"/>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving} className="w-full sm:w-auto order-2 sm:order-1">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Trash2 className="w-4 h-4 mr-2" />}
              Sayfayı Sil
            </Button>
            <Button 
              onClick={handleUpdate} 
              disabled={isSaving || !form.title.trim()} 
              className="w-full sm:w-auto text-white hover:opacity-90 order-1 sm:order-2"
              style={{ backgroundColor: isSaving || !form.title.trim() ? undefined : corporateColor, opacity: isSaving || !form.title.trim() ? 0.6 : 1 }}
            >
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isSaving ? "Güncelleniyor..." : "Sayfayı Güncelle"}
            </Button>
          </div>
        </div>
      </div>

      {showMedia && <MediaLibrary onSelect={handleImageSelect} onClose={() => {setShowMedia(false); setImageTarget(null);}} />}
    </div>
  );
}
