"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

  useEffect(() => {
    setSelectedFiles(selected || []);
  }, [selected]);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase.storage
        .from("images")
        .list("", { sortBy: { column: "created_at", order: "desc" } });

      if (!error && data) {
        setFiles(data.map((f) => f.name));
      }
    };

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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center">
      <div className="bg-white w-[90%] max-w-4xl max-h-[90vh] overflow-hidden rounded shadow-lg flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">📁 Ortam Kütüphanesi</h2>
          <button onClick={onClose} className="text-xl font-bold text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        <div className="p-4 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {files.map((file) => (
            <div
              key={file}
              onClick={() => handleSelect(file)}
              className={`cursor-pointer border rounded p-1 hover:border-purple-500 ${
                selectedFiles.includes(file) ? "border-purple-600" : "border-gray-300"
              }`}
            >
              <img
                src={`https://uxnpmdeizkzvnevpceiw.supabase.co/storage/v1/object/public/images/${file}`}
                className="w-full h-24 object-cover rounded"
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
