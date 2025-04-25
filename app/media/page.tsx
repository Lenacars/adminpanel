"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MediaLibraryPage() {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data, error } = await supabase.storage.from("images").list(undefined, {
      limit: 100,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) {
      console.error("Listeleme hatası:", error);
      return;
    }

    if (data) {
      const urls = await Promise.all(
        data
          .filter(
            (item) =>
              item.name.endsWith(".webp") ||
              item.name.endsWith(".jpg") ||
              item.name.endsWith(".png")
          )
          .map(async (file) => {
            const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(file.name);
            return publicUrlData.publicUrl;
          })
      );
      setImages(urls);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const filePath = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("images").upload(filePath, file);
    setUploading(false);

    if (error) {
      alert("Yükleme başarısız: " + error.message);
    } else {
      fetchImages();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ortam Kütüphanesi</h1>
      <input type="file" onChange={handleUpload} disabled={uploading} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {images.map((url, i) => (
          <img
            key={i}
            src={url}
            alt={`image-${i}`}
            className="w-full h-32 object-cover rounded shadow"
          />
        ))}
      </div>
    </div>
  );
}
