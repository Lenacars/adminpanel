"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

interface MediaLibraryProps {
  multi?: boolean;
  selected?: string[];
  onSelect: (filename: string | string[]) => void;
  onClose: () => void;
}

export default function MediaLibrary({
  multi = false,
  selected = [],
  onSelect,
  onClose,
}: MediaLibraryProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSelectedFiles(selected || []);
  }, [selected]);

  const fetchImages = async () => {
    const { data, error } = await supabase.storage
      .from("images")
      .list("", { sortBy: { column: "created_at", order: "desc" } });

    if (!error && data) {
      setFiles(data.map((f) => f.name));
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleSelect = (file: string) => {
    if (multi) {
      const updated = selectedFiles.includes(file)
        ? selectedFiles.filter((f) => f !== file)
        : [...selectedFiles, file];
      setSelectedFiles(updated);
    } else {
      onSelect(file);
      onClose();
    }
  };

  const handleConfirm = () => {
    onSelect(selectedFiles);
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${ext}`;

    const { error } = await supabase.storage
      .from("images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      alert("Yükleme hatası: " + error.message);
    } else {
      await fetchImages();
    }

    setUploading(false);
    e.target.value = ""; // input sıfırla
  };

  const filteredFiles = files.filter((file) =>
    file.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center">
      <div className="bg-white w-[90%] max-w-4xl max-h-[90vh] overflow-hidden rounded shadow-lg flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">📁 Ortam Kütüphanesi</h2>
          <button
            onClick={onClose}
            className="text-xl font-bold text-gray-500 hover:text-black p-2 rounded hover:bg-gray-200"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 pt-4">
          <div className="flex gap-2 items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              hidden
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 text-sm rounded"
              disabled={uploading}
            >
              {uploading ? "Yükleniyor..." : "+ Yeni Görsel Yükle"}
            </button>
            {uploading && (
              <span className="text-sm text-gray-600 ml-2">⏳ Yükleniyor...</span>
            )}
          </div>

          <input
            type="text"
            placeholder="🔍 Görsel adına göre filtrele..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-2 py-1 rounded text-sm w-full md:w-64"
          />
        </div>

        <div className="p-4 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {filteredFiles.map((file) => (
            <div
              key={file}
              onClick={() => handleSelect(file)}
              className={`cursor-pointer border rounded p-1 hover:border-purple-500 ${
                selectedFiles.includes(file)
                  ? "border-purple-600"
                  : "border-gray-300"
              }`}
            >
              <img
                src={`https://uxnpmdeizkzvnevpceiw.supabase.co/storage/v1/object/public/images/${file}`}
                className="w-full h-24 object-cover rounded"
                alt={file}
              />
              <p className="text-[11px] truncate text-center mt-1">{file}</p>
            </div>
          ))}
        </div>

        {multi && (
          <div className="p-4 border-t text-right">
            <button
              onClick={handleConfirm}
              className="bg-[#6A3C96] text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Seçimi Onayla
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
