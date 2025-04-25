// components/EditProductPage.tsx
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Editor } from "@tinymce/tinymce-react";

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

// Dizileri açıkça string[] olarak tipliyoruz
const YAKIT_OPTIONS: string[] = ["Benzin", "Benzin + LPG", "Dizel", "Elektrik", "Hibrit"];
const VITES_OPTIONS: string[] = ["Manuel", "Otomatik"];
const MARKA_OPTIONS: string[] = [
  "Alfa Romeo","Audi","BMW","BYD","Chery","Citroen","Cupra","Dacia","Fiat",
  "Ford","Honda","Hyundai","Jeep","Kia","Mercedes-Benz","MG","Nissan","Opel",
  "Peugeot","Renault","Seat","Skoda","Tesla","Toyota","Volkswagen","Volvo"
];
const SEGMENT_OPTIONS: string[] = ["Ekonomik","Lux","M Sınıfı","Orta","Orta + Üst","Ticari"];
const BODYTYPE_OPTIONS: string[] = [
  "Camlı Van","4 Kapı","Crossover","Hatchback","Minivan","Pickup","Sedan","Stationwagon","SUV"
];
const DURUM_OPTIONS: string[] = ["Sıfır","İkinci El"];
const KILOMETRE_OPTIONS: string[] = [
  "1.000 Kilometre / Ay","2.000 Kilometre / Ay","3.000 Kilometre / Ay","4.000 Kilometre / Ay",
  "10.000 Kilometre / Yıl","15.000 Kilometre / Yıl","20.000 Kilometre / Yıl","25.000 Kilometre / Yıl",
  "30.000 Kilometre / Yıl","35.000 Kilometre / Yıl","40.000 Kilometre / Yıl","45.000 Kilometre / Yıl",
  "50.000 Kilometre / Yıl"
];
const SURE_OPTIONS: string[] = [
  "1-3 Ay","3 Ay","6 Ay","9 Ay","12 Ay","12+12 Ay","18 Ay","24 Ay","36 Ay","48 Ay"
];

export default function EditProductPage({
  initialData,
  variations: initialVariations,
}: {
  initialData: Product;
  variations: Variation[];
}) {
  const [product, setProduct] = useState<Product>(initialData);
  const [kisaAciklama, setKisaAciklama] = useState(initialData.kisa_aciklama);
  const [aciklama, setAciklama] = useState(initialData.aciklama);
  const [variations, setVariations] = useState<Variation[]>(initialVariations || []);
  const [imageOptions, setImageOptions] = useState<string[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<string[]>(initialData.gallery_images);
  const [search, setSearch] = useState<string>("");
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [selectingCover, setSelectingCover] = useState<boolean>(true);

  // Supabase public URL helper
  const getPublicUrl = (path: string) =>
    supabase.storage.from("images").getPublicUrl(path).data.publicUrl;

  useEffect(() => {
    (async () => {
      const all: string[] = [];
      let offset = 0;
      while (true) {
        const { data, error } = await supabase
          .storage.from("images")
          .list("", { limit: 100, offset, sortBy: { column: "name", order: "asc" } });
        if (error || !data || data.length === 0) break;
        all.push(...data.map((x) => x.name));
        offset += 100;
      }
      setImageOptions(all);
    })();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProduct((p) => ({ ...p, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct((p) => ({ ...p, [name]: value }));
  };

  const handleVariationChange = (
    idx: number,
    field: keyof Variation,
    val: string
  ) => {
    setVariations((vs) => {
      const copy = [...vs];
      copy[idx] = {
        ...copy[idx],
        [field]: field === "fiyat" ? parseFloat(val) : val,
      };
      return copy;
    });
  };

  const handleAddVariation = () =>
    setVariations((vs) => [
      ...vs,
      { id: crypto.randomUUID(), kilometre: "", sure: "", fiyat: 0, status: "Aktif" },
    ]);

  const handleSave = async () => {
    // 1) Araclar tablosunu güncelle
    const { error } = await supabase
      .from("Araclar")
      .update({
        isim: product.isim,
        stok_kodu: product.stok_kodu,
        kisa_aciklama: kisaAciklama,
        aciklama,
        yakit_turu: product.yakit_turu,
        vites: product.vites,
        brand: product.brand,
        segment: product.segment,
        bodyType: product.bodyType,
        durum: product.durum,
        fiyat: product.fiyat,
        cover_image: product.cover_image,
        gallery_images: galleryFiles,
      })
      .eq("id", product.id);

    if (error) {
      console.error(error);
      return alert("Ürün güncellenemedi");
    }

    // 2) Varyasyonları ayrı tabloya kaydet
    for (const v of variations) {
      const { error: varErr } = await supabase
        .from("variations")
        .upsert({ ...v, arac_id: product.id });
      if (varErr) console.error("Varyasyon hatası:", varErr);
    }

    alert("Güncelleme tamamlandı");
  };

  const filteredImages = imageOptions.filter((img) =>
    img.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Ürün Düzenle</h1>

      {/* Grid Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <input
          className="input"
          name="isim"
          placeholder="Ürün Adı"
          value={product.isim}
          onChange={handleInputChange}
        />
        <input
          className="input"
          name="stok_kodu"
          placeholder="Stok Kodu"
          value={product.stok_kodu}
          onChange={handleInputChange}
        />

        {/* Kısa Açıklama */}
        <div className="col-span-2">
          <Editor
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            value={kisaAciklama}
            init={{
              height: 150,
              menubar: false,
              toolbar: "bold italic underline | bullist numlist | removeformat",
            }}
            onEditorChange={(c) => setKisaAciklama(c)}
          />
        </div>

        {/* Detaylı Açıklama */}
        <div className="col-span-2">
          <Editor
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            value={aciklama}
            init={{
              height: 300,
              menubar: true,
              plugins: ["link", "table", "lists", "code"],
              toolbar:
                "undo redo | styleselect | bold italic | alignleft aligncenter alignright | bullist numlist | link | table | code",
            }}
            onEditorChange={(c) => setAciklama(c)}
          />
        </div>

        {/* Select Fields */}
        <select
          className="input"
          name="yakit_turu"
          value={product.yakit_turu}
          onChange={handleSelectChange}
        >
          {YAKIT_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <select
          className="input"
          name="vites"
          value={product.vites}
          onChange={handleSelectChange}
        >
          {VITES_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <select
          className="input"
          name="brand"
          value={product.brand}
          onChange={handleSelectChange}
        >
          {MARKA_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <select
          className="input"
          name="segment"
          value={product.segment}
          onChange={handleSelectChange}
        >
          {SEGMENT_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <select
          className="input"
          name="bodyType"
          value={product.bodyType}
          onChange={handleSelectChange}
        >
          {BODYTYPE_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <select
          className="input"
          name="durum"
          value={product.durum}
          onChange={handleSelectChange}
        >
          {DURUM_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      {/* Kapak & Galeri */}
      <div className="flex items-center space-x-4">
        <button
          className="bg-gray-200 px-4 py-1 rounded"
          onClick={() => { setShowImageModal(true); setSelectingCover(true); }}
        >
          Kapak Görseli Seç
        </button>
        {product.cover_image && (
          <img
            src={getPublicUrl(product.cover_image)}
            alt="Kapak"
            className="h-32 rounded border"
          />
        )}
        <button
          className="bg-gray-200 px-4 py-1 rounded"
          onClick={() => { setShowImageModal(true); setSelectingCover(false); }}
        >
          Galeri Görselleri Seç
        </button>
      </div>

      {/* Galeri Önizleme */}
      <div className="flex flex-wrap gap-2">
        {galleryFiles.map((img) => (
          <img
            key={img}
            src={getPublicUrl(img)}
            alt={img}
            className="h-20 w-32 object-cover rounded border"
          />
        ))}
      </div>

      {/* Görsel Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between mb-2">
              <h2 className="font-semibold">Görsel Seç</h2>
              <button onClick={() => setShowImageModal(false)}>Kapat</button>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Görsel ara..."
              className="w-full p-2 border mb-2"
            />
            <div className="grid grid-cols-3 gap-2">
              {filteredImages.map((img) => (
                <div
                  key={img}
                  onClick={() => {
                    if (selectingCover) {
                      setProduct((p) => ({ ...p, cover_image: img }));
                    } else {
                      setGalleryFiles((g) =>
                        g.includes(img) ? g.filter((x) => x !== img) : [...g, img]
                      );
                    }
                    setShowImageModal(false);
                  }}
                  className={`cursor-pointer p-1 rounded border ${
                    product.cover_image === img || galleryFiles.includes(img)
                      ? "border-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  <img
                    src={getPublicUrl(img)}
                    alt={img}
                    className="h-20 w-full object-cover rounded"
                  />
                  <p className="text-xs truncate text-center">{img}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Varyasyonlar */}
      <h2 className="text-xl font-semibold mt-6">Varyasyonlar</h2>
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-100">
          <tr>
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
                <select
                  className="w-full"
                  value={v.kilometre}
                  onChange={(e) =>
                    handleVariationChange(i, "kilometre", e.target.value)
                  }
                >
                  {KILOMETRE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </td>
              <td className="border p-2">
                <select
                  className="w-full"
                  value={v.sure}
                  onChange={(e) =>
                    handleVariationChange(i, "sure", e.target.value)
                  }
                >
                  {SURE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  className="w-full"
                  value={v.fiyat}
                  onChange={(e) =>
                    handleVariationChange(i, "fiyat", e.target.value)
                  }
                />
              </td>
              <td className="border p-2">
                <select
                  className="w-full"
                  value={v.status}
                  onChange={(e) =>
                    handleVariationChange(i, "status", e.target.value)
                  }
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Pasif">Pasif</option>
                </select>
              </td>
              <td className="border p-2 text-center">
                <button
                  onClick={() =>
                    setVariations((vs) => vs.filter((_, idx) => idx !== i))
                  }
                  className="text-red-600"
                >
                  Sil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex space-x-2">
        <button
          onClick={handleAddVariation}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          + Varyasyon Ekle
        </button>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Ürünü Kaydet
        </button>
      </div>
    </div>
  );
}
