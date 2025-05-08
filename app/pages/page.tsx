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

  useEffect(() => {
    fetchPages();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tüm Sayfalar</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pages.map((page) => (
          <div key={page.id} className="border rounded p-4 shadow-sm bg-white">
            <h2 className="text-lg font-bold">{page.title}</h2>
            <p className="text-gray-500 text-sm mb-2">/{page.slug}</p>
            <span className={`inline-block px-2 py-1 text-xs rounded ${page.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
              {page.status === "published" ? "Yayında" : "Taslak"}
            </span>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => router.push(`/pages/edit/${page.id}`)}
                className="bg-blue-500 text-white px-3 py-1 text-sm rounded"
              >
                Düzenle
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
