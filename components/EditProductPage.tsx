// components/EditProductPage.tsx
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Editor } from "@tinymce/tinymce-react";
// Heroicons v1 importları: XIcon ve PlusIcon /solid altından
import { XIcon, PlusIcon } from "@heroicons/react/solid";

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

// Sabitler - Mevcut koddan alındı
const YAKIT_OPTIONS: string[] = ["Benzin", "Benzin + LPG", "Dizel", "Elektrik", "Hibrit"];
const VITES_OPTIONS: string[] = ["Manuel", "Otomatik"];
const MARKA_OPTIONS: string[] = [
  "Alfa Romeo", "Audi", "BMW", "BYD", "Chery", "Citroen", "Cupra", "Dacia", "Fiat",
  "Ford", "Honda", "Hyundai", "Jeep", "Kia", "Mercedes-Benz", "MG", "Nissan", "Opel",
  "Peugeot", "Renault", "Seat", "Skoda", "Tesla", "Toyota", "Volkswagen", "Volvo"
];
const SEGMENT_OPTIONS: string[] = ["Ekonomik", "Lux", "M Sınıfı", "Orta", "Orta + Üst", "Ticari"];
const BODYTYPE_OPTIONS: string[] = [
  "Camlı Van", "4 Kapı", "Crossover", "Hatchback", "Minivan", "Pickup",
  "Sedan", "Stationwagon", "SUV"
];
const DURUM_OPTIONS: string[] = ["Sıfır", "İkinci El"];
const KILOMETRE_OPTIONS: string[] = [
  "1.000 Kilometre / Ay", "2.000 Kilometre / Ay", "3.000 Kilometre / Ay", "4.000 Kilometre / Ay",
  "10.000 Kilometre / Yıl", "15.000 Kilometre / Yıl", "20.000 Kilometre / Yıl", "25.000 Kilometre / Yıl",
  "30.000 Kilometre / Yıl", "35.000 Kilometre / Yıl", "40.000 Kilometre / Yıl", "45.000 Kilometre / Yıl",
  "50.000 Kilometre / Yıl"
];
const SURE_OPTIONS: string[] = [
  "1–3 Ay", "3 Ay", "6 Ay", "9 Ay", "12 Ay", "12+12 Ay", "18 Ay", "24 Ay", "36 Ay", "48 Ay"
];

// Yardımcı fonksiyon: Genel URL alma (mevcut koddan alındı)
const getPublicUrl = (path: string) => {
  if (!path) return "";
  const { data } = supabase.storage.from("images").getPublicUrl(path);
  return data.publicUrl;
};

export default function EditProductPage({
  initialData,
  variations: initialVariations,
}: {
  initialData: Product;
  variations: Variation[];
}) {
  // State hookları - Mevcut koddan alındı
  const [product, setProduct] = useState<Product>(initialData);
  const [kisaAciklama, setKisaAciklama] = useState(initialData.kisa_aciklama);
  const [aciklama, setAciklama] = useState(initialData.aciklama);
  const [variations, setVariations] = useState<Variation[]>(initialVariations || []);
  const [imageOptions, setImageOptions] = useState<string[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<string[]>(initialData.gallery_images || []);
  const [search, setSearch] = useState<string>("");
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [selectingCover, setSelectingCover] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Görsel listesini çekme - Mevcut koddan alındı
  useEffect(() => {
    const fetchImages = async () => {
      const all: string[] = [];
      let offset = 0;
      const limit = 100; // Supabase limiti
      while (true) {
        const { data, error } = await supabase
          .storage.from("images")
          .list("", { limit: limit, offset, sortBy: { column: "name", order: "asc" } });
        if (error) {
          console.error("Error fetching images:", error);
          break;
        }
        if (!data || data.length === 0) break;
        all.push(...data.map((x) => x.name));
        offset += limit;
      }
      setImageOptions(all);
    };
    fetchImages();
  }, []);

  // Input değişikliklerini yönetme - Mevcut koddan alındı
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProduct((p) => ({ ...p, [name]: value }));
  };

  // Select değişikliklerini yönetme - Mevcut koddan alındı
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct((p) => ({ ...p, [name]: value }));
  };

  // Varyasyon değişikliklerini yönetme - Mevcut koddan alındı
  const handleVariationChange = (
    idx: number,
    field: keyof Variation,
    val: string
  ) => {
    setVariations((vs) => {
      const copy = [...vs];
      copy[idx] = {
        ...copy[idx],
        [field]: field === "fiyat" ? parseFloat(val) || 0 : val,
      };
      return copy;
    });
  };

  // Varyasyon silme - Mevcut koddan alındı
  const handleRemoveVariation = (idx: number) => {
    setVariations((vs) => vs.filter((_, i) => i !== idx));
  };

  // Varyasyon ekleme - Mevcut koddan alındı
  const handleAddVariation = () =>
    setVariations((vs) => [
      ...vs,
      { id: crypto.randomUUID(), kilometre: KILOMETRE_OPTIONS[0] || "", sure: SURE_OPTIONS[0] || "", fiyat: 0, status: "Aktif" },
    ]);

  // Kaydetme işlemi - Mevcut koddan alındı
  const handleSave = async () => {
    setIsSaving(true);
    const { error: productError } = await supabase
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

    if (productError) {
      console.error("Araclar update error:", productError);
      alert("Ürün güncellenirken bir hata oluştu: " + productError.message);
      setIsSaving(false);
      return;
    }

    const { error: variationsError } = await supabase
      .from("variations")
      .upsert(variations.map(v => ({ ...v, arac_id: product.id })));

    if (variationsError) {
      console.error("Varyasyon hatası:", variationsError);
      alert("Varyasyonlar güncellenirken bir hata oluştu: " + variationsError.message);
    } else {
      alert("Güncelleme tamamlandı!");
    }

    setIsSaving(false);
  };

  // Görsel filtreleme - Mevcut koddan alındı
  const filteredImages = imageOptions.filter((img) =>
    img.toLowerCase().includes(search.toLowerCase())
  );

  // Modal'dan görsel seçildiğinde - Mevcut koddan alındı
  const handleImageSelect = (img: string) => {
    if (selectingCover) {
      setProduct((p) => ({ ...p, cover_image: img }));
      setShowImageModal(false);
    } else {
      setGalleryFiles((g) =>
        g.includes(img) ? g.filter((x) => x !== img) : [...g, img]
      );
    }
  };

  // Galeri görselini kaldırma - Mevcut koddan alındı
  const handleRemoveGalleryImage = (img: string) => {
    setGalleryFiles((g) => g.filter((x) => x !== img));
  };


  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-800 border-b pb-4">
        Ürün Düzenle - {product.isim || "Yeni Ürün"}
      </h1>

      {/* Ürün Detayları Section */}
      <section className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Ürün Detayları</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="isim" className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı</label>
            <input
              id="isim"
              className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              name="isim"
              placeholder="Ürün Adı"
              value={product.isim}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="stok_kodu" className="block text-sm font-medium text-gray-700 mb-1">Stok Kodu</label>
            <input
              id="stok_kodu"
              className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              name="stok_kodu"
              placeholder="Stok Kodu"
              value={product.stok_kodu}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="fiyat" className="block text-sm font-medium text-gray-700 mb-1">Fiyat</label>
            <input
              id="fiyat"
              className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              type="number"
              name="fiyat"
              placeholder="Fiyat"
              value={product.fiyat}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="yakit_turu" className="block text-sm font-medium text-gray-700 mb-1">Yakıt Türü</label>
            <select id="yakit_turu" className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" name="yakit_turu" value={product.yakit_turu} onChange={handleSelectChange}>
              {YAKIT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="vites" className="block text-sm font-medium text-gray-700 mb-1">Vites</label>
            <select id="vites" className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" name="vites" value={product.vites} onChange={handleSelectChange}>
              {VITES_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">Marka</label>
            <select id="brand" className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" name="brand" value={product.brand} onChange={handleSelectChange}>
              {MARKA_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="segment" className="block text-sm font-medium text-gray-700 mb-1">Segment</label>
            <select id="segment" className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" name="segment" value={product.segment} onChange={handleSelectChange}>
              {SEGMENT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="bodyType" className="block text-sm font-medium text-gray-700 mb-1">Kasa Tipi</label>
            <select id="bodyType" className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" name="bodyType" value={product.bodyType} onChange={handleSelectChange}>
              {BODYTYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
           <div>
            <label htmlFor="durum" className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
            <select id="durum" className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" name="durum" value={product.durum} onChange={handleSelectChange}>
              {DURUM_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Açıklamalar Section */}
      <section className="bg-white p-6 rounded-lg shadow-md space-y-6">
         <h2 className="text-2xl font-semibold text-gray-700 mb-4">Açıklamalar</h2>
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Kısa Açıklama</label>
            <Editor
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              value={kisaAciklama}
              onEditorChange={setKisaAciklama}
              init={{
                height: 150,
                menubar: false,
                toolbar: "bold italic underline | bullist numlist | removeformat",
                skin_url: "/tinymce/skins/ui/oxide",
                content_css: "/tinymce/skins/content/default/content.css",
                branding: false,
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Detaylı Açıklama</label>
            <Editor
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              value={aciklama}
              onEditorChange={setAciklama}
              init={{
                height: 300,
                menubar: true,
                plugins: [
                  "advlist", "autolink", "lists", "link", "image", "charmap",
                  "preview", "anchor", "searchreplace", "visualblocks", "code",
                  "fullscreen", "insertdatetime", "media", "table", "code", "help", "wordcount"
                ],
                toolbar:
                  "undo redo | styleselect | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code",
                skin_url: "/tinymce/skins/ui/oxide",
                content_css: "/tinymce/skins/content/default/content.css",
                branding: false,
              }}
            />
          </div>
      </section>


      {/* Görseller Section */}
      <section className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Görseller</h2>

        {/* Kapak Görseli */}
        <div className="flex items-center gap-4">
          <label className="block text-sm font-medium text-gray-700 flex-shrink-0">Kapak Görseli:</label>
          <button
            onClick={() => { setShowImageModal(true); setSelectingCover(true); }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-3 rounded-md transition-colors duration-200"
          >
            Görsel Seç
          </button>
          {product.cover_image ? (
            <img
              src={getPublicUrl(product.cover_image)}
              alt="Kapak Görseli"
              className="h-24 w-32 object-cover rounded-md border border-gray-300 shadow"
            />
          ) : (
            <div className="h-24 w-32 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-sm">
              Görsel Yok
            </div>
          )}
        </div>

        {/* Galeri Görselleri */}
        <div>
           <div className="flex items-center gap-4 mb-3">
             <label className="block text-sm font-medium text-gray-700 flex-shrink-0">Galeri Görselleri:</label>
             <button
               onClick={() => { setShowImageModal(true); setSelectingCover(false); }}
               className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-3 rounded-md transition-colors duration-200"
             >
               Görselleri Yönet
             </button>
           </div>
           <div className="flex flex-wrap gap-3">
             {galleryFiles.length > 0 ? (
               galleryFiles.map((img) => (
                 <div key={img} className="relative group">
                   <img
                     src={getPublicUrl(img)}
                     alt={img}
                     className="h-20 w-24 object-cover border border-gray-300 rounded-md shadow-sm"
                   />
                   {/* Silme butonu - Heroicons v1 XIcon kullanıldı */}
                   <button
                       onClick={() => handleRemoveGalleryImage(img)}
                       className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                       aria-label="Görseli Kaldır"
                   >
                       <XIcon className="h-3 w-3" />
                   </button>
                 </div>
               ))
             ) : (
                <div className="text-gray-500 text-sm italic">Henüz galeri görseli eklenmedi.</div>
             )}
           </div>
        </div>

      </section>


      {/* Varyasyonlar Section */}
      <section className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Varyasyonlar</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-3 text-left font-semibold text-gray-600">Kilometre</th>
                <th className="border border-gray-300 p-3 text-left font-semibold text-gray-600">Süre</th>
                <th className="border border-gray-300 p-3 text-left font-semibold text-gray-600">Fiyat</th>
                <th className="border border-gray-300 p-3 text-left font-semibold text-gray-600">Durum</th>
                <th className="border border-gray-300 p-3 text-center font-semibold text-gray-600">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {variations.map((v, i) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3">
                    <select
                      className="w-full bg-transparent border-none focus:ring-0"
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
                  <td className="border border-gray-300 p-3">
                    <select
                      className="w-full bg-transparent border-none focus:ring-0"
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
                  <td className="border border-gray-300 p-3">
                    <input
                      type="number"
                      className="w-full bg-transparent border-none focus:ring-0"
                      value={v.fiyat}
                      onChange={(e) =>
                        handleVariationChange(i, "fiyat", e.target.value)
                      }
                    />
                  </td>
                  <td className="border border-gray-300 p-3">
                    <select
                      className="w-full bg-transparent border-none focus:ring-0"
                      value={v.status}
                      onChange={(e) =>
                        handleVariationChange(i, "status", e.target.value)
                      }
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Pasif">Pasif</option>
                    </select>
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    <button
                      onClick={() => handleRemoveVariation(i)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-200"
                      aria-label="Varyasyonu Sil"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        <button
          onClick={handleAddVariation}
          className="border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors duration-200 font-semibold py-2 px-3 rounded-md flex items-center"
        >
           <PlusIcon className="h-4 w-4 mr-1" /> Varyasyon Ekle
        </button>

      </section>


      {/* Görsel Seçim Modalı */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-xl font-semibold text-gray-700">{selectingCover ? "Kapak Görseli Seç" : "Galeri Görselleri Seç"}</h2>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Kapat"
              >
                 <XIcon className="h-6 w-6" /> {/* Kapatma ikonu - Heroicons v1 XIcon kullanıldı */}
              </button>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Görsel ara..."
              className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 mb-4"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto flex-grow pr-2">
              {filteredImages.length > 0 ? (
                filteredImages.map((img) => {
                  const isSelected = selectingCover ? product.cover_image === img : galleryFiles.includes(img);
                  return (
                    <div
                      key={img}
                      onClick={() => handleImageSelect(img)}
                      className={`cursor-pointer border-2 p-1 rounded-md transition-all duration-200 ${
                        isSelected
                          ? "border-blue-600 ring-2 ring-blue-300"
                          : "border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      <img
                        src={getPublicUrl(img)}
                        alt={img}
                        className="h-24 w-full object-cover rounded-sm mb-1"
                      />
                      <p className="text-xs truncate text-center text-gray-600">{img}</p>
                    </div>
                  );
                })
              ) : (
                 <div className="col-span-full text-center text-gray-500">Görsel bulunamadı.</div>
              )}
            </div>
             {!selectingCover && (
                 <div className="mt-4 text-right">
                      <button
                          onClick={() => setShowImageModal(false)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
                      >
                          Seçimi Tamamla
                      </button>
                 </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}