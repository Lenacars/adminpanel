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
const MARKA_OPTIONS = ["Audi", "BMW", "Citroen", "Dacia", "Fiat", "Ford", "Honda", "Hyundai"];
const SEGMENT_OPTIONS = ["Ekonomik", "Orta", "Ticari", "SUV", "Premium"];
const BODYTYPE_OPTIONS = ["Hatchback", "Sedan", "SUV", "Pickup", "Minivan"];
const DURUM_OPTIONS = ["Sıfır", "İkinci El"];
const KILOMETRE_OPTIONS = ["1.000 KM/Ay", "2.000 KM/Ay", "10.000 KM/Yıl", "15.000 KM/Yıl"];
const SURE_OPTIONS = ["3 Ay", "6 Ay", "12 Ay", "24 Ay"];

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
      if (product.id) { // Ensure product.id exists before fetching
        const { data } = await supabase.from("variations").select("*").eq("arac_id", product.id);
        if (data) setVariations(data);
      }
    };
    if (mode === "edit" && product.id) { // Fetch only in edit mode and if id exists
      fetchVariations();
    } else if (mode === "create") { // For create mode, use initialVariations (which should be empty or default)
      setVariations(initialVariations || []);
    }
  }, [product.id, mode, initialVariations]); // Added mode and initialVariations to dependency array

  useEffect(() => {
    const fetchImages = async () => {
      const { data } = await supabase.storage.from("images").list("");
      if (data) setImageOptions(data.map(f => f.name));
    };
    fetchImages();
  }, []);

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from("images").getPublicUrl(path);
    return data?.publicUrl || "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleVariationChange = (index: number, field: keyof Variation, value: string | number) => { // Value can be number for fiyat
    setVariations(prev => {
      const copy = [...prev];
      // Ensure copy[index] exists
      if (copy[index]) {
        copy[index] = { ...copy[index], [field]: field === "fiyat" ? parseFloat(value as string) || 0 : value };
      }
      return copy;
    });
  };

  const handleAddVariation = () => {
    const newId = crypto.randomUUID(); // crypto.randomUUID() is generally fine in client components
    setVariations(prev => [...prev, {
      id: newId,
      kilometre: KILOMETRE_OPTIONS[0],
      sure: SURE_OPTIONS[0],
      fiyat: 0,
      status: "Aktif",
    }]);
  };

  const handleRemoveGalleryImage = (img: string) => {
    setGalleryFiles(prev => prev.filter(i => i !== img));
  };

  const handleImageSelect = (img: string) => {
    if (selectingCover) {
      setProduct(prev => ({ ...prev, cover_image: img }));
      setShowImageModal(false);
    } else {
      setGalleryFiles(prev =>
        prev.includes(img) ? prev.filter(i => i !== img) : [...prev, img]
      );
      // Keep modal open for gallery selection if desired, or close:
      // setShowImageModal(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const activeVariations = variations.filter(v => v.status === "Aktif");
      const lowestPrice = activeVariations.length > 0
        ? Math.min(...activeVariations.map(v => v.fiyat))
        : product.fiyat || 0; // Fallback to product's base price or 0 if no active variations

      const productPayload = {
        ...product,
        fiyat: lowestPrice,
        kisa_aciklama: kisaAciklama,
        aciklama,
        gallery_images: galleryFiles,
      };
      // Remove id from payload for insert
      if (mode === "create") {
        const { id, ...insertPayload } = productPayload;
        const { data: insertedProduct, error: insertError } = await supabase
          .from("Araclar")
          .insert(insertPayload)
          .select()
          .single();

        if (insertError) throw insertError;

        if (insertedProduct && variations.length > 0) {
          const variationPayload = variations.map(v => ({
            ...v, // spread existing variation fields
            arac_id: insertedProduct.id,
            id: undefined, // Let Supabase generate variation id
          }));
          const { error: variationError } = await supabase.from("variations").insert(variationPayload);
          if (variationError) throw variationError;
        }
        alert("Ürün başarıyla eklendi ✅");
      } else { // mode === "edit"
        const { error: updateError } = await supabase
          .from("Araclar")
          .update(productPayload)
          .eq("id", product.id);

        if (updateError) throw updateError;

        // Delete old variations and insert new ones
        const { error: deleteError } = await supabase.from("variations").delete().eq("arac_id", product.id);
        if (deleteError) console.error("Error deleting old variations:", deleteError.message); // Log error but continue

        if (variations.length > 0) {
          const variationPayload = variations.map(v => ({
            ...v,
            arac_id: product.id,
            id: undefined, // Let Supabase generate variation id if it's new, or handle existing if needed
          }));
          const { error: variationError } = await supabase.from("variations").upsert(variationPayload, { onConflict: 'id' }); // Use upsert
          if (variationError) throw variationError;
        }
        alert("Ürün başarıyla güncellendi ✅");
      }
    } catch (error: any) {
      console.error("Save error:", error);
      alert("Hata: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // JSX içeriğini bir değişkene alıyoruz
  const pageContent = (
    <div className="p-6 space-y-10 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold">{mode === "create" ? "Yeni Ürün" : "Ürün Düzenle"}</h1>

      {/* Ürün Bilgileri */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded shadow">
        <div>
          <label htmlFor="isim" className="block text-sm font-medium text-gray-700">Ürün Adı</label>
          <input id="isim" name="isim" value={product.isim} onChange={handleInputChange} className="mt-1 border p-2 rounded w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label htmlFor="stok_kodu" className="block text-sm font-medium text-gray-700">Stok Kodu</label>
          <input id="stok_kodu" name="stok_kodu" value={product.stok_kodu} onChange={handleInputChange} className="mt-1 border p-2 rounded w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        {[{ label: "Yakıt Türü", name: "yakit_turu", options: YAKIT_OPTIONS },
          { label: "Vites", name: "vites", options: VITES_OPTIONS },
          { label: "Marka", name: "brand", options: MARKA_OPTIONS },
          { label: "Segment", name: "segment", options: SEGMENT_OPTIONS },
          { label: "Gövde Tipi", name: "bodyType", options: BODYTYPE_OPTIONS },
          { label: "Durum", name: "durum", options: DURUM_OPTIONS }].map(({ label, name, options }) => (
          <div key={name}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
            <select id={name} name={name} value={(product as any)[name] || ""} onChange={handleSelectChange} className="mt-1 border p-2 rounded w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
              <option value="" disabled>{label} Seçin</option>
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Açıklamalar */}
      <div className="bg-white p-6 rounded shadow space-y-4">
        <div>
          <label htmlFor="kisaAciklama" className="block text-sm font-medium text-gray-700">Kısa Açıklama</label>
          <textarea id="kisaAciklama" className="mt-1 w-full border p-2 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500" rows={4} value={kisaAciklama} onChange={(e) => setKisaAciklama(e.target.value)} />
        </div>
        <div>
          <label htmlFor="aciklama" className="block text-sm font-medium text-gray-700">Detaylı Açıklama</label>
          <textarea id="aciklama" className="mt-1 w-full border p-2 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500" rows={8} value={aciklama} onChange={(e) => setAciklama(e.target.value)} />
        </div>
      </div>

      {/* Görsel Seçimi */}
      <div className="bg-white p-6 rounded shadow">
        <div className="flex space-x-2 mb-4">
            <button type="button" onClick={() => { setShowImageModal(true); setSelectingCover(true); }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Kapak Görseli Seç</button>
            <button type="button" onClick={() => { setShowImageModal(true); setSelectingCover(false); }} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Galeri Görseli Ekle/Kaldır</button>
        </div>
        {product.cover_image && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Kapak Görseli:</p>
            <img
              src={getPublicUrl(product.cover_image)}
              alt="Kapak Görseli"
              className="mt-1 h-32 rounded border"
            />
          </div>
        )}
        {galleryFiles.length > 0 && (
            <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Galeri:</p>
                <div className="flex gap-4 flex-wrap">
                {galleryFiles.map((img) => (
                  <div key={img} className="relative">
                    <img src={getPublicUrl(img)} alt="Galeri Görseli" className="h-24 w-24 object-cover rounded border" />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(img)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
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
      <div className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Varyasyonlar</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 font-medium text-sm text-gray-600 border-b pb-2 mb-2">
          <div className="md:col-span-1">Kilometre</div>
          <div className="md:col-span-1">Süre</div>
          <div className="md:col-span-1">Fiyat (₺)</div>
          <div className="md:col-span-1">Durum</div>
          <div className="md:col-span-1">İşlem</div> {/* Silme butonu için */}
        </div>
        {variations.map((v, idx) => (
          <div key={v.id || idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
            <select
              value={v.kilometre}
              onChange={(e) => handleVariationChange(idx, "kilometre", e.target.value)}
              className="border p-2 rounded w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 md:col-span-1"
            >
              {KILOMETRE_OPTIONS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <select
              value={v.sure}
              onChange={(e) => handleVariationChange(idx, "sure", e.target.value)}
              className="border p-2 rounded w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 md:col-span-1"
            >
              {SURE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input
              type="number"
              value={v.fiyat}
              onChange={(e) => handleVariationChange(idx, "fiyat", e.target.value)}
              className="border p-2 rounded w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 md:col-span-1"
              placeholder="Fiyat"
            />
            <select
              value={v.status}
              onChange={(e) => handleVariationChange(idx, "status", e.target.value)}
              className="border p-2 rounded w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 md:col-span-1"
            >
              <option value="Aktif">Aktif</option>
              <option value="Pasif">Pasif</option>
            </select>
            <button 
              type="button"
              onClick={() => setVariations(prev => prev.filter((_, i) => i !== idx))}
              className="text-red-500 hover:text-red-700 md:col-span-1 justify-self-start"
              aria-label="Varyasyonu sil"
            >
              <XIcon className="h-5 w-5"/>
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddVariation}
          className="flex items-center gap-2 text-blue-600 hover:underline hover:text-blue-800 py-2 px-3 border border-blue-600 rounded hover:bg-blue-50 transition duration-150"
        >
          <PlusIcon className="h-5 w-5" /> Varyasyon Ekle
        </button>
      </div>

      {/* Kaydet Butonu */}
      <div className="flex justify-end mt-8">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !product.isim.trim()}
          className={`px-6 py-3 rounded shadow transition text-white font-semibold ${
            isSaving || !product.isim.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isSaving ? "Kaydediliyor..." : mode === "create" ? "Ürünü Ekle" : "Ürünü Güncelle"}
        </button>
      </div>

      {/* Modal Görsel Seçimi */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto w-full max-w-3xl relative">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">{selectingCover ? "Kapak Görseli Seç" : "Galeri için Görsel Seç"}</h2>
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Kapat"
                >
                  <XIcon className="w-6 h-6" />
                </button>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border w-full p-2 mb-4 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Görsel adı ile ara..."
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {imageOptions
                .filter((f) => f.toLowerCase().includes(search.toLowerCase()))
                .map((img) => (
                  <div
                    key={img}
                    className={`cursor-pointer p-1 border-2 rounded-md hover:border-blue-500 transition-colors ${
                        (selectingCover && product.cover_image === img) || (!selectingCover && galleryFiles.includes(img))
                        ? 'border-blue-600 ring-2 ring-blue-500'
                        : 'border-gray-200'
                    }`}
                    onClick={() => handleImageSelect(img)}
                  >
                    <img
                      src={getPublicUrl(img)}
                      alt={img}
                      className="h-24 w-full object-cover rounded"
                      loading="lazy"
                    />
                    <p className="text-xs text-center truncate mt-1" title={img}>{img}</p>
                  </div>
                ))}
                 {imageOptions.filter((f) => f.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                    <p className="col-span-full text-center text-gray-500">Aramanızla eşleşen görsel bulunamadı.</p>
                )}
            </div>
            {!selectingCover && (
                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={() => setShowImageModal(false)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-md shadow-sm"
                    >
                        Tamam
                    </button>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return pageContent;
}
