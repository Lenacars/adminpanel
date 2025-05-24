"use client";

import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid"; // uuidv4 importu eksikti, ekledim.
import { toast } from "@/hooks/use-toast"; // shadcn/ui toast

// shadcn/ui Bileşenleri
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

// lucide-react İkonları
import { Plus, X, Trash2, UploadCloud, ImageIcon, Search, ImageOff, Loader2 } from "lucide-react";

// Tip tanımları (öncekiyle aynı)
interface Variation {
  id: string; // Client-side ID için uuidv4 kullanılacak
  kilometre: string;
  sure: string;
  fiyat: number;
  status: string;
  arac_id?: string; // DB'den gelen veya DB'ye kaydedilecek araç ID'si
  // DB'den gelen variation'ların kendi ID'si de olabilir, ama formda client-side ID kullanmak daha kolay.
  db_id?: string; // DB'den gelen variation'ın ID'si (güncelleme/silme için)
}

interface Product {
  id?: string; // Düzenleme modunda dolu, oluşturma modunda boş veya Supabase tarafından atanır
  isim: string;
  aciklama: string;
  kisa_aciklama: string;
  stok_kodu: string;
  segment: string;
  yakit_turu: string;
  vites: string;
  durum: string;
  brand: string;
  category: string; // Bu alan formda yoktu, gerekirse eklenmeli
  fiyat: number; // Bu ana fiyat, varyasyonlardan gelen en düşük fiyatla güncelleniyor
  bodyType: string;
  cover_image: string; // dosya adı
  gallery_images: string[]; // dosya adları listesi
}

// Sabitler (öncekiyle aynı)
const YAKIT_OPTIONS = ["Benzin", "Benzin + LPG", "Dizel", "Elektrik", "Hibrit"];
const VITES_OPTIONS = ["Manuel", "Otomatik"];
const MARKA_OPTIONS = ["Audi", "BMW", "Citroen", "Dacia", "Fiat", "Ford", "Honda", "Hyundai", "Kia", "Mercedes-Benz", "Nissan", "Opel", "Peugeot", "Renault", "Seat", "Skoda", "Toyota", "Volkswagen", "Volvo", "Diğer"];
const SEGMENT_OPTIONS = ["Ekonomik", "Orta", "Orta-Üst", "Ticari", "SUV", "Premium", "Lüks"];
const BODYTYPE_OPTIONS = ["Hatchback", "Sedan", "Station Wagon", "SUV", "Crossover", "MPV", "Pickup", "Minivan", "Coupe", "Cabrio"];
const DURUM_OPTIONS = ["Sıfır", "İkinci El"];
const KILOMETRE_OPTIONS = ["1.000 KM/Ay", "1.500 KM/Ay", "2.000 KM/Ay", "2.500 KM/Ay", "3.000 KM/Ay", "Sınırsız KM", "10.000 KM/Yıl", "15.000 KM/Yıl", "20.000 KM/Yıl", "25.000 KM/Yıl", "30.000 KM/Yıl"];
const SURE_OPTIONS = ["1 Ay", "3 Ay", "6 Ay", "12 Ay", "18 Ay", "24 Ay", "36 Ay", "48 Ay"];
const VARIATION_STATUS_OPTIONS = ["Aktif", "Pasif", "Bakımda", "Rezerve"];


export default function EditProductPage({
  initialData,
  initialVariations, // NewProductPage'den gelen prop adı initialVariations olarak güncellenmişti
  mode = "edit",
  // onSave, // Eğer NewProductPage'deki handleSave kullanılacaksa bu prop eklenmeli
  // isSaving: parentIsSaving // Eğer NewProductPage'deki isSaving kullanılacaksa
}: {
  initialData: Product;
  initialVariations?: Variation[]; // Oluşturma modunda bu prop dolu gelir
  mode?: "edit" | "create";
  // onSave?: (productData: Product, variationsData: Variation[]) => Promise<void>;
  // isSaving?: boolean;
}) {
  const [product, setProduct] = useState<Product>(initialData);
  const [kisaAciklama, setKisaAciklama] = useState(initialData.kisa_aciklama || "");
  const [aciklama, setAciklama] = useState(initialData.aciklama || "");
  const [galleryFiles, setGalleryFiles] = useState<string[]>(initialData.gallery_images || []);
  const [variations, setVariations] = useState<Variation[]>(mode === 'create' && initialVariations ? initialVariations : []);
  
  const [imageOptions, setImageOptions] = useState<Array<{ name: string; url: string }>>([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectingCover, setSelectingCover] = useState(true);
  const [imageSearch, setImageSearch] = useState(""); // Modal içi arama için farklı bir state
  const [isSavingInternal, setIsSavingInternal] = useState(false); // Bileşen içi kaydetme durumu
  const [isLoadingVariations, setIsLoadingVariations] = useState(mode === 'edit'); // Varyasyon yükleme durumu

  const corporateColor = "#6A3C96";
  const corporateColorDarker = "#522d73"; // Örnek koyu ton

  useEffect(() => {
    // initialData değiştiğinde product state'ini güncelle (edit modunda dışarıdan ID yüklendikten sonra)
    setProduct(initialData);
    setKisaAciklama(initialData.kisa_aciklama || "");
    setAciklama(initialData.aciklama || "");
    setGalleryFiles(initialData.gallery_images || []);
  }, [initialData]);


  useEffect(() => {
    const fetchVariations = async () => {
      if (!product.id) { // product.id henüz yoksa (örn: create modunda ilk render)
        setIsLoadingVariations(false);
        if (mode === 'create' && initialVariations) {
             setVariations(initialVariations.map(v => ({...v, id: v.id || uuidv4()})));
        } else {
            setVariations([]);
        }
        return;
      }
      
      setIsLoadingVariations(true);
      const { data, error } = await supabase
        .from("variations")
        .select("id, kilometre, sure, fiyat, status, arac_id") // DB'den gelen ID'yi db_id olarak alalım
        .eq("arac_id", product.id);

      if (error) {
        console.error("Error fetching variations:", error);
        toast({ title: "Hata", description: "Varyasyonlar yüklenirken bir sorun oluştu.", variant: "destructive"});
      } else if (data) {
        setVariations(data.map(v => ({ ...v, db_id: v.id, id: uuidv4() }))); // Client-side için yeni ID ata, DB ID'sini sakla
      }
      setIsLoadingVariations(false);
    };

    if (mode === "edit") {
      fetchVariations();
    } else if (mode === "create" && initialVariations) {
      setVariations(initialVariations.map(v => ({...v, id: v.id || uuidv4()})));
      setIsLoadingVariations(false);
    } else {
        setIsLoadingVariations(false);
    }
  }, [product.id, mode, initialVariations]);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase.storage.from("images").list("", { limit: 500, sortBy: { column: 'created_at', order: 'desc' } }); // Daha fazla görsel ve sıralama
      if (error) {
        console.error("Error fetching images from storage:", error);
        toast({ title: "Hata", description: "Depolama görselleri yüklenemedi.", variant: "destructive"});
      } else if (data) {
        const options = data
            .filter(file => file.name !== '.emptyFolderPlaceholder') // Placeholder'ı filtrele
            .map(file => ({
                name: file.name,
                url: supabase.storage.from("images").getPublicUrl(file.name).data.publicUrl
            }));
        setImageOptions(options);
      }
    };
    fetchImages();
  }, []);

  const getPublicUrl = (path: string) => { // Bu fonksiyon artık doğrudan imageOptions'tan URL aldığı için gereksiz olabilir
    if (!path) return "/placeholder.svg"; // Varsayılan placeholder
    return imageOptions.find(img => img.name === path)?.url || supabase.storage.from("images").getPublicUrl(path).data.publicUrl || "/placeholder.svg";
  };
  
  const handleProductChange = (key: keyof Product, value: any) => {
    setProduct(prev => ({ ...prev, [key]: value }));
  };

  const handleVariationChange = (index: number, field: keyof Omit<Variation, 'id' | 'db_id' | 'arac_id'>, value: string | number) => {
    setVariations(prev => 
      prev.map((v, i) => 
        i === index ? { ...v, [field]: field === "fiyat" ? parseFloat(String(value)) || 0 : value } : v
      )
    );
  };

  const handleAddVariation = () => {
    setVariations(prev => [...prev, {
      id: uuidv4(), // Yeni client-side ID
      kilometre: KILOMETRE_OPTIONS[0],
      sure: SURE_OPTIONS[0],
      fiyat: 0,
      status: "Aktif",
      arac_id: product.id // Mevcut ürün ID'si (edit modunda) veya yeni ürün ID'si (create modunda kayıttan sonra)
    }]);
  };

  const handleRemoveVariation = (idToRemove: string) => {
    setVariations(prev => prev.filter(v => v.id !== idToRemove));
  };
  
  const handleRemoveGalleryImage = (imgToRemove: string) => {
    setGalleryFiles(prev => prev.filter(img => img !== imgToRemove));
  };

  const handleImageSelect = (imgName: string) => {
    if (selectingCover) {
      handleProductChange('cover_image', imgName);
      setShowImageModal(false);
    } else {
      setGalleryFiles(prev =>
        prev.includes(imgName) ? prev.filter(i => i !== imgName) : [...prev, imgName]
      );
    }
  };

  const handleActualSave = async () => {
    // Bu fonksiyon, NewProductPage'deki onSave prop'u ile çağrılabilir veya burada direkt kullanılabilir.
    // Şimdilik, NewProductPage'in kendi onSave prop'unu kullanacağını varsayarak buradaki mantığı oraya taşıdık.
    // Eğer bu bileşen kendi kaydetme mantığını yönetecekse, NewProductPage'deki handleSave buraya taşınabilir/adapte edilebilir.
    // Mevcut kodunuzda bu bileşen kendi handleSave'ini içeriyor, o yüzden onu kullanacağım.

    if (!product.isim.trim()) {
        toast({ title: "Eksik Bilgi", description: "Lütfen ürün adını giriniz.", variant: "destructive"});
        return;
    }
    
    setIsSavingInternal(true);
    try {
      const activeVariations = variations.filter(v => v.status === "Aktif" && v.fiyat > 0);
      const lowestPrice = activeVariations.length > 0
        ? Math.min(...activeVariations.map(v => v.fiyat))
        : product.fiyat || 0;

      const productDataForSave: Omit<Product, 'id'> & { id?: string, gallery_images: string[], fiyat: number, kisa_aciklama: string, aciklama: string } = {
        ...product,
        isim: product.isim.trim(),
        kisa_aciklama: kisaAciklama.trim(),
        aciklama: aciklama.trim(),
        gallery_images: galleryFiles,
        fiyat: lowestPrice,
      };
      
      let savedProductId = product.id;

      if (mode === "create") {
        const { id, ...insertData } = productDataForSave; // ID'yi insertData'dan çıkar
        const { data: inserted, error: productInsertError } = await supabase
          .from("Araclar")
          .insert(insertData)
          .select("id")
          .single();

        if (productInsertError) throw productInsertError;
        if (!inserted || !inserted.id) throw new Error("Yeni ürün ID'si alınamadı.");
        savedProductId = inserted.id;
        setProduct(prev => ({...prev, id: savedProductId})); // state'i yeni ID ile güncelle

      } else { // mode === "edit"
        if (!savedProductId) throw new Error("Düzenlenecek ürün ID'si bulunamadı.");
        const { error: productUpdateError } = await supabase
          .from("Araclar")
          .update(productDataForSave)
          .eq("id", savedProductId);
        if (productUpdateError) throw productUpdateError;
      }

      // Varyasyonları işle (hem create hem edit için benzer mantık)
      if (savedProductId) {
        // Edit modunda, mevcut varyasyonları silip yenilerini eklemek daha basit olabilir (delete-then-insert)
        if (mode === "edit") {
            const { error: deleteError } = await supabase.from("variations").delete().eq("arac_id", savedProductId);
            if (deleteError) console.warn("Eski varyasyonlar silinirken hata (sorun değilse devam edilecek):", deleteError.message);
        }

        if (variations.length > 0) {
          const variationsToSave = variations.map(v => ({
            kilometre: v.kilometre,
            sure: v.sure,
            fiyat: Number(v.fiyat) || 0,
            status: v.status,
            arac_id: savedProductId,
          }));
          const { error: variationsError } = await supabase.from("variations").insert(variationsToSave);
          if (variationsError) throw variationsError;
        }
      }
      toast({ title: "Başarılı", description: `Araç başarıyla ${mode === "create" ? "oluşturuldu" : "güncellendi"}.`});
      if (mode === 'create') {
        // Formu sıfırlama veya yönlendirme burada yapılabilir.
        // Şimdilik sadece ID'yi güncelledik, kullanıcı aynı sayfada kalır.
        // İsterseniz: router.push(`/products/edit/${savedProductId}`);
      }

    } catch (error: any) {
      console.error("Kaydetme sırasında hata:", error);
      toast({ title: "Kaydetme Hatası", description: error.message || "Bilinmeyen bir hata oluştu.", variant: "destructive"});
    } finally {
      setIsSavingInternal(false);
    }
  };
  
  const filteredImageOptions = useMemo(() => {
    if (!imageSearch.trim()) return imageOptions;
    return imageOptions.filter(img => img.name.toLowerCase().includes(imageSearch.toLowerCase()));
  }, [imageOptions, imageSearch]);

  return (
    // Bu bileşen NewProductPage içinde bir Card altında render edilecek,
    // o yüzden burada tekrar Card sarmalayıcı kullanmıyoruz.
    // NewProductPage'deki Card yapısı bu forma genel bir çerçeve sağlar.
    <div className="space-y-8">
      {/* Sayfa Başlığı (NewProductPage'den geliyor) */}
      {/* <h1 className="text-3xl font-bold mb-8" style={{color: corporateColor}}>
        {mode === "create" ? "Yeni Araç Ekle" : `Aracı Düzenle: ${initialData?.isim || ''}`}
      </h1> */}

      <Card>
        <CardHeader>
          <CardTitle>Araç Temel Bilgileri</CardTitle>
          <CardDescription>Aracın marka, model ve teknik özelliklerini girin.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="isim">Araç Adı *</Label>
            <Input id="isim" name="isim" value={product.isim} onChange={(e) => handleProductChange('isim', e.target.value)} required 
                   style={{ "--ring-color": corporateColor } as React.CSSProperties} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stok_kodu">Stok Kodu</Label>
            <Input id="stok_kodu" name="stok_kodu" value={product.stok_kodu} onChange={(e) => handleProductChange('stok_kodu', e.target.value)} 
                   style={{ "--ring-color": corporateColor } as React.CSSProperties} />
          </div>
          
          {[
            { label: "Marka", name: "brand", options: MARKA_OPTIONS, value: product.brand },
            { label: "Segment", name: "segment", options: SEGMENT_OPTIONS, value: product.segment },
            { label: "Gövde Tipi", name: "bodyType", options: BODYTYPE_OPTIONS, value: product.bodyType },
            { label: "Yakıt Türü", name: "yakit_turu", options: YAKIT_OPTIONS, value: product.yakit_turu },
            { label: "Vites", name: "vites", options: VITES_OPTIONS, value: product.vites },
            { label: "Durum", name: "durum", options: DURUM_OPTIONS, value: product.durum },
          ].map(({ label, name, options, value }) => (
            <div key={name} className="space-y-1.5">
              <Label htmlFor={name}>{label}</Label>
              <Select value={value || ""} onValueChange={(val) => handleProductChange(name as keyof Product, val)}>
                <SelectTrigger id={name} style={{ "--ring-color": corporateColor } as React.CSSProperties}>
                  <SelectValue placeholder={`${label} Seçin...`} />
                </SelectTrigger>
                <SelectContent>
                  {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Açıklamalar</CardTitle>
          <CardDescription>Araçla ilgili kısa ve detaylı açıklamaları HTML formatında girin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="kisaAciklama">Kısa Açıklama (HTML Destekler)</Label>
            <Textarea
              id="kisaAciklama"
              className="mt-1.5 min-h-[100px]"
              rows={3}
              value={kisaAciklama}
              onChange={(e) => setKisaAciklama(e.target.value)}
              placeholder="<p><b>Kalın metin</b> gibi HTML etiketleri kullanabilirsiniz.</p>"
              style={{ "--ring-color": corporateColor } as React.CSSProperties}
            />
            {kisaAciklama.trim() && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-600 mb-1">Önizleme:</p>
                <div
                  className="prose prose-sm max-w-none p-3 border rounded-md bg-gray-50 min-h-[60px] break-words"
                  dangerouslySetInnerHTML={{ __html: kisaAciklama }}
                />
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="aciklama">Detaylı Açıklama (HTML Destekler)</Label>
            <Textarea
              id="aciklama"
              className="mt-1.5 min-h-[150px]"
              rows={6}
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              placeholder="Detaylı araç açıklaması, özellikler vb..."
              style={{ "--ring-color": corporateColor } as React.CSSProperties}
            />
            {aciklama.trim() && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-600 mb-1">Önizleme:</p>
                <div
                  className="prose max-w-none p-3 border rounded-md bg-gray-50 min-h-[100px] break-words"
                  dangerouslySetInnerHTML={{ __html: aciklama }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Görseller</CardTitle>
          <CardDescription>Aracın kapak ve galeri görsellerini yönetin.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            <Button type="button" onClick={() => { setShowImageModal(true); setSelectingCover(true); }} style={{backgroundColor: corporateColor}} className="text-white hover:opacity-90">
              <ImageIcon className="w-4 h-4 mr-2" /> Kapak Görseli Seç
            </Button>
            <Button type="button" onClick={() => { setShowImageModal(true); setSelectingCover(false); }} variant="outline">
              <ImageIcon className="w-4 h-4 mr-2" /> Galeri Görsellerini Yönet
            </Button>
          </div>
          {product.cover_image && (
            <div className="mb-4">
              <Label className="block text-sm font-medium text-gray-700 mb-1">Mevcut Kapak Görseli:</Label>
              <div className="relative w-40 h-32 group">
                 <img src={getPublicUrl(product.cover_image)} alt="Kapak Görseli" className="h-full w-full object-cover rounded border p-1" />
                 <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleProductChange('cover_image', '')}>
                    <X className="h-4 w-4"/>
                 </Button>
              </div>
            </div>
          )}
          {galleryFiles.length > 0 && (
            <div className="mt-4">
              <Label className="block text-sm font-medium text-gray-700 mb-2">Galeri Görselleri:</Label>
              <div className="flex gap-3 flex-wrap">
                {galleryFiles.map((img) => (
                  <div key={img} className="relative group w-28 h-28">
                    <img src={getPublicUrl(img)} alt="Galeri Görseli" className="h-full w-full object-cover rounded border p-0.5" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveGalleryImage(img)}
                      className="absolute -top-2 -right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Görseli kaldır"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kiralama Varyasyonları</CardTitle>
          <CardDescription>Farklı kiralama süreleri ve kilometre limitleri için fiyatları belirleyin.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingVariations ? (
             <div className="flex items-center justify-center py-6">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                <p className="ml-2 text-gray-600">Varyasyonlar yükleniyor...</p>
             </div>
          ) : (
            <>
            <div className="hidden md:grid md:grid-cols-[2fr_2fr_1fr_1.5fr_auto] gap-x-4 gap-y-2 items-center border-b pb-2 mb-3 text-sm font-medium text-gray-600">
                <Label>Kilometre Limiti</Label>
                <Label>Süre</Label>
                <Label>Fiyat (₺)</Label>
                <Label>Durum</Label>
                <span className="text-right md:text-left"></span> {/* Sil butonu için başlık boşluğu */}
            </div>
            {variations.map((v, idx) => (
            <div key={v.id} className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1.5fr_auto] gap-x-4 gap-y-3 items-center py-3 border-b md:border-none last:border-none">
                <div className="md:hidden"><Label>Kilometre Limiti</Label></div>
                <Select value={v.kilometre} onValueChange={(val) => handleVariationChange(idx, "kilometre", val)}>
                <SelectTrigger style={{ "--ring-color": corporateColor } as React.CSSProperties}><SelectValue/></SelectTrigger>
                <SelectContent>{KILOMETRE_OPTIONS.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
                </Select>

                <div className="md:hidden mt-2"><Label>Süre</Label></div>
                <Select value={v.sure} onValueChange={(val) => handleVariationChange(idx, "sure", val)}>
                <SelectTrigger style={{ "--ring-color": corporateColor } as React.CSSProperties}><SelectValue/></SelectTrigger>
                <SelectContent>{SURE_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>

                <div className="md:hidden mt-2"><Label>Fiyat (₺)</Label></div>
                <Input type="number" min="0" value={v.fiyat} onChange={(e) => handleVariationChange(idx, "fiyat", e.target.value)} placeholder="0" style={{ "--ring-color": corporateColor } as React.CSSProperties}/>
                
                <div className="md:hidden mt-2"><Label>Durum</Label></div>
                <Select value={v.status} onValueChange={(val) => handleVariationChange(idx, "status", val)}>
                <SelectTrigger style={{ "--ring-color": corporateColor } as React.CSSProperties}><SelectValue/></SelectTrigger>
                <SelectContent>{VARIATION_STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                
                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveVariation(v.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 justify-self-end md:justify-self-center mt-2 md:mt-0" aria-label="Bu varyasyonu sil">
                <Trash2 className="h-5 w-5"/>
                </Button>
            </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddVariation} className="mt-4 flex items-center gap-2 border-dashed hover:border-solid" style={{color: corporateColor, borderColor: corporateColor}}>
            <Plus className="h-5 w-5" /> Yeni Varyasyon Ekle
            </Button>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
        <Button
          type="button"
          onClick={handleActualSave}
          disabled={isSavingInternal || !product.isim.trim()}
          size="lg" // Daha büyük kaydet butonu
          style={{ backgroundColor: isSavingInternal || !product.isim.trim() ? undefined : corporateColor, opacity: isSavingInternal || !product.isim.trim() ? 0.6 : 1 }}
          className={`text-white font-semibold ${isSavingInternal || !product.isim.trim() ? "bg-gray-400 cursor-not-allowed" : `hover:bg-[${corporateColorDarker}]`}`}
        >
          {isSavingInternal && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
          {isSavingInternal ? "Kaydediliyor..." : mode === "create" ? "Aracı Oluştur" : "Değişiklikleri Kaydet"}
        </Button>
      </div>

      {/* Modal Görsel Seçimi (Dialog ile) */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectingCover ? "Kapak Görseli Seç" : "Galeri için Görsel Seç/Kaldır"}</DialogTitle>
          </DialogHeader>
          <div className="relative flex-grow overflow-y-auto pr-2"> {/* pr-2 scrollbar için */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 py-3 z-10 -mx-6 px-6 border-b mb-4"> {/* Input'u sticky yap */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    type="text"
                    value={imageSearch}
                    onChange={(e) => setImageSearch(e.target.value)}
                    className="pl-9 w-full h-10"
                    placeholder="Görsel adı ile ara..."
                    style={{ "--ring-color": corporateColor } as React.CSSProperties}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredImageOptions.map((img) => (
                <button
                  key={img.name}
                  type="button"
                  className={`cursor-pointer p-1.5 border-2 rounded-lg hover:shadow-md transition-all duration-150 flex flex-col items-center justify-center aspect-square focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                    ${(selectingCover && product.cover_image === img.name) || (!selectingCover && galleryFiles.includes(img.name))
                      ? `border-[${corporateColor}] ring-2 ring-[${corporateColor}] ring-offset-1`
                      : `border-gray-200 hover:border-[${corporateColor}] focus-visible:ring-[${corporateColor}]`
                    }`}
                  style={{
                      "--ring-color": corporateColor, // For focus-visible
                      borderColor: (selectingCover && product.cover_image === img.name) || (!selectingCover && galleryFiles.includes(img.name)) ? corporateColor : undefined,
                  } as React.CSSProperties}
                  onClick={() => handleImageSelect(img.name)}
                >
                  <img src={img.url} alt={img.name} className="max-h-20 sm:max-h-24 w-auto object-contain rounded-sm" loading="lazy" />
                  <p className="text-xs text-center truncate mt-1.5 w-full px-1" title={img.name}>{img.name}</p>
                </button>
              ))}
              {filteredImageOptions.length === 0 && (
                <p className="col-span-full text-center text-gray-500 py-8">Aramanızla eşleşen görsel bulunamadı.</p>
              )}
            </div>
          </div>
          <DialogFooter className="mt-auto pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowImageModal(false)}>
                {selectingCover ? 'İptal' : 'Tamam'}
            </Button>
            {/* Kapak seçerken "Seç" butonu eklenebilir veya direkt tıklamayla kapanabilir */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
