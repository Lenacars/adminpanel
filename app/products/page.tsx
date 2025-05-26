"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// --- Başlangıç: İkon Bileşenleri ---
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);
const PencilSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9a.75.75 0 0 1-.75.75H10.5a.75.75 0 0 1-.75-.75V6.382l-.598-.085A1.875 1.875 0 0 0 7.5 8.25v1.5a.75.75 0 0 1-1.5 0v-1.5A3.375 3.375 0 0 1 9.302 5.2l.598-.085V4.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v.615l.598.085A3.375 3.375 0 0 1 16.5 8.25v1.5a.75.75 0 0 1-1.5 0v-1.5a1.875 1.875 0 0 0-1.652-1.868l-.598-.085V6.382a.75.75 0 0 1-.75-.75H10.5a.75.75 0 0 1-.75.75M10.5 9.75h3M5.25 9.75h.008v.008H5.25v-.008Zm0 0H18.75m-13.5 0V18a2.25 2.25 0 0 0 2.25 2.25h9A2.25 2.25 0 0 0 18.75 18V9.75M5.25 9.75h13.5" />
  </svg>
);
const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);
// --- Bitiş: İkon Bileşenleri ---

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    yakit: "",
    vites: "",
    brand: "",
    segment: "",
    bodyType: "",
    durum: "",
    stok_kodu: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(12); // 0 "Tümünü Göster" anlamına gelecek
  const router = useRouter();

  // --- YENİ: Toplu silme için state ---
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  useEffect(() => {
    async function checkSessionAndFetch() {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (!session) {
        router.push("/login");
        return;
      }
      const { data, error } = await supabase.from("Araclar").select("*, stok_kodu").order('created_at', { ascending: false });
      if (!error) {
        setProducts(data);
        setFiltered(data); // Başlangıçta tüm ürünler filtrelenmiş olarak ayarlanır
      } else {
        console.error("Error fetching products:", error);
      }
      setIsLoading(false);
    }
    checkSessionAndFetch();
  }, [router]);

  useEffect(() => {
    const results = products.filter((p: any) =>
      (!filters.yakit || p.yakit_turu === filters.yakit) &&
      (!filters.vites || p.vites === filters.vites) &&
      (!filters.brand || p.brand === filters.brand) &&
      (!filters.segment || p.segment === filters.segment) &&
      (!filters.bodyType || p.bodyType === filters.bodyType) &&
      (!filters.durum || p.durum === filters.durum) &&
      (!filters.stok_kodu || p.stok_kodu?.toLowerCase().includes(filters.stok_kodu.toLowerCase())) &&
      (!search || p.isim?.toLowerCase().includes(search.toLowerCase()))
    );
    setFiltered(results);
    setCurrentPage(1); // Filtreler değiştiğinde ilk sayfaya dön
    setSelectedProductIds([]); // Filtreler değiştiğinde seçimleri temizle
  }, [filters, products, search]);

  // --- GÜNCELLENDİ: "Tümünü Göster" için paginatedProducts ve totalPages ---
  const paginatedProducts = useMemo(() => {
    if (perPage === 0) { // 0 "Tümünü Göster" demek
      return filtered;
    }
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    return filtered.slice(start, end);
  }, [filtered, currentPage, perPage]);

  const totalPages = useMemo(() => {
    if (perPage === 0 || filtered.length === 0) {
      return 1; // "Tümünü Göster" seçiliyse veya hiç ürün yoksa 1 sayfa
    }
    return Math.ceil(filtered.length / perPage);
  }, [filtered.length, perPage]);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Bu aracı silmek istediğinizden emin misiniz?");
    if (!confirmed) return;
    setIsLoading(true);
    const { error } = await supabase.from("Araclar").delete().eq("id", id);
    if (!error) {
      setProducts((prev) => prev.filter((item) => item.id !== id));
      // filtered state'i products'a bağlı useEffect ile güncellenecek
      setSelectedProductIds(prev => prev.filter(selectedId => selectedId !== id)); // Eğer silinen ID seçiliyse, seçimden kaldır
    } else {
      alert("Silme işlemi sırasında bir hata oluştu!");
    }
    setIsLoading(false);
  };

  // --- YENİ: Toplu Silme Fonksiyonu ---
  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    const confirmed = window.confirm(`${selectedProductIds.length} adet aracı silmek istediğinizden emin misiniz?`);
    if (!confirmed) return;

    setIsLoading(true);
    const { error } = await supabase.from("Araclar").delete().in("id", selectedProductIds);
    setIsLoading(false);

    if (!error) {
      setProducts((prevProducts) => prevProducts.filter((p) => !selectedProductIds.includes(p.id)));
      // filtered state'i products'a bağlı useEffect ile güncellenecek
      setSelectedProductIds([]); // Seçimleri temizle
      alert(`${selectedProductIds.length} araç başarıyla silindi.`);
    } else {
      console.error("Error bulk deleting products:", error);
      alert("Toplu silme işlemi sırasında bir hata oluştu: " + error.message);
    }
  };

  // --- YENİ: Checkbox Değişimlerini Yönetme ---
  const handleProductSelect = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProductIds((prev) => [...prev, productId]);
    } else {
      setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  // --- YENİ: Sayfadaki Tümünü Seç/Bırak ---
  const currentProductIdsOnPage = useMemo(() => paginatedProducts.map(p => p.id), [paginatedProducts]);
  const allOnPageSelected = useMemo(() =>
      currentProductIdsOnPage.length > 0 && currentProductIdsOnPage.every(id => selectedProductIds.includes(id)),
    [currentProductIdsOnPage, selectedProductIds]
  );

  const handleSelectAllOnPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    if (checked) {
      // Sayfadaki tümünü seç (önceden seçili olmayanları ekle)
      const newSelectedIds = Array.from(new Set([...selectedProductIds, ...currentProductIdsOnPage]));
      setSelectedProductIds(newSelectedIds);
    } else {
      // Sayfadaki tümünün seçimini kaldır
      setSelectedProductIds(prev => prev.filter(id => !currentProductIdsOnPage.includes(id)));
    }
  };


  const buildImageUrl = (filename: string) => {
    if (!filename) return "/placeholder-image.png";
    const cleaned = filename.replace(/^\/+/g, "").replace(/\\\\/g, "").replace(/\/+/g, "/");
    return `https://uxnpmdeizkzvnevpceiw.supabase.co/storage/v1/object/public/images/${cleaned}`;
  };

  const uniqueBrands = useMemo(() => Array.from(new Set(products.map(p => p.brand).filter(Boolean))), [products]);

  const FilterSelect = ({ value, onChange, children, defaultOption }: { value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; defaultOption: string; }) => (
    <div className="relative">
      <select
        className={`w-full p-2.5 pr-8 border border-gray-300 rounded-md shadow-sm text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#6A3C96] focus:border-[#6A3C96]
                  appearance-none bg-white hover:border-gray-400`}
        value={value}
        onChange={onChange}
      >
        <option value="">{defaultOption}</option>
        {children}
      </select>
      <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );

  if (isLoading && !session && products.length === 0) { // Sadece ilk yüklemede tam ekran yükleme göster
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-700 text-xl">Yükleniyor...</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Araç Yönetimi</h1>
          <div className="flex items-center gap-3">
            {/* --- YENİ: Toplu Sil Butonu --- */}
            {selectedProductIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 disabled:opacity-60"
              >
                <TrashIcon className="w-4 h-4" />
                Seçili ({selectedProductIds.length}) Sil
              </button>
            )}
            {session && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-red-600 border border-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors duration-150"
              >
                Çıkış Yap
              </button>
            )}
            <Link
              href="/products/new"
              style={{ backgroundColor: "#6A3C96" }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm hover:opacity-90 transition-opacity duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#522d73]"
            >
              <PlusIcon className="w-5 h-5" />
              Yeni Araç Ekle
            </Link>
          </div>
        </div>

        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <FilterSelect value={filters.yakit} onChange={(e) => setFilters({ ...filters, yakit: e.target.value })} defaultOption="Tüm Yakıtlar">
              <option value="Benzin">Benzin</option> <option value="Dizel">Dizel</option> <option value="Elektrik">Elektrik</option> <option value="Hibrit">Hibrit</option> <option value="Benzin + LPG">Benzin + LPG</option>
            </FilterSelect>
            <FilterSelect value={filters.vites} onChange={(e) => setFilters({ ...filters, vites: e.target.value })} defaultOption="Tüm Vitesler">
              <option value="Manuel">Manuel</option> <option value="Otomatik">Otomatik</option>
            </FilterSelect>
            <FilterSelect value={filters.brand} onChange={(e) => setFilters({ ...filters, brand: e.target.value })} defaultOption="Tüm Markalar">
              {uniqueBrands.map((b) => <option key={b} value={b}>{b}</option>)}
            </FilterSelect>
            <FilterSelect value={filters.segment} onChange={(e) => setFilters({ ...filters, segment: e.target.value })} defaultOption="Tüm Segmentler">
              <option value="Ekonomik">Ekonomik</option> <option value="Orta">Orta</option> <option value="Orta + Üst">Orta + Üst</option> <option value="Lux">Lux</option>
            </FilterSelect>
            <FilterSelect value={filters.bodyType} onChange={(e) => setFilters({ ...filters, bodyType: e.target.value })} defaultOption="Tüm Kasa Tipleri">
              <option value="SUV">SUV</option> <option value="Hatchback">Hatchback</option> <option value="Sedan">Sedan</option> <option value="Crossover">Crossover</option>
            </FilterSelect>
            <FilterSelect value={filters.durum} onChange={(e) => setFilters({ ...filters, durum: e.target.value })} defaultOption="Tüm Durumlar">
              <option value="Sıfır">Sıfır</option> <option value="İkinci El">İkinci El</option>
            </FilterSelect>
            <div className="relative">
              <input
                type="text"
                className="w-full p-2.5 pl-10 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#6A3C96] focus:border-[#6A3C96]"
                value={filters.stok_kodu}
                onChange={(e) => setFilters({ ...filters, stok_kodu: e.target.value })}
                placeholder="Stok kodu ile ara..."
              />
              <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <div className="relative">
              <input
                type="text"
                className="w-full p-2.5 pl-10 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#6A3C96] focus:border-[#6A3C96]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Araç adıyla ara..."
              />
              <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 px-1 gap-y-3">
          <p className="text-sm text-gray-600 order-2 sm:order-1">
            <span className="font-semibold text-gray-800">{filtered.length}</span> araç bulundu
            {selectedProductIds.length > 0 && (
                <span className="ml-2 text-blue-600">({selectedProductIds.length} seçili)</span>
            )}
          </p>
          <div className="relative order-1 sm:order-2">
            <select
              value={perPage}
              onChange={(e) => { 
                setPerPage(parseInt(e.target.value)); 
                setCurrentPage(1); 
              }}
              className={`p-2 pr-8 border border-gray-300 rounded-md shadow-sm text-sm
                          focus:outline-none focus:ring-2 focus:ring-[#6A3C96] focus:border-[#6A3C96]
                          appearance-none bg-white hover:border-gray-400`}
            >
              <option value={12}>12 / sayfa</option>
              <option value={16}>16 / sayfa</option>
              <option value={20}>20 / sayfa</option>
              <option value={24}>24 / sayfa</option>
              {/* --- YENİ: "Tümünü Göster" seçeneği (value=0) --- */}
              <option value={0}>Tümünü Göster</option>
            </select>
            <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* --- YENİ: Sayfadaki Tümünü Seç Checkbox --- */}
        {paginatedProducts.length > 0 && (
            <div className="mb-4 flex items-center px-1">
                <input
                    id="select-all-on-page"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-[#6A3C96] focus:ring-[#522d73]"
                    checked={allOnPageSelected}
                    onChange={handleSelectAllOnPageChange}
                    disabled={isLoading}
                />
                <label htmlFor="select-all-on-page" className="ml-2 text-sm text-gray-700">
                    Sayfadaki tümünü seç/bırak
                </label>
            </div>
        )}


        {isLoading && products.length === 0 ? ( // Sadece ilk yüklemede ve ürün yokken göster
          <div className="text-center py-10">
            <p className="text-gray-700 text-lg">Araçlar yükleniyor...</p>
          </div>
        ) : paginatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((item) => (
              <div key={item.id} className="group bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl relative">
                {/* --- YENİ: Araç Seçme Checkbox --- */}
                <div className="absolute top-3 left-3 z-10">
                    <input
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-400 text-[#6A3C96] focus:ring-[#522d73] focus:ring-offset-1 checked:bg-[#6A3C96]"
                        checked={selectedProductIds.includes(item.id)}
                        onChange={(e) => handleProductSelect(item.id, e.target.checked)}
                        onClick={(e) => e.stopPropagation()} // Kartın tıklanmasını engelle
                        aria-label={`Select ${item.isim || 'araç'}`}
                        disabled={isLoading}
                    />
                </div>
                <div className="aspect-video w-full overflow-hidden bg-slate-100">
                  <img
                    src={buildImageUrl(item.cover_image)}
                    alt={item.isim || "Araç Resmi"}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => (e.currentTarget.src = "/placeholder-image.png")}
                  />
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2 truncate" title={item.isim}>{item.isim || "İsimsiz Araç"}</h2>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 mb-4 flex-grow">
                    <p><span className="font-medium text-gray-700">Yakıt:</span> {item.yakit_turu || "-"}</p>
                    <p><span className="font-medium text-gray-700">Vites:</span> {item.vites || "-"}</p>
                    <p><span className="font-medium text-gray-700">Marka:</span> {item.brand || "-"}</p>
                    <p><span className="font-medium text-gray-700">Segment:</span> {item.segment || "-"}</p>
                    <p><span className="font-medium text-gray-700">Kasa:</span> {item.bodyType || "-"}</p>
                    <p><span className="font-medium text-gray-700">Durum:</span> {item.durum || "-"}</p>
                    <p><span className="font-medium text-gray-700">Stok Kodu:</span> {item.stok_kodu || "-"}</p>
                  </div>
                  <div className="mt-auto pt-3 border-t border-gray-100 flex justify-end items-center gap-3">
                    <Link
                      href={`/products/edit/${item.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-md shadow-sm transition-opacity duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1"
                      style={{ backgroundColor: "#6A3C96",  opacity: 0.9 }}
                      onMouseOver={e => e.currentTarget.style.opacity = '1'}
                      onMouseOut={e => e.currentTarget.style.opacity = '0.9'}
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                      Düzenle
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 hover:text-red-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 disabled:opacity-60"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isLoading && // Yükleme bittiyse ve ürün yoksa göster
          <div className="text-center py-10 col-span-full">
            <img src="/no-results.svg" alt="Sonuç Bulunamadı" className="mx-auto mb-4 w-40 h-40" />
            <p className="text-xl text-gray-700">Aradığınız kriterlere uygun araç bulunamadı.</p>
            <p className="text-sm text-gray-500 mt-2">Filtrelerinizi değiştirmeyi veya aramayı sıfırlamayı deneyin.</p>
          </div>
        )}

        {/* --- GÜNCELLENDİ: Sayfalama sadece totalPages > 1 ise gösterilir --- */}
        {totalPages > 1 && !isLoading && paginatedProducts.length > 0 && (
          <div className="mt-8 flex justify-center items-center gap-2 flex-wrap">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Önceki
            </button>
            {Array.from({ length: totalPages }, (_, i) => {
              const pageNum = i + 1;
              const showPage = Math.abs(pageNum - currentPage) < 3 || pageNum === 1 || pageNum === totalPages;
              const isEllipsis = Math.abs(pageNum - currentPage) === 3 && pageNum !== 1 && pageNum !== totalPages && totalPages > 5; // Ellipsis için koşul güncellendi

              if (isEllipsis) {
                // Sadece bir ellipsis göster, mevcut sayfaya göre konumlandır.
                // Örneğin, ... 5 6 7 ... gibi.
                // Eğer ilk ellipsis gösteriliyorsa (1 ... X) veya son ellipsis (X ... N)
                // Bu mantık biraz daha karmaşık olabilir, şimdilik basit tutalım.
                 if (pageNum < currentPage && pageNum === 2 && currentPage > 4) { // 1 ... X
                     return <span key={`ellipsis-start-${i}`} className="px-3 py-2 text-sm text-gray-500">...</span>;
                 }
                 if (pageNum > currentPage && pageNum === totalPages -1 && currentPage < totalPages - 3) { // X ... N
                     return <span key={`ellipsis-end-${i}`} className="px-3 py-2 text-sm text-gray-500">...</span>;
                 }
                 // Aradaki ellipsis için daha basit bir kontrol
                 if(Math.abs(pageNum - currentPage) === 3 && totalPages > 5 && (pageNum > 1 && pageNum < totalPages) ) {
                    return <span key={`ellipsis-mid-${i}`} className="px-3 py-2 text-sm text-gray-500">...</span>;
                 }
                 return null; // Diğer ellipsis durumlarını gizle
              }
              if (!showPage && totalPages > 5) { // Çok fazla sayfa varsa ve gösterilmeyecekse null dön
                return null;
              }
              return (
                <button
                  key={pageNum} // key olarak pageNum kullanmak daha iyi
                  onClick={() => setCurrentPage(pageNum)}
                  disabled={isLoading}
                  className={`px-4 py-2 text-sm border rounded-md transition-colors
                    ${currentPage === pageNum
                      ? `text-white border-[#6A3C96]` 
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:border-gray-400"
                    }
                    ${isLoading ? 'disabled:opacity-50 disabled:cursor-not-allowed' : ''}
                  `}
                  style={currentPage === pageNum ? { backgroundColor: "#6A3C96" } : {}}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || isLoading}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sonraki →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
