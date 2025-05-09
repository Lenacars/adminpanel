"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Editor } from "@tinymce/tinymce-react";
import { PlusIcon, XIcon } from "@heroicons/react/solid";

interface Variation {
  id: string;
  kilometre: string;
  sure: string;
  fiyat: number;
  status: string;
  arac_id?: string; // arac_id eklendi
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
  bodyType: string;
  fiyat: number;
  cover_image: string;
  gallery_images: string[];
}

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

  // 📌 Sayfa yenilenince varyasyonları Supabase'den çek
  useEffect(() => {
    const fetchVariations = async () => {
      const { data, error } = await supabase
        .from("variations")
        .select("*")
        .eq("arac_id", product.id); // Değişiklik: product_id -> arac_id

      if (!error && data) {
        setVariations(data);
      }
    };

    if (product.id) {
      fetchVariations();
    }
  }, [product.id]);

  useEffect(() => {
    const fetchImages = async () => {
      const { data } = await supabase.storage.from("images").list("", {
        sortBy: { column: "name", order: "asc" },
      });
      if (data) setImageOptions(data.map((f) => f.name));
    };
    fetchImages();
  }, []);

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from("images").getPublicUrl(path);
    return data?.publicUrl || "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariationChange = (index: number, field: keyof Variation, value: string) => {
    setVariations((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: field === "fiyat" ? parseFloat(value) || 0 : value };
      return copy;
    });
  };

  const handleAddVariation = () => {
    const id = crypto.randomUUID();
    setVariations((prev) => [
      ...prev,
      { id, kilometre: KILOMETRE_OPTIONS[0], sure: SURE_OPTIONS[0], fiyat: 0, status: "Aktif" },
    ]);
  };

  const handleRemoveGalleryImage = (img: string) => {
    setGalleryFiles((prev) => prev.filter((i) => i !== img));
  };

  const handleImageSelect = (img: string) => {
    if (selectingCover) {
      setProduct((prev) => ({ ...prev, cover_image: img }));
      setShowImageModal(false);
    } else {
      setGalleryFiles((prev) =>
        prev.includes(img) ? prev.filter((i) => i !== img) : [...prev, img]
      );
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const lowestPrice = variations.length > 0 ? Math.min(...variations.filter(v => v.status === "Aktif").map(v => v.fiyat)) : 0;

      if (mode === "create") {
        const { data: inserted } = await supabase.from("Araclar").insert({
          ...product,
          fiyat: lowestPrice,
          kisa_aciklama: kisaAciklama,
          aciklama,
          gallery_images: galleryFiles,
        }).select().single();

        if (inserted && variations.length > 0) {
          const payload = variations.map((v) => ({
            arac_id: inserted.id, // Değişiklik: product_id -> arac_id
            kilometre: v.kilometre,
            sure: v.sure,
            fiyat: v.fiyat,
            status: v.status,
          }));
          await supabase.from("variations").insert(payload);
        }

        alert("Ürün başarıyla eklendi ✅");
      } else {
        await supabase.from("Araclar").update({
          ...product,
          fiyat: lowestPrice,
          kisa_aciklama: kisaAciklama,
          aciklama,
          gallery_images: galleryFiles,
        }).eq("id", product.id);

        // Varyasyonları tamamen sil ve tekrar ekle
        await supabase.from("variations").delete().eq("arac_id", product.id); // Değişiklik: product_id -> arac_id

        if (variations.length > 0) {
          const payload = variations.map((v) => ({
            arac_id: product.id, // Değişiklik: product_id -> arac_id
            kilometre: v.kilometre,
            sure: v.sure,
            fiyat: v.fiyat,
            status: v.status,
          }));
          await supabase.from("variations").insert(payload);
        }

        alert("Ürün başarıyla güncellendi ✅");
      }
    } catch (err) {
      alert("Hata: " + (err as any).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-10 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold">{mode === "create" ? "Yeni Ürün" : "Ürün Düzenle"}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded shadow">
        <div>
          <label>Ürün Adı</label>
          <input name="isim" value={product.isim} onChange={handleInputChange} className="border p-2 rounded w-full" />
          {product.isim === "" && <p className="text-red-500 text-sm mt-1">Ürün Adı boş bırakılamaz.</p>}
        </div>
        <div>
          <label>Stok Kodu</label>
          <input name="stok_kodu" value={product.stok_kodu} onChange={handleInputChange} className="border p-2 rounded w-full" />
        </div>
        {[
          { label: "Yakıt Türü", name: "yakit_turu", options: YAKIT_OPTIONS },
          { label: "Vites", name: "vites", options: VITES_OPTIONS },
          { label: "Marka", name: "brand", options: MARKA_OPTIONS },
          { label: "Segment", name: "segment", options: SEGMENT_OPTIONS },
          { label: "Gövde Tipi", name: "bodyType", options: BODYTYPE_OPTIONS },
          { label: "Durum", name: "durum", options: DURUM_OPTIONS },
        ].map(({ label, name, options }) => (
          <div key={name}>
            <label>{label}</label>
            <select name={name} value={(product as any)[name]} onChange={handleSelectChange} className="border p-2 rounded w-full">
              {options.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded shadow space-y-4">
        <label className="block mb-2">Kısa Açıklama</label>
        <Editor value={kisaAciklama} onEditorChange={setKisaAciklama} init={{ height: 150, menubar: false }} />
        <label className="block mb-2">Detaylı Açıklama</label>
        <Editor value={aciklama} onEditorChange={setAciklama} init={{ height: 300 }} />
      </div>

      <div className="bg-white p-6 rounded shadow">
        <button onClick={() => { setShowImageModal(true); setSelectingCover(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">Kapak Görseli</button>
        <button onClick={() => { setShowImageModal(true); setSelectingCover(false); }} className="bg-blue-500 text-white px-4 py-2 rounded ml-2">Galeri Görseli</button>
        {product.cover_image && <img src={getPublicUrl(product.cover_image)} alt="Kapak Görseli" className="mt-4 h-32 rounded" />}
        <div className="flex gap-4 mt-4 flex-wrap">
          {galleryFiles.map((img) => (
            <div key={img} className="relative">
              <img src={getPublicUrl(img)} alt="Galeri Görseli" className="h-24 rounded" />
              <button onClick={() => handleRemoveGalleryImage(img)} className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full">
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow space-y-4">
        <div className="flex gap-2 font-bold">
          <div className="w-1/4">Kilometre</div>
          <div className="w-1/4">Süre</div>
          <div className="w-1/4">Fiyat</div>
          <div className="w-1/4">Durum</div>
        </div>
        {variations.map((v, idx) => (
          <div key={v.id} className="flex gap-2 items-center">
            <select value={v.kilometre} onChange={(e) => handleVariationChange(idx, "kilometre", e.target.value)} className="border p-2 rounded w-1/4">
              {KILOMETRE_OPTIONS.map(k => <option key={k}>{k}</option>)}
            </select>
            <select value={v.sure} onChange={(e) => handleVariationChange(idx, "sure", e.target.value)} className="border p-2 rounded w-1/4">
              {SURE_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
            <input type="number" value={v.fiyat} onChange={(e) => handleVariationChange(idx, "fiyat", e.target.value)} className="border p-2 rounded w-1/4" />
            <select value={v.status} onChange={(e) => handleVariationChange(idx, "status", e.target.value)} className="border p-2 rounded w-1/4">
              <option>Aktif</option>
              <option>Pasif</option>
            </select>
            {/* Varyasyon silme butonu eklenebilir */}
          </div>
        ))}
        <button onClick={handleAddVariation} className="flex items-center gap-2 text-blue-600 hover:underline">
          <PlusIcon className="h-5 w-5" /> Varyasyon Ekle
        </button>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving || product.isim === ""} // Ürün Adı boşsa disabled yap
          className={`px-6 py-3 rounded shadow transition ${isSaving || product.isim === "" ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"}`}
        >
          {isSaving ? "Kaydediliyor..." : mode === "create" ? "Ürünü Ekle" : "Ürünü Güncelle"}
        </button>
      </div>

      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-6">
          <div className="bg-white p-6 rounded max-h-[80vh] overflow-auto w-full max-w-3xl relative">
            <button onClick={() => setShowImageModal(false)} className="absolute top-2 right-2 text-red-600 hover:text-red-800">
              <XIcon className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold mb-4">Görsel Seç</h2>
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="border w-full p-2 mb-4 rounded" placeholder="Ara..." />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {imageOptions.filter(f => f.toLowerCase().includes(search.toLowerCase())).map((img) => (
                <div key={img} className="cursor-pointer" onClick={() => handleImageSelect(img)}>
                  <img src={getPublicUrl(img)} alt={img} className="h-24 w-full object-cover rounded" />
                  <p className="text-xs text-center truncate">{img}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
