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
const SINIF_OPTIONS = ["Ekonomik", "Lux", "M Sınıfı", "Orta", "Orta + Üst", "Ticari"];
const KASA_OPTIONS = ["Camlı Van 4 Kapı", "Crossover", "Hatchback", "Minivan", "Pickup", "Sedan", "Stationwagon", "SUV"];
const BRAND_OPTIONS = [
  "Alfa Romeo", "Audi", "BMW", "BYD", "Chery", "Citroen", "Cupra", "Dacia", "Fiat",
  "Ford", "Honda", "Hyundai", "Jeep", "Kia", "Mercedes-Benz", "MG", "Nissan",
  "Opel", "Peugeot", "Renault", "Seat", "Skoda", "Tesla", "Toyota", "Volkswagen", "Volvo"
];

interface Variation {
  id: string;
  kilometre: string;
  sure: string;
  fiyat: string;
  status: string;
}

export default function NewProductPage() {
  const [brand, setBrand] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("");
  const [transmission, setTransmission] = useState("");
  const [segment, setSegment] = useState("");
  const [category, setCategory] = useState("");
  const [fuel, setFuel] = useState("");
  const [bodyType, setBodyType] = useState("");

  const [coverPreview, setCoverPreview] = useState("");
  const [coverFile, setCoverFile] = useState("");
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<string[]>([]);

  const [variations, setVariations] = useState<Variation[]>([
    { id: uuidv4(), kilometre: "", sure: "", fiyat: "", status: "Yayında" },
  ]);

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = `products/cover/${uuidv4()}-${file.name}`;
    const { data, error } = await supabase.storage.from("products").upload(fileName, file);
    if (!error && data) {
      const url = supabase.storage.from("products").getPublicUrl(data.path).data.publicUrl;
      setCoverPreview(url);
      setCoverFile(fileName);
    }
  };

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const uploadedUrls: string[] = [];
    const uploadedPaths: string[] = [];
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = `products/gallery/${uuidv4()}-${file.name}`;
      const { data, error } = await supabase.storage.from("products").upload(fileName, file);
      if (!error && data) {
        const url = supabase.storage.from("products").getPublicUrl(data.path).data.publicUrl;
        uploadedUrls.push(url);
        uploadedPaths.push(fileName);
      }
    }
    setGalleryPreviews(uploadedUrls);
    setGalleryFiles(uploadedPaths);
  };

  const addVariation = () => {
    setVariations((prev) => [...prev, { id: uuidv4(), kilometre: "", sure: "", fiyat: "", status: "Yayında" }]);
  };

  const updateVariation = (id: string, field: string, value: string) => {
    setVariations((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeVariation = (id: string) => {
    setVariations((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async () => {
    try {
      const { data: productData, error: productError } = await supabase
        .from("Araclar")
        .insert([
          {
            id: uuidv4(),
            isim: title,
            ad: title,
            aciklama: description,
            stok_kodu: uuidv4(),
            yakit_turu: fuel,
            vites: transmission,
            durum: condition,
            segment,
            brand,
            category,
            bodyType,
            cover_image: coverFile || null,
            gallery_images: galleryFiles.length ? galleryFiles : null,
          },
        ])
        .select()
        .single();

      if (productError || !productData) {
        throw new Error(productError?.message || "Bilinmeyen hata oluştu");
      }

      const insertedId = productData.id;
      const variationRecords = variations.map((v) => ({
        id: uuidv4(),
        product_id: insertedId,
        kilometre: v.kilometre,
        sure: v.sure,
        fiyat: v.fiyat,
        status: v.status,
      }));

      const { error: variationError } = await supabase.from("variations").insert(variationRecords);

      if (variationError) {
        throw new Error("Varyasyon ekleme hatası: " + variationError.message);
      }

      alert("Ürün ve varyasyonlar başarıyla eklendi.");
    } catch (err: any) {
      console.error("Ürün eklenemedi", err);
      alert("Hata: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Yeni Ürün Ekle</h1>

      <div className="grid grid-cols-2 gap-6">
        <input type="text" placeholder="Ürün Adı" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="text" placeholder="Açıklama" value={description} onChange={(e) => setDescription(e.target.value)} />

        <select value={condition} onChange={(e) => setCondition(e.target.value)}>
          <option>Araç Durumu</option>
          {DURUM_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
        </select>

        <select value={transmission} onChange={(e) => setTransmission(e.target.value)}>
          <option>Vites</option>
          {VITES_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
        </select>

        <select value={fuel} onChange={(e) => setFuel(e.target.value)}>
          <option>Yakıt Türü</option>
          {YAKIT_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
        </select>

        <select value={segment} onChange={(e) => setSegment(e.target.value)}>
          <option>Sınıf</option>
          {SINIF_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
        </select>

        <select value={bodyType} onChange={(e) => setBodyType(e.target.value)}>
          <option>Kasa Tipi</option>
          {KASA_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
        </select>

        <select value={brand} onChange={(e) => setBrand(e.target.value)}>
          <option>Marka</option>
          {BRAND_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
        </select>

        <input type="text" placeholder="Kategori" value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>

      <div className="space-y-10 bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div>
          <label className="font-semibold text-gray-700 block mb-3 text-sm uppercase tracking-wide">Kapak Fotoğrafı</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
          {coverPreview && (
            <img src={coverPreview} alt="Kapak" className="mt-4 w-48 h-auto rounded-lg shadow-md border border-gray-300" />
          )}
        </div>

        <div>
          <label className="font-semibold text-gray-700 block mb-3 text-sm uppercase tracking-wide">Detay Fotoğraflar</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryChange}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
          <div className="flex gap-3 flex-wrap mt-4">
            {galleryPreviews.map((url, idx) => (
              <img key={idx} src={url} alt={`Detay ${idx}`} className="w-28 h-28 object-cover rounded-lg border border-gray-300 shadow-sm" />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Varyasyonlar</h2>
        {variations.map((item) => (
          <div key={item.id} className="flex gap-4 my-2">
            <select value={item.kilometre} onChange={(e) => updateVariation(item.id, "kilometre", e.target.value)}>
              <option>Kilometre</option>
              {KILOMETRE_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
            </select>
            <select value={item.sure} onChange={(e) => updateVariation(item.id, "sure", e.target.value)}>
              <option>Süre</option>
              {SURE_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
            </select>
            <input type="text" placeholder="Fiyat" value={item.fiyat} onChange={(e) => updateVariation(item.id, "fiyat", e.target.value)} />
            <select value={item.status} onChange={(e) => updateVariation(item.id, "status", e.target.value)}>
              <option>Yayında</option>
              <option>Taslak</option>
            </select>
            <button type="button" onClick={() => removeVariation(item.id)} className="text-red-500">Sil</button>
          </div>
        ))}
        <button type="button" className="mt-2 px-4 py-1 bg-gray-800 text-white" onClick={addVariation}>+ Yeni Varyasyon</button>
      </div>

      <button className="mt-8 bg-green-600 text-white px-6 py-2 rounded" onClick={handleSubmit}>Kaydet</button>
    </div>
  );
}
