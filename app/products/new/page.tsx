"use client";

import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";

const KILOMETRE_OPTIONS = [
  "1.000 Kilometre / Ay", "2.000 Kilometre / Ay", "3.000 Kilometre / Ay", "4.000 Kilometre / Ay",
  "10.000 Kilometre / Yıl", "15.000 Kilometre / Yıl", "20.000 Kilometre / Yıl", "25.000 Kilometre / Yıl",
  "30.000 Kilometre / Yıl", "35.000 Kilometre / Yıl", "40.000 Kilometre / Yıl", "45.000 Kilometre / Yıl",
  "50.000 Kilometre / Yıl"
];

const SURE_OPTIONS = [
  "1-3 Ay", "3 Ay", "6 Ay", "9 Ay", "12 Ay", "12+12 Ay", "18 Ay", "24 Ay", "36 Ay", "48 Ay"
];

const DURUM_OPTIONS = ["Sıfır", "İkinci El"];
const VITES_OPTIONS = ["Manuel", "Otomatik"];
const YAKIT_OPTIONS = ["Benzin", "Benzin + LPG", "Dizel", "Elektrik", "Hybrid"];
const SEGMENT_OPTIONS = ["Ekonomik", "Lux", "M Sınıfı", "Orta", "Orta + Üst", "Ticari"];
const BODYTYPE_OPTIONS = ["Camlı Van 4 Kapı", "Crossover", "Hatchback", "Minivan", "Pickup", "Sedan", "Stationwagon", "SUV"];
const BRAND_OPTIONS = [
  "Alfa Romeo", "Audi", "BMW", "BYD", "Chery", "Citroen", "Cupra", "Dacia", "Fiat",
  "Ford", "Honda", "Hyundai", "Jeep", "Kia", "Mercedes-Benz", "MG", "Nissan",
  "Opel", "Peugeot", "Renault", "Seat", "Skoda", "Tesla", "Toyota", "Volkswagen", "Volvo"
];

export default function NewProductPage() {
  const [form, setForm] = useState({
    isim: "",
    aciklama: "",
    stok_kodu: "",
    durum: "",
    vites: "",
    yakit_turu: "",
    segment: "",
    bodyType: "",
    brand: "",
    category: "",
    cover_image: "",
    gallery_images: [] as string[],
  });

  const [variations, setVariations] = useState([
    { id: uuidv4(), kilometre: "", sure: "", fiyat: "", status: "Aktif" }
  ]);

  const [allImages, setAllImages] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectingCover, setSelectingCover] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase.storage.from("images").list("", { limit: 100 });
      if (!error && data) setAllImages(data.map((img) => img.name));
    };
    fetchImages();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleVariationChange = (index: number, field: string, value: string) => {
    const updated = [...variations];
    updated[index] = { ...updated[index], [field]: value };
    setVariations(updated);
  };

  const handleAddVariation = () => {
    setVariations(prev => [...prev, { id: uuidv4(), kilometre: "", sure: "", fiyat: "", status: "Aktif" }]);
  };

  const handleRemoveVariation = (id: string) => {
    setVariations(prev => prev.filter(v => v.id !== id));
  };

  const handleImageSelect = (img: string) => {
    if (selectingCover) {
      setForm(prev => ({ ...prev, cover_image: img }));
      setShowModal(false);
    } else {
      setForm(prev => ({
        ...prev,
        gallery_images: prev.gallery_images.includes(img)
          ? prev.gallery_images.filter(i => i !== img)
          : [...prev.gallery_images, img]
      }));
    }
  };

  const buildImageUrl = (filename: string) =>
    `https://uxnpmdeizkzvnevpceiw.supabase.co/storage/v1/object/public/images/${filename}`;

  const handleSubmit = async () => {
    try {
      const { data, error } = await supabase
        .from("Araclar")
        .insert([{ ...form }])
        .select()
        .single();

      if (error) {
        alert("Ürün eklenirken hata oluştu: " + error.message);
        return;
      }

      const aracId = data.id;

      const newVariations = variations.map(v => ({
        id: v.id,
        kilometre: v.kilometre,
        sure: v.sure,
        fiyat: v.fiyat,
        status: v.status,
        arac_id: aracId
      }));

      const { error: varError } = await supabase.from("variations").insert(newVariations);

      if (varError) {
        alert("Varyasyon eklenirken hata oluştu: " + varError.message);
        return;
      }

      alert("Ürün başarıyla kaydedildi ✅");
    } catch (err: any) {
      alert("Bilinmeyen hata: " + err.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Yeni Ürün Ekle</h1>

      {/* Form Alanları */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <input name="isim" value={form.isim} onChange={handleFormChange} placeholder="Ürün Adı" className="p-2 border rounded" />
        <input name="stok_kodu" value={form.stok_kodu} onChange={handleFormChange} placeholder="Stok Kodu" className="p-2 border rounded" />
        <textarea name="aciklama" value={form.aciklama} onChange={handleFormChange} placeholder="Açıklama" className="p-2 border rounded col-span-2" />
        <select name="durum" value={form.durum} onChange={handleFormChange} className="p-2 border rounded">
          <option value="">Araç Durumu</option>
          {DURUM_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
        </select>
        <select name="yakit_turu" value={form.yakit_turu} onChange={handleFormChange} className="p-2 border rounded">
          <option value="">Yakıt Türü</option>
          {YAKIT_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
        </select>
        <select name="vites" value={form.vites} onChange={handleFormChange} className="p-2 border rounded">
          <option value="">Vites</option>
          {VITES_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
        </select>
        <select name="segment" value={form.segment} onChange={handleFormChange} className="p-2 border rounded">
          <option value="">Segment</option>
          {SEGMENT_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
        </select>
        <select name="bodyType" value={form.bodyType} onChange={handleFormChange} className="p-2 border rounded">
          <option value="">Kasa Tipi</option>
          {BODYTYPE_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
        </select>
        <select name="brand" value={form.brand} onChange={handleFormChange} className="p-2 border rounded">
          <option value="">Marka</option>
          {BRAND_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
        </select>
        <input name="category" value={form.category} onChange={handleFormChange} placeholder="Kategori" className="p-2 border rounded" />
      </div>

      {/* Görsel Seçimi */}
      <div className="mb-4">
        <button onClick={() => { setSelectingCover(true); setShowModal(true); }} className="bg-gray-200 px-4 py-1 rounded text-sm mb-2">Kapak Görseli Seç</button>
        {form.cover_image && (
          <div className="mb-4">
            <img src={buildImageUrl(form.cover_image)} alt="Kapak" className="h-40 rounded border object-cover" />
          </div>
        )}
        <button onClick={() => { setSelectingCover(false); setShowModal(true); }} className="bg-gray-200 px-4 py-1 rounded text-sm mb-2">Galeri Görselleri Seç</button>
        <div className="flex gap-2 overflow-x-auto">
          {form.gallery_images.map((img) => (
            <img key={img} src={buildImageUrl(img)} className="h-20 w-32 object-cover rounded border" />
          ))}
        </div>
      </div>

      {/* Görsel Modalı */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-4 max-w-4xl w-full rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Görsel Seç</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-600 hover:text-black">X</button>
            </div>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ara..." className="w-full p-2 border mb-4" />
            <div className="grid grid-cols-3 gap-2">
              {allImages
                .filter(img => img.toLowerCase().includes(search.toLowerCase()))
                .map((img) => (
                  <div key={img} onClick={() => handleImageSelect(img)} className="cursor-pointer border p-1 hover:border-blue-500">
                    <img src={buildImageUrl(img)} className="h-20 w-full object-cover" />
                    <p className="text-xs truncate text-center">{img}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Varyasyonlar */}
      <h2 className="text-lg font-semibold mb-2">Varyasyonlar</h2>
      <table className="w-full border text-sm mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Kilometre</th>
            <th className="border p-2">Süre</th>
            <th className="border p-2">Fiyat</th>
            <th className="border p-2">Durum</th>
            <th className="border p-2">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {variations.map((v, i) => (
            <tr key={v.id}>
              <td className="border p-2">
                <select value={v.kilometre} onChange={(e) => handleVariationChange(i, "kilometre", e.target.value)} className="w-full">{KILOMETRE_OPTIONS.map(k => <option key={k}>{k}</option>)}</select>
              </td>
              <td className="border p-2">
                <select value={v.sure} onChange={(e) => handleVariationChange(i, "sure", e.target.value)} className="w-full">{SURE_OPTIONS.map(s => <option key={s}>{s}</option>)}</select>
              </td>
              <td className="border p-2">
                <input type="number" value={v.fiyat} onChange={(e) => handleVariationChange(i, "fiyat", e.target.value)} className="w-full" />
              </td>
              <td className="border p-2">
                <select value={v.status} onChange={(e) => handleVariationChange(i, "status", e.target.value)} className="w-full">
                  <option value="Aktif">Aktif</option>
                  <option value="Pasif">Pasif</option>
                </select>
              </td>
              <td className="border p-2">
                <button onClick={() => handleRemoveVariation(v.id)} className="text-red-600">Sil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handleAddVariation} className="mb-6 bg-green-600 text-white px-4 py-2 rounded">+ Varyasyon Ekle</button>
      <br />
      <button onClick={handleSubmit} className="bg-blue-600 text-white px-6 py-2 rounded">Kaydet</button>
    </div>
  );
}
