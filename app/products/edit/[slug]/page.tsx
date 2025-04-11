"use client";

import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";

interface Variation {
  id: string;
  kilometre: string;
  sure: string;
  fiyat: string;
  status: string;
  [key: string]: string;
}

export default function ProductEditPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState("");
  const [transmission, setTransmission] = useState("");
  const [segment, setSegment] = useState("");
  const [fuel, setFuel] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [modelYear, setModelYear] = useState("");
  const [engineSize, setEngineSize] = useState("");
  const [color, setColor] = useState("");
  const [trim, setTrim] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [gallery, setGallery] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const [variations, setVariations] = useState<Variation[]>([
    {
      id: uuidv4(),
      kilometre: "10.000",
      sure: "6 Ay",
      fiyat: "350000",
      status: "Yayında",
    },
  ]);

  useEffect(() => {
    setTitle("Renault Megane 1.3 TCe Touch EDC 140HP");
    setDescription("Bu araca ait açıklama buraya yazılabilir.");
  }, []);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCover(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setGallery(files);
      setGalleryPreviews(files.map((file) => URL.createObjectURL(file)));
    }
  };

  const handleVariationChange = (index: number, field: string, value: string) => {
    const updated = [...variations];
    updated[index][field] = value;
    setVariations(updated);
  };

  const addVariation = () => {
    setVariations((prev) => [
      ...prev,
      {
        id: uuidv4(),
        kilometre: "10.000",
        sure: "6 Ay",
        fiyat: "",
        status: "Yayında",
      },
    ]);
  };

  const removeVariation = (id: string) => {
    setVariations((prev) => prev.filter((v) => v.id !== id));
  };

  const uploadFile = async (file: File, path: string) => {
    console.log("🟡 Dosya yükleme başlıyor:", path);
    const { data, error } = await supabase.storage.from("products").upload(path, file);
    if (error) {
      console.error("❌ Yükleme hatası:", error.message);
      throw error;
    }
    console.log("✅ Yükleme tamamlandı:", data?.path);
    return data.path;
  };

  const handleSave = async () => {
    try {
      console.log("🟢 Kaydetme işlemi başladı...");
      
      // Oturum kontrolü
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error("Oturum kontrolü başarısız.");
      
      const user = sessionData?.session?.user;
      if (!user) {
        console.log("❌ Kullanıcı oturumu bulunamadı");
        throw new Error("Oturum açmış kullanıcı bulunamadı.");
      }

      console.log("✅ Kullanıcı oturumu doğrulandı:", user);

      let coverPath = null;
      if (cover) {
        const path = `cover/${Date.now()}-${cover.name}`;
        coverPath = await uploadFile(cover, path);
      }

      const galleryPaths = [];
      for (const file of gallery) {
        const path = `gallery/${Date.now()}-${file.name}`;
        const uploadedPath = await uploadFile(file, path);
        galleryPaths.push(uploadedPath);
      }

      const { data: productData, error: productError } = await supabase
        .from("Araclar")
        .insert({
          user_id: user.id,
          isim: title,
          aciklama: description,
          kategori: category,
          marka: brand,
          stok_durumu: condition,
          vites_tipi: transmission,
          segment,
          yakit_tipi: fuel,
          kasa_tipi: bodyType,
          model_yili: modelYear,
          motor_hacmi: engineSize,
          renk: color,
          donanim_paketi: trim,
          cover_url: coverPath,
          gallery_urls: galleryPaths,
        })
        .select()
        .single();

      if (productError) throw new Error(JSON.stringify(productError));

      const productId = productData.id;

      const variationInsert = variations.map((v) => ({
        user_id: user.id,
        arac_id: productId,
        kilometre: v.kilometre,
        sure: v.sure,
        fiyat: v.fiyat,
        status: v.status,
      }));

      const { error: variationError } = await supabase.from("variations").insert(variationInsert);
      if (variationError) throw new Error(JSON.stringify(variationError));

      console.log("✅ Ürün ve varyasyonlar başarıyla kaydedildi.");
      alert("Ürün ve varyasyonlar başarıyla kaydedildi.");
    } catch (error: any) {
      if (error instanceof Error) {
        console.error("Kayıt hatası:", error.message);
        console.error("Stack:", error.stack);
      } else {
        console.error("Kayıt hatası (bilinmeyen):", error);
      }
      alert("Kayıt sırasında bir hata oluştu. Detay için konsolu kontrol edin.");
    }
  };

  const brandList = [
    "Audi", "BMW", "Chevrolet", "Citroen", "Dacia", "Fiat", "Ford", "Honda", "Hyundai", "Kia",
    "Mazda", "Mercedes-Benz", "Nissan", "Opel", "Peugeot", "Renault", "Seat", "Skoda", "Suzuki",
    "Toyota", "Volkswagen", "Volvo"
  ];

  return (
    <div className="p-6 space-y-6">
      <button onClick={() => window.history.back()} className="bg-white text-black px-4 py-2 rounded mb-4">
        ← Anasayfa
      </button>

      <h1 className="text-2xl font-bold text-white">Ürünü Düzenle</h1>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <input className="form-input" placeholder="Başlık" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="form-textarea" placeholder="Açıklama" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input className="form-input" placeholder="Model Yılı" value={modelYear} onChange={(e) => setModelYear(e.target.value)} />
        <input className="form-input" placeholder="Motor Hacmi" value={engineSize} onChange={(e) => setEngineSize(e.target.value)} />
        <input className="form-input" placeholder="Renk" value={color} onChange={(e) => setColor(e.target.value)} />
        <input className="form-input" placeholder="Donanım Paketi" value={trim} onChange={(e) => setTrim(e.target.value)} />

        <input type="file" onChange={handleCoverChange} />
        {coverPreview && <img src={coverPreview} alt="Kapak" className="w-32 h-20 object-cover" />}

        <input type="file" multiple onChange={handleGalleryChange} />
        <div className="flex gap-2 flex-wrap col-span-2">
          {galleryPreviews.map((src, i) => (
            <img key={i} src={src} alt={`Galeri ${i}`} className="w-16 h-16 object-cover" />
          ))}
        </div>

        <div className="col-span-2">
          <h2 className="text-lg font-semibold">Varyasyonlar</h2>
          <button type="button" onClick={addVariation} className="text-sm bg-blue-600 text-white px-3 py-1 rounded">+ Yeni Varyasyon</button>
          <table className="w-full mt-2 text-sm">
            <thead>
              <tr>
                <th>Kilometre</th>
                <th>Süre</th>
                <th>Fiyat</th>
                <th>Durum</th>
                <th>Sil</th>
              </tr>
            </thead>
            <tbody>
              {variations.map((v, i) => (
                <tr key={v.id}>
                  <td>
                    <select value={v.kilometre} onChange={(e) => handleVariationChange(i, "kilometre", e.target.value)}>
                      {["10.000", "20.000", "30.000"].map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td>
                    <select value={v.sure} onChange={(e) => handleVariationChange(i, "sure", e.target.value)}>
                      {["6 Ay", "12 Ay", "24 Ay"].map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td>
                    <input type="number" value={v.fiyat} onChange={(e) => handleVariationChange(i, "fiyat", e.target.value)} />
                  </td>
                  <td>
                    <select value={v.status} onChange={(e) => handleVariationChange(i, "status", e.target.value)}>
                      {["Yayında", "Yayında Değil"].map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td><button type="button" onClick={() => removeVariation(v.id)} className="text-red-600">🗑</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="col-span-2">
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded shadow">Kaydet</button>
        </div>
      </form>
    </div>
  );
}
