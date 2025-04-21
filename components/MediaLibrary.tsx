"use client";

import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";

const MediaLibrary = dynamic(() => import("@/components/MediaLibrary"), { ssr: false });

export default function EditProductPage({ initialData = {} }: any) {
  const [brand, setBrand] = useState(initialData.brand || "");
  const [title, setTitle] = useState(initialData.isim || "");
  const [description, setDescription] = useState(initialData.aciklama || "");
  const [stockCode, setStockCode] = useState(initialData.stok_kodu || "");
  const [condition, setCondition] = useState(initialData.durum || "");
  const [transmission, setTransmission] = useState(initialData.vites || "");
  const [segment, setSegment] = useState(initialData.segment || "");
  const [category, setCategory] = useState(initialData.category || "");
  const [fuel, setFuel] = useState(initialData.yakit || "");
  const [bodyType, setBodyType] = useState(initialData.bodyType || "");
  const [coverFile, setCoverFile] = useState(initialData.cover_image || "");
  const [galleryFiles, setGalleryFiles] = useState<string[]>(initialData.gallery_images || []);
  const [variations, setVariations] = useState(
    initialData.variations?.length
      ? initialData.variations
      : [{ id: uuidv4(), kilometre: "", sure: "", fiyat: "", status: "Yayında" }]
  );
  const [showMedia, setShowMedia] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  const handleSelectCover = (filename: string) => {
    setCoverFile(filename);
    setShowMedia(false);
  };

  const handleSelectGallery = (filenames: string[]) => {
    setGalleryFiles(filenames);
    setShowGallery(false);
  };

  return (
    <div className="p-6 space-y-10 max-w-6xl mx-auto">
      {/* Kapak Görseli */}
      <div className="border rounded p-4 shadow-sm">
        <h2 className="font-semibold mb-2">Ürün görseli</h2>
        <div className="w-full flex flex-col items-center gap-2">
          {coverFile ? (
            <>
              <img
                onClick={() => setShowMedia(true)}
                src={`https://uxnpmdeizkzvnevpceiw.supabase.co/storage/v1/object/public/images/${coverFile}`}
                className="h-48 rounded cursor-pointer border"
                alt="Kapak"
              />
              <button
                className="text-sm text-red-600 hover:underline"
                onClick={() => setCoverFile("")}
              >
                Ürün resmini kaldır
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowMedia(true)}
              className="text-blue-600 hover:underline text-sm"
            >
              Düzenlemek ya da güncellemek için görsele tıklayın
            </button>
          )}
        </div>
      </div>

      {/* Galeri Görselleri */}
      <div className="border rounded p-4 shadow-sm">
        <h2 className="font-semibold mb-2">Ürün galerisi</h2>
        <div className="flex gap-2 overflow-x-auto">
          {galleryFiles.map((filename, index) => (
            <img
              key={index}
              src={`https://uxnpmdeizkzvnevpceiw.supabase.co/storage/v1/object/public/images/${filename}`}
              alt={`galeri-${index}`}
              className="h-20 w-28 object-cover rounded border"
            />
          ))}
        </div>
        <button
          onClick={() => setShowGallery(true)}
          className="mt-3 text-blue-600 hover:underline text-sm"
        >
          Ürün galerisine görsel ekle
        </button>
      </div>

      {showMedia && (
        <MediaLibrary onSelectAction={handleSelectCover} onCloseAction={() => setShowMedia(false)} />
      )}

      {showGallery && (
        <MediaLibrary
          multi={true}
          selected={galleryFiles}
          onSelectAction={handleSelectGallery}
          onCloseAction={() => setShowGallery(false)}
        />
      )}
    </div>
  );
}
