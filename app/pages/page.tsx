"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Page {
  id: string;
  title: string;
  slug: string;
  status: string;
}

export default function PageList() {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const router = useRouter();

  const fetchPages = async () => {
    const res = await fetch("/api/pages");
    const data = await res.json();
    setPages(data);
    setSelectedPages([]); // Reset selections after fetch
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedPages([]);
      setSelectAll(false);
    } else {
      const allIds = pages.map((p) => p.id);
      setSelectedPages(allIds);
      setSelectAll(true);
    }
  };

  const togglePageSelect = (id: string) => {
    if (selectedPages.includes(id)) {
      setSelectedPages(selectedPages.filter((pid) => pid !== id));
    } else {
      setSelectedPages([...selectedPages, id]);
    }
  };

  const handleDelete = async (id: string) => {
    const onay = confirm("Bu sayfayı silmek istediğinize emin misiniz?");
    if (!onay) return;

    const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("Sayfa silindi.");
      fetchPages();
    } else {
      alert("Silme sırasında hata oluştu.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPages.length === 0) return;
    const onay = confirm(`${selectedPages.length} sayfayı silmek istediğinize emin misiniz?`);
    if (!onay) return;

    for (const id of selectedPages) {
      await fetch(`/api/pages/${id}`, { method: "DELETE" });
    }

    alert("Seçilen sayfalar silindi.");
    fetchPages();
  };

  useEffect(() => {
    fetchPages();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Tüm Sayfalar</h1>
        <div className="flex gap-2">
          <button
            onClick={toggleSelectAll}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm"
          >
            {selectAll ? "Tümünü Bırak" : "Tümünü Seç"}
          </button>
          {selectedPages.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
            >
              Toplu Sil ({selectedPages.length})
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {pages.map((page) => (
          <div
            key={page.id}
            className={`border border-gray-200 rounded-lg p-5 shadow-sm bg-white hover:shadow-md transition-all relative`}
          >
            <input
              type="checkbox"
              className="absolute top-4 left-4 w-4 h-4"
              checked={selectedPages.includes(page.id)}
              onChange={() => togglePageSelect(page.id)}
            />

            <h2 className="text-xl font-semibold text-gray-800 mb-1 pl-6">{page.title}</h2>
            <p className="text-sm text-gray-500 mb-2 pl-6">/{page.slug}</p>

            <span
              className={`inline-block px-2 py-1 text-xs rounded font-medium ${
                page.status === "published"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {page.status === "published" ? "Yayında" : "Taslak"}
            </span>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => router.push(`/pages/edit/${page.id}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-sm rounded"
              >
                Düzenle
              </button>
              <button
                onClick={() => handleDelete(page.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-sm rounded"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
