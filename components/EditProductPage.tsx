// components/EditProductPage.tsx
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Variation {
  id: string;
  kilometre: string;
  sure: string;
  fiyat: number;
  status: string;
}

interface Product {
  id: string;
  isim: string;
  aciklama: string;
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
  variations: Variation[];
}

const YAKIT_OPTIONS = ["Benzin", "Benzin + LPG", "Dizel", "Elektrik", "Hibrit"];
const VITES_OPTIONS = ["Manuel", "Otomatik"];
const MARKA_OPTIONS = [
  "Alfa Romeo", "Audi", "BMW", "BYD", "Chery", "Citroen", "Cupra", "Dacia", "Fiat",
  "Ford", "Honda", "Hyundai", "Jeep", "Kia", "Mercedes-Benz", "MG", "Nissan", "Opel",
  "Peugeot", "Renault", "Seat", "Skoda", "Tesla", "Toyota", "Volkswagen", "Volvo"
];
const SEGMENT_OPTIONS = ["Ekonomik", "Lux", "M Sınıfı", "Orta", "Orta + Üst", "Ticari"];
const BODYTYPE_OPTIONS = [
  "Camlı Van", "4 Kapı", "Crossover", "Hatchback", "Minivan", "Pickup", "Sedan", "Stationwagon", "SUV"
];
const DURUM_OPTIONS = ["Sıfır", "İkinci El"];
const KILOMETRE_OPTIONS = [
  "1.000 Kilometre / Ay", "2.000 Kilometre / Ay", "3.000 Kilometre / Ay", "4.000 Kilometre / Ay",
  "10.000 Kilometre / Yıl", "15.000 Kilometre / Yıl", "20.000 Kilometre / Yıl", "25.000 Kilometre / Yıl",
  "30.000 Kilometre / Yıl", "35.000 Kilometre / Yıl", "40.000 Kilometre / Yıl", "45.000 Kilometre / Yıl",
  "50.000 Kilometre / Yıl"
];
const SURE_OPTIONS = [
  "1-3 Ay", "3 Ay", "6 Ay", "9 Ay", "12 Ay", "12+12 Ay", "18 Ay", "24 Ay", "36 Ay", "48 Ay"
];

export default function EditProductPage({ initialData }: { initialData: Product }) {
  const [product, setProduct] = useState<Product>(initialData);
  const [variations, setVariations] = useState<Variation[]>(initialData.variations);
  const [imageOptions, setImageOptions] = useState<string[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<string[]>(product.gallery_images);
  const [search, setSearch] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectingCover, setSelectingCover] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      let allImageNames: string[] = [];
      let page = 0;
      let finished = false;
      while (!finished) {
        const { data, error } = await supabase.storage.from("images").list("", {
          limit: 100,
          offset: page * 100,
          sortBy: { column: "name", order: "asc" },
        });
        if (error || !data?.length) {
          finished = true;
        } else {
          allImageNames = [...allImageNames, ...data.map((img) => img.name)];
          page++;
        }
      }
      setImageOptions(allImageNames);
    };
    fetchImages();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleVariationChange = (index: number, field: keyof Variation, value: string) => {
    setVariations((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: field === "fiyat" ? parseFloat(value) : value,
      };
      return updated;
    });
  };

  const handleAddVariation = () => {
    setVariations(prev => [
      ...prev,
      { id: crypto.randomUUID(), kilometre: "", sure: "", fiyat: 0, status: "Aktif" }
    ]);
  };

  const handleSave = async () => {
    const { error } = await supabase.from("Araclar").update({
      ...product,
      gallery_images: galleryFiles,
    }).eq("id", product.id);

    if (error) return alert("Ürün güncellenemedi");

    for (const variation of variations) {
      await supabase.from("variations").upsert({ ...variation, arac_id: product.id });
    }
    alert("Güncelleme tamamlandı");
  };

  const filteredImages = imageOptions.filter((img) => img.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Ürün Düzenle</h1>
      <div className="grid grid-cols-2 gap-4">
        <input className="input" name="isim" placeholder="Ürün Adı" value={product.isim} onChange={handleInputChange} />
        <input className="input" name="stok_kodu" placeholder="Stok Kodu" value={product.stok_kodu} onChange={handleInputChange} />
        <textarea className="input col-span-2" name="aciklama" placeholder="Açıklama" value={product.aciklama} onChange={handleInputChange} />
        <select className="input" name="yakit_turu" value={product.yakit_turu} onChange={handleSelectChange}>{YAKIT_OPTIONS.map(o => <option key={o}>{o}</option>)}</select>
        <select className="input" name="vites" value={product.vites} onChange={handleSelectChange}>{VITES_OPTIONS.map(o => <option key={o}>{o}</option>)}</select>
        <select className="input" name="brand" value={product.brand} onChange={handleSelectChange}>{MARKA_OPTIONS.map(o => <option key={o}>{o}</option>)}</select>
        <select className="input" name="segment" value={product.segment} onChange={handleSelectChange}>{SEGMENT_OPTIONS.map(o => <option key={o}>{o}</option>)}</select>
        <select className="input" name="bodyType" value={product.bodyType} onChange={handleSelectChange}>{BODYTYPE_OPTIONS.map(o => <option key={o}>{o}</option>)}</select>
        <select className="input" name="durum" value={product.durum} onChange={handleSelectChange}>{DURUM_OPTIONS.map(o => <option key={o}>{o}</option>)}</select>
      </div>

      <button onClick={() => { setShowImageModal(true); setSelectingCover(true); }} className="bg-gray-200 text-sm px-4 py-1 rounded">
        Kapak Görseli Seç
      </button>

      {product.cover_image && (
        <div className="my-2">
          <img src={`https://uxnpmdeizkzvnevpceiw.supabase.co/storage/v1/object/public/images/${product.cover_image}`} className="h-40 rounded border object-cover" alt="Kapak" />
        </div>
      )}

      <button onClick={() => { setShowImageModal(true); setSelectingCover(false); }} className="bg-gray-200 text-sm px-4 py-1 rounded">
        Galeri Görselleri Seç
      </button>

      <div className="flex flex-wrap gap-2 my-2">
        {galleryFiles.map((img) => (
          <img key={img} src={`https://uxnpmdeizkzvnevpceiw.supabase.co/storage/v1/object/public/images/${img}`} className="h-20 w-32 object-cover border rounded" alt={img} />
        ))}
      </div>

      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-4 max-w-3xl w-full rounded shadow overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">Görsel Seç</h2>
              <button onClick={() => setShowImageModal(false)}>Kapat</button>
            </div>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="w-full p-2 border mb-2" placeholder="Görsel ara..." />
            <div className="grid grid-cols-3 gap-2">
              {filteredImages.map(img => (
                <div key={img} onClick={() => {
                  if (selectingCover) {
                    setProduct(prev => ({ ...prev, cover_image: img }));
                  } else {
                    setGalleryFiles(prev => prev.includes(img) ? prev.filter(i => i !== img) : [...prev, img]);
                  }
                  setShowImageModal(false);
                }} className={`cursor-pointer border p-1 ${product.cover_image === img || galleryFiles.includes(img) ? 'border-blue-500' : 'border-gray-300'}`}>
                  <img src={`https://uxnpmdeizkzvnevpceiw.supabase.co/storage/v1/object/public/images/${img}`} className="h-20 w-full object-cover" alt={img} />
                  <p className="text-xs truncate text-center">{img}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold mt-6">Varyasyonlar</h2>
      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Kilometre</th>
            <th className="p-2 border">Süre</th>
            <th className="p-2 border">Fiyat</th>
            <th className="p-2 border">Durum</th>
            <th className="p-2 border">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {variations.map((v, i) => (
            <tr key={v.id}>
              <td className="border p-2">
                <select value={v.kilometre} onChange={e => handleVariationChange(i, "kilometre", e.target.value)} className="w-full">
                  {KILOMETRE_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </td>
              <td className="border p-2">
                <select value={v.sure} onChange={e => handleVariationChange(i, "sure", e.target.value)} className="w-full">
                  {SURE_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </td>
              <td className="border p-2">
                <input type="number" value={v.fiyat} onChange={e => handleVariationChange(i, "fiyat", e.target.value)} className="w-full" />
              </td>
              <td className="border p-2">
                <select value={v.status} onChange={e => handleVariationChange(i, "status", e.target.value)} className="w-full">
                  <option value="Aktif">Aktif</option>
                  <option value="Pasif">Pasif</option>
                </select>
              </td>
              <td className="border p-2 text-center">
                <button onClick={() => setVariations(prev => prev.filter((_, idx) => idx !== i))} className="text-red-600">Sil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handleAddVariation} className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
        + Varyasyon Ekle
      </button>
      <button onClick={handleSave} className="ml-4 px-6 py-2 bg-blue-600 text-white rounded">
        Ürünü Kaydet
      </button>
    </div>
  );
}