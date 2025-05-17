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
  const router = useRouter();

  const fetchPages = async () => {
    const res = await fetch("/api/pages");
    const data = await res.json();
    setPages(data);
  };

  const handleDelete = async (id: string) => {
    const onay = confirm("Bu sayfayı silmek istediğinize emin misiniz?");
    if (!onay) return;

    const res = await fetch(`/api/pages/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("Sayfa silindi.");
      fetchPages(); // Listeyi yeniden getir
    } else {
      alert("Silme sırasında hata oluştu.");
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Tüm Sayfalar</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {pages.map((page) => (
          <div
            key={page.id}
            className="border border-gray-200 rounded-lg p-5 shadow-sm bg-white hover:shadow-md transition-all"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-1">{page.title}</h2>
            <p className="text-sm text-gray-500 mb-2">/{page.slug}</p>

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
