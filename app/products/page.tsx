"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      if (!session) {
        router.push("/login");
      } else {
        fetchProducts();
      }
    }

    async function fetchProducts() {
      const { data, error } = await supabase.from("Araclar").select("*");
      if (!error) {
        setProducts(data);
        setFiltered(data);
      }
    }

    checkSession();
  }, []);

  useEffect(() => {
    const filteredResults = products.filter((p: any) =>
      p.isim?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(filteredResults);
  }, [search, products]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Bu ürünü silmek istediğinizden emin misiniz?");
    if (!confirmed) return;

    const { error } = await supabase.from("Araclar").delete().eq("id", id);
    if (!error) {
      const updated = products.filter((item) => item.id !== id);
      setProducts(updated);
      setFiltered(updated);
    } else {
      alert("Silme işlemi sırasında bir hata oluştu.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center">
          <h1 className="text-2xl font-bold text-gray-800">Araçlar</h1>
          {session && (
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800 border border-red-600 rounded px-2 py-1"
            >
              Çıkış Yap
            </button>
          )}
        </div>
        <Link
          href="/products/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        >
          + Yeni Ürün
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Araç adıyla ara..."
          className="w-full p-3 border rounded shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg shadow hover:shadow-lg transition bg-white overflow-hidden"
          >
            {item.kapak && (
              <img
                src={item.kapak}
                alt={item.isim}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                {item.isim}
              </h2>
              <p className="text-sm text-gray-600">Yakıt: {item.yakit_tipi}</p>
              <p className="text-sm text-gray-600">Vites: {item.vites_tipi}</p>
              <p className="text-sm text-gray-600">Durum: {item.stok_durumu}</p>
              <div className="mt-3 flex justify-between items-center">
                <Link
                  href={`/products/edit/${item.id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Düzenle
                </Link>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 text-sm hover:underline"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
