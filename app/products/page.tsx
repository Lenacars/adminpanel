"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { logActivity } from "@/utils/logActivity";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [session, setSession] = useState<any>(null);
  const [filters, setFilters] = useState({
    yakit: "",
    vites: "",
    brand: "",
    segment: "",
    bodyType: "",
    durum: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (!session) router.push("/login");
      else fetchProducts();
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
    const results = products.filter((p: any) =>
      (!filters.yakit || p.yakit_turu === filters.yakit) &&
      (!filters.vites || p.vites === filters.vites) &&
      (!filters.brand || p.brand === filters.brand) &&
      (!filters.segment || p.segment === filters.segment) &&
      (!filters.bodyType || p.bodyType === filters.bodyType) &&
      (!filters.durum || p.durum === filters.durum) &&
      (!search || p.isim?.toLowerCase().includes(search.toLowerCase()))
    );
    setFiltered(results);
    setCurrentPage(1);
  }, [filters, products, search]);

  useEffect(() => {
  async function logla() {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: rolData } = await supabase
        .from("calisanlar")
        .select("rol, ad, soyad")
        .eq("auth_user_id", user.id)
        .single();

      await logActivity({
        user_id: user.id,
        email: user.email ?? "",
        full_name: `${rolData?.ad ?? ""} ${rolData?.soyad ?? ""}`,
        rol: rolData?.rol ?? "bilinmiyor",
        islem: "Ürünler Sayfası görüntülendi",
      });
    }
  }

  logla();
}, []);


  const totalPages = Math.ceil(filtered.length / perPage);
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const paginatedProducts = filtered.slice(start, end);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Bu ürünü silmek istiyor musunuz?");
    if (!confirmed) return;
    const { error } = await supabase.from("Araclar").delete().eq("id", id);
    if (!error) {
      const updated = products.filter((item) => item.id !== id);
      setProducts(updated);
      setFiltered(updated);
    } else alert("Silme hatası!");
  };

  const buildImageUrl = (filename: string) => {
    if (!filename) return "";
    const cleaned = filename.replace(/^\/+/g, "").replace(/\\\\/g, "").replace(/\/+/g, "/");
    return `https://uxnpmdeizkzvnevpceiw.supabase.co/storage/v1/object/public/images/${cleaned}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center">
          <h1 className="text-2xl font-bold text-gray-800">Araçlar</h1>
          {session && (
            <button onClick={handleLogout} className="text-sm text-red-600 border border-red-600 rounded px-2 py-1 hover:text-white hover:bg-red-600">Çıkış Yap</button>
          )}
        </div>
        <Link href="/products/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Yeni Ürün</Link>
      </div>

      {/* Filtreler */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
        <select className="border p-2 rounded" value={filters.yakit} onChange={(e) => setFilters({ ...filters, yakit: e.target.value })}>
          <option value="">Yakıt</option>
          <option value="Benzin">Benzin</option>
          <option value="Dizel">Dizel</option>
          <option value="Elektrik">Elektrik</option>
          <option value="Hibrit">Hibrit</option>
          <option value="Benzin + LPG">Benzin + LPG</option>
        </select>
        <select className="border p-2 rounded" value={filters.vites} onChange={(e) => setFilters({ ...filters, vites: e.target.value })}>
          <option value="">Vites</option>
          <option value="Manuel">Manuel</option>
          <option value="Otomatik">Otomatik</option>
        </select>
        <select className="border p-2 rounded" value={filters.brand} onChange={(e) => setFilters({ ...filters, brand: e.target.value })}>
          <option value="">Marka</option>
          {Array.from(new Set(products.map(p => p.brand))).map((b) => <option key={b}>{b}</option>)}
        </select>
        <select className="border p-2 rounded" value={filters.segment} onChange={(e) => setFilters({ ...filters, segment: e.target.value })}>
          <option value="">Segment</option>
          <option value="Ekonomik">Ekonomik</option>
          <option value="Orta">Orta</option>
          <option value="Orta + Üst">Orta + Üst</option>
          <option value="Lux">Lux</option>
        </select>
        <select className="border p-2 rounded" value={filters.bodyType} onChange={(e) => setFilters({ ...filters, bodyType: e.target.value })}>
          <option value="">Kasa Tipi</option>
          <option value="SUV">SUV</option>
          <option value="Hatchback">Hatchback</option>
          <option value="Sedan">Sedan</option>
          <option value="Crossover">Crossover</option>
        </select>
        <select className="border p-2 rounded" value={filters.durum} onChange={(e) => setFilters({ ...filters, durum: e.target.value })}>
          <option value="">Durum</option>
          <option value="Sıfır">Sıfır</option>
          <option value="İkinci El">İkinci El</option>
        </select>
      </div>

      {/* Arama ve sayfa başı ürün seçimi */}
      <div className="flex justify-between items-center mb-4">
        <input type="text" className="w-full p-3 border rounded shadow-sm mr-4" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Araç adıyla ara..." />
        <select value={perPage} onChange={(e) => setPerPage(parseInt(e.target.value))} className="border p-2 rounded">
          <option value={20}>20 / sayfa</option>
          <option value={50}>50 / sayfa</option>
          <option value={100}>100 / sayfa</option>
        </select>
      </div>

      <p className="text-gray-600 mb-4">Toplam Ürün Sayısı: <span className="font-semibold">{filtered.length}</span></p>

      {/* Ürün Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedProducts.map((item) => (
          <div key={item.id} className="border rounded-lg shadow hover:shadow-lg bg-white overflow-hidden">
            {item.cover_image && (
              <div className="aspect-square w-full overflow-hidden">
                <img src={buildImageUrl(item.cover_image)} alt={item.isim} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{item.isim}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                <p>Yakıt: {item.yakit_turu || "-"}</p>
                <p>Vites: {item.vites || "-"}</p>
                <p>Marka: {item.brand || "-"}</p>
                <p>Segment: {item.segment || "-"}</p>
                <p>Kasa Tipi: {item.bodyType || "-"}</p>
                <p>Durum: {item.durum || "-"}</p>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <Link href={`/products/edit/${item.id}`} className="text-blue-600 hover:underline text-sm">Düzenle</Link>
                <button onClick={() => handleDelete(item.id)} className="text-red-600 text-sm hover:underline">Sil</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-2 flex-wrap">
          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded bg-white text-gray-800 hover:bg-gray-100 disabled:opacity-50">← Önceki</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white text-gray-800 hover:bg-gray-100"}`}>{i + 1}</button>
          ))}
          <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded bg-white text-gray-800 hover:bg-gray-100 disabled:opacity-50">Sonraki →</button>
        </div>
      )}
    </div>
  );
}
