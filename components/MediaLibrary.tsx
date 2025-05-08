"use client";

import React, { useEffect, useState } from "react";
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
    const fetchFiles = async () => {
      const { data, error } = await supabase.storage.from("images").list("", {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

      if (!error && data) {
        setFiles(data.map((file) => file.name));
      }
    };

    fetchFiles();
  }, []);

  const handleSelect = (file: string) => {
    if (multi) {
      const already = selectedFiles.includes(file);
      const updated = already
        ? selectedFiles.filter((f) => f !== file)
        : [...selectedFiles, file];
      setSelectedFiles(updated);
    } else {
      onSelect(file);
    }
  };

  const handleConfirm = () => {
    if (multi) {
      onSelect(selectedFiles);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-lg shadow-lg overflow-hidden flex flex-col relative">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">📁 Ortam Kütüphanesi</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-xl"
          >
            &#10005;
          </button>
        </div>

        <div className="p-4 overflow-y-auto grid grid-cols-4 gap-4">
          {files.map((file) => (
            <div
              key={file}
              className={`border rounded p-1 cursor-pointer hover:border-purple-500 ${
                selectedFiles.includes(file) ? "border-purple-600" : ""
              }`}
              onClick={() => handleSelect(file)}
            >
              <img
                src={`https://uxnpmdeizkzvnevpceiw.supabase.co/storage/v1/object/public/images/${file}`}
                alt={file}
                className="object-cover w-full h-24 rounded"
              />
              <p className="text-xs mt-1 truncate text-center">{file}</p>
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
