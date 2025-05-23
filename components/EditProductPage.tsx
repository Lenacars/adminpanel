"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PlusIcon, XIcon } from "@heroicons/react/solid";

// Tip tanımları
interface Variation {
  id: string;
  kilometre: string;
  sure: string;
  fiyat: number;
  status: string;
  arac_id?: string;
}

interface Product {
  id: string;
  isim: string;
  aciklama: string;
  kisa_aciklama: string;
  stok_kodu: string;
  segment: string;
  yakit_turu: string;
  vites: string;
  durum: string;
  brand: string;
  category: string;
  fiyat: number;
  bodyType: string;
  cover_image: string;
  gallery_images: string[];
}

// Sabitler
const YAKIT_OPTIONS = ["Benzin", "Benzin + LPG", "Dizel", "Elektrik", "Hibrit"];
const VITES_OPTIONS = ["Manuel", "Otomatik"];
const MARKA_OPTIONS = ["Audi", "BMW", "Citroen", "Dacia", "Fiat", "Ford", "Honda", "Hyundai"]; // Örnek markalar, genişletilebilir
const SEGMENT_OPTIONS = ["Ekonomik", "Orta", "Ticari", "SUV", "Premium"];
const BODYTYPE_OPTIONS = ["Hatchback", "Sedan", "SUV", "Pickup", "Minivan"];
const DURUM_OPTIONS = ["Sıfır", "İkinci El"];
const KILOMETRE_OPTIONS = ["1.000 KM/Ay", "2.000 KM/Ay", "10.000 KM/Yıl", "15.000 KM/Yıl", "Sınırsız"]; // Örnekler
const SURE_OPTIONS = ["3 Ay", "6 Ay", "12 Ay", "24 Ay", "36 Ay"]; // Örnekler

export default function EditProductPage({
  initialData,
  variations: initialVariations,
  mode = "edit",
}: {
  initialData: Product;
  variations: Variation[];
  mode?: "edit" | "create";
}) {
  const [product, setProduct] = useState<Product>(initialData);
  const [kisaAciklama, setKisaAciklama] = useState(initialData.kisa_aciklama || "");
  const [aciklama, setAciklama] = useState(initialData.aciklama || "");
  const [galleryFiles, setGalleryFiles] = useState<string[]>(initialData.gallery_images || []);
  const [variations, setVariations] = useState<Variation[]>(initialVariations || []);
  const [imageOptions, setImageOptions] = useState<string[]>([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectingCover, setSelectingCover] = useState(true);
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchVariations = async () => {
      if (product.id) {
        // GÖRSELDEKİ İSTEĞE GÖRE GÜNCELLENEN KISIM: Belirli alanlar seçiliyor.
        const { data, error } = await supabase
          .from("variations")
          .select("id, kilometre, sure, fiyat, status, arac_id") // Tüm alanlar (*) yerine belirli alanlar seçildi.
          .eq("arac_id", product.id);

        if (error) {
          console.error("Error fetching variations:", error);
          // toast({ title: "Hata", description: "Varyasyonlar getirilirken bir sorun oluştu.", variant: "destructive" });
        } else if (data) {
          setVariations(data);
        }
      }
    };

    if (mode === "edit" && product.id) {
      fetchVariations();
    } else if (mode === "create") {
      // Oluşturma modunda, prop'tan gelen başlangıç varyasyonlarını kullan (genellikle boş bir dizi olur)
      setVariations(initialVariations || []);
    }
  }, [product.id, mode, initialVariations]);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase.storage.from("images").list("", { limit: 200 }); // Örnek: limiti artırabilirsiniz.
      if (error) {
        console.error("Error fetching images from storage:", error);
      } else if (data) {
        setImageOptions(data.map(f => f.name));
      }
    };
    fetchImages();
  }, []);

  const getPublicUrl = (path: string) => {
    if (!path) return "/placeholder.svg"; // Eğer path yoksa placeholder göster
    const { data } = supabase.storage.from("images").getPublicUrl(path);
    return data?.publicUrl || "/placeholder.svg";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { // TextArea için de geçerli
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleVariationChange = (index: number, field: keyof Variation, value: string | number) => {
    setVariations(prev => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], [field]: field === "fiyat" ? parseFloat(value as string) || 0 : value };
      }
      return copy;
    });
  };

  const handleAddVariation = () => {
    const newId = crypto.randomUUID();
    setVariations(prev => [...prev, {
      id: newId, // Client-side üretilen ID, Supabase tarafında override edilebilir veya PK olarak kullanılabilir.
      kilometre: KILOMETRE_OPTIONS[0],
      sure: SURE_OPTIONS[0],
      fiyat: 0,
      status: "Aktif",
      arac_id: product.id // Yeni varyasyonun hangi araca ait olduğunu belirt
    }]);
  };

  const handleRemoveGalleryImage = (imgToRemove: string) => {
    setGalleryFiles(prev => prev.filter(img => img !== imgToRemove));
  };

  const handleImageSelect = (imgName: string) => {
    if (selectingCover) {
      setProduct(prev => ({ ...prev, cover_image: imgName }));
      setShowImageModal(false); // Kapak resmi seçilince modalı kapat
    } else {
      // Galeri için çoklu seçim: seçiliyse kaldır, değilse ekle
      setGalleryFiles(prev =>
        prev.includes(imgName) ? prev.filter(i => i !== imgName) : [...prev, imgName]
      );
      // Galeri için seçim yaparken modal açık kalabilir veya "Tamam" butonu eklenebilir.
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const activeVariations = variations.filter(v => v.status === "Aktif" && v.fiyat > 0);
      const lowestPrice = activeVariations.length > 0
        ? Math.min(...activeVariations.map(v => v.fiyat))
        : product.fiyat || 0; // Eğer aktif varyasyon yoksa ürünün ana fiyatını kullan

      const productDataForSave = {
        ...product,
        isim: product.isim.trim(), // İsim alanındaki boşlukları temizle
        kisa_aciklama: kisaAciklama.trim(),
        aciklama: aciklama.trim(),
        gallery_images: galleryFiles,
        fiyat: lowestPrice, // En düşük aktif varyasyon fiyatını ana fiyat olarak ayarla
      };

      let savedProductId = product.id;

      if (mode === "create") {
        const { id, ...insertData } = productDataForSave; // 'id' alanı insert sırasında gönderilmemeli
        const { data: inserted, error: productInsertError } = await supabase
          .from("Araclar")
          .insert(insertData)
          .select("id") // Sadece ID'yi geri al
          .single();

        if (productInsertError) throw productInsertError;
        if (!inserted || !inserted.id) throw new Error("Yeni ürün ID'si alınamadı.");
        savedProductId = inserted.id;
        // Yeni oluşturulan ürünün ID'sini state'e yansıt ki varyasyonlar doğru ID ile kaydedilsin
        setProduct(prev => ({...prev, id: savedProductId})); 

      } else { // mode === "edit"
        const { error: productUpdateError } = await supabase
          .from("Araclar")
          .update(productDataForSave)
          .eq("id", product.id);
        if (productUpdateError) throw productUpdateError;
      }

      // Varyasyonları kaydet/güncelle (hem create hem edit modu için geçerli)
      if (savedProductId) {
        // Önce mevcut ürünle ilişkili tüm eski varyasyonları sil (edit modunda)
        // Create modunda bu adım atlanabilir veya product.id yerine savedProductId ile kontrol edilebilir.
        if (mode === "edit") {
            const { error: deleteError } = await supabase.from("variations").delete().eq("arac_id", savedProductId);
            if (deleteError) console.warn("Eski varyasyonlar silinirken hata ( नजरअंदाज किया जा सकता है):", deleteError.message);
        }

        if (variations.length > 0) {
          const variationsToSave = variations.map(v => {
            const { id, ...restOfVariation } = v; // Client-side ID'yi ayır
            return {
              ...restOfVariation,
              arac_id: savedProductId, // Ürünün ID'si ile ilişkilendir
              fiyat: Number(restOfVariation.fiyat) || 0, // Fiyatın sayı olduğundan emin ol
            };
          });
          const { error: variationsError } = await supabase.from("variations").insert(variationsToSave);
          if (variationsError) throw variationsError;
        }
      }
      alert(`Ürün başarıyla ${mode === "create" ? "eklendi" : "güncellendi"} ✅`);
      // Yönlendirme veya formu sıfırlama işlemleri burada yapılabilir.
      // Örneğin: router.push('/dashboard/products');

    } catch (error: any) {
      console.error("Kaydetme sırasında hata:", error);
      alert("Hata: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const pageContent = (
    <div className="p-6 space-y-10 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">{mode === "create" ? "Yeni Ürün Ekle" : `Ürünü Düzenle: ${initialData.isim || ''}`}</h1>

      {/* Ürün Bilgileri */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label htmlFor="isim" className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı *</label>
          <input id="isim" name="isim" value={product.isim} onChange={handleInputChange} className="mt-1 border p-2 rounded w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required />
        </div>
        <div>
          <label htmlFor="stok_kodu" className="block text-sm font-medium text-gray-700 mb-1">Stok Kodu</label>
          <input id="stok_kodu" name="stok_kodu" value={product.stok_kodu} onChange={handleInputChange} className="mt-1 border p-2 rounded w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        {[{ label: "Yakıt Türü", name: "yakit_turu", options: YAKIT_OPTIONS },
          { label: "Vites", name: "vites", options: VITES_OPTIONS },
          { label: "Marka", name: "brand", options: MARKA_OPTIONS },
          { label: "Segment", name: "segment", options: SEGMENT_OPTIONS },
          { label: "Gövde Tipi", name: "bodyType", options: BODYTYPE_OPTIONS },
          { label: "Durum", name: "durum", options: DURUM_OPTIONS }].map(({ label, name, options }) => (
          <div key={name}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select id={name} name={name} value={(product as any)[name] || ""} onChange={handleSelectChange} className="mt-1 border p-2 rounded w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
              <option value="" disabled>{label} Seçin...</option>
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Açıklamalar */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label htmlFor="kisaAciklama" className="block text-sm font-medium text-gray-700 mb-1">Kısa Açıklama</label>
          <textarea id="kisaAciklama" name="kisa_aciklama" className="mt-1 w-full border p-2 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500" rows={3} value={kisaAciklama} onChange={(e) => setKisaAciklama(e.target.value)} />
        </div>
        <div>
          <label htmlFor="aciklama" className="block text-sm font-medium text-gray-700 mb-1">Detaylı Açıklama (HTML destekler)</label>
          <textarea id="aciklama" name="aciklama" className="mt-1 w-full border p-2 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500" rows={6} value={aciklama} onChange={(e) => setAciklama(e.target.value)} />
        </div>
      </div>

      {/* Görsel Seçimi */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Görseller</h2>
        <div className="flex space-x-3 mb-4">
            <button type="button" onClick={() => { setShowImageModal(true); setSelectingCover(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-150">Kapak Görseli Seç</button>
            <button type="button" onClick={() => { setShowImageModal(true); setSelectingCover(false); }} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-150">Galeri Görsellerini Yönet</button>
        </div>
        {product.cover_image && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Mevcut Kapak Görseli:</p>
            <img
              src={getPublicUrl(product.cover_image)}
              alt="Kapak Görseli"
              className="mt-1 h-32 w-auto rounded border p-1"
            />
          </div>
        )}
        {galleryFiles.length > 0 && (
            <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Galeri Görselleri:</p>
                <div className="flex gap-4 flex-wrap">
                {galleryFiles.map((img) => (
                  <div key={img} className="relative group">
                    <img src={getPublicUrl(img)} alt="Galeri Görseli" className="h-24 w-24 object-cover rounded border p-0.5" />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(img)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                      aria-label="Görseli kaldır"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
        )}
      </div>

      {/* Varyasyonlar */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Kiralama Varyasyonları</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-x-3 gap-y-2 items-center border-b pb-2 mb-3 text-sm font-medium text-gray-600">
          <span>Kilometre Limiti</span>
          <span>Süre</span>
          <span>Fiyat (₺)</span>
          <span>Durum</span>
          <span className="text-right md:text-left">Sil</span>
        </div>
        {variations.map((v, idx) => (
          <div key={v.id || `new-${idx}`} className="grid grid-cols-2 md:grid-cols-5 gap-x-3 gap-y-2 items-center py-1">
            <select
              value={v.kilometre}
              onChange={(e) => handleVariationChange(idx, "kilometre", e.target.value)}
              className="border p-2 rounded w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              {KILOMETRE_OPTIONS.map((k) => (<option key={k} value={k}>{k}</option>))}
            </select>
            <select
              value={v.sure}
              onChange={(e) => handleVariationChange(idx, "sure", e.target.value)}
              className="border p-2 rounded w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              {SURE_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
            <input
              type="number"
              min="0"
              value={v.fiyat}
              onChange={(e) => handleVariationChange(idx, "fiyat", e.target.value)}
              className="border p-2 rounded w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="0"
            />
            <select
              value={v.status}
              onChange={(e) => handleVariationChange(idx, "status", e.target.value)}
              className="border p-2 rounded w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Aktif">Aktif</option>
              <option value="Pasif">Pasif</option>
            </select>
            <button
              type="button"
              onClick={() => setVariations(prev => prev.filter((_, i) => i !== idx))}
              className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition duration-150 justify-self-end md:justify-self-start"
              aria-label="Bu varyasyonu sil"
            >
              <XIcon className="h-5 w-5"/>
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddVariation}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 py-2 px-3 border border-indigo-500 rounded-md hover:bg-indigo-50 transition duration-150 mt-3"
        >
          <PlusIcon className="h-5 w-5" /> Yeni Varyasyon Ekle
        </button>
      </div>

      {/* Kaydet Butonu */}
      <div className="flex justify-end mt-8 pt-6 border-t">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !product.isim.trim()}
          className={`px-8 py-3 rounded-md shadow-sm transition text-white font-semibold text-base ${
            isSaving || !product.isim.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          }`}
        >
          {isSaving ? "Kaydediliyor..." : mode === "create" ? "Ürünü Oluştur" : "Değişiklikleri Kaydet"}
        </button>
      </div>

      {/* Modal Görsel Seçimi */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-5 sm:p-6 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto w-full max-w-3xl relative">
            <div className="flex justify-between items-center mb-4 pb-3 border-b">
                <h2 className="text-xl font-semibold text-gray-800">{selectingCover ? "Kapak Görseli Seç" : "Galeri için Görsel Seç/Kaldır"}</h2>
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Kapat"
                >
                  <XIcon className="w-6 h-6" />
                </button>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 w-full p-2 mb-5 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Görsel adı ile ara..."
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {imageOptions
                .filter((f) => f.toLowerCase().includes(search.toLowerCase()))
                .map((img) => (
                  <div
                    key={img}
                    className={`cursor-pointer p-1.5 border-2 rounded-lg hover:shadow-md transition-all duration-150 flex flex-col items-center justify-center aspect-square ${
                        (selectingCover && product.cover_image === img) || (!selectingCover && galleryFiles.includes(img))
                        ? 'border-indigo-600 ring-2 ring-indigo-400'
                        : 'border-gray-200 hover:border-indigo-400'
                    }`}
                    onClick={() => handleImageSelect(img)}
                  >
                    <img
                      src={getPublicUrl(img)}
                      alt={img}
                      className="max-h-20 sm:max-h-24 w-auto object-contain rounded-sm"
                      loading="lazy"
                    />
                    <p className="text-xs text-center truncate mt-1.5 w-full px-1" title={img}>{img}</p>
                  </div>
                ))}
                 {imageOptions.filter((f) => f.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                    <p className="col-span-full text-center text-gray-500 py-8">Aramanızla eşleşen görsel bulunamadı.</p>
                )}
            </div>
            <div className="mt-6 pt-4 border-t flex justify-end">
                <button
                    type="button"
                    onClick={() => setShowImageModal(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-5 py-2.5 rounded-md shadow-sm transition duration-150"
                >
                    {selectingCover ? 'İptal' : 'Tamam'}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return pageContent;
}
