"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  ComposedChart,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";

// Tarih seçici için importlar
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // DatePicker stilleri

// Excel dışa aktarım için importlar
import * as XLSX from "xlsx"; // XLSX yerine * as XLSX kullanmak daha yaygındır
// import { utils, writeFile } from "xlsx"; // Yukarıdaki gibi de import edilebilir


// Filtre seçenekleri
const filters = [
  { key: "1ay", label: "Son 1 Ay" },
  { key: "6ay", label: "Son 6 Ay" },
  { key: "12ay", label: "Son 12 Ay" },
  { key: "24ay", label: "Son 24 Ay" },
  { key: "36ay", label: "Son 36 Ay" },
];

// Grafik seçenekleri
const chartTypes = [
  { key: "bar", label: "Çubuk Grafik" },
  { key: "line", label: "Çizgi Grafik" },
  { key: "area", label: "Alan Grafik" },
  { key: "composed", label: "Kombine Grafik" },
  { key: "pie", label: "Pasta Grafik" }
];

// Kurumsal Renkler
const CORPORATE_COLOR = "#6A3C96"; // Ana kurumsal renk
const CORPORATE_COLOR_LIGHT = "#9a6cb6"; // Daha açık ton
const CORPORATE_COLOR_DARK = "#4d296b"; // Daha koyu ton
const KPI_BG = "#F4EFFC";

// Pasta Grafik Renkleri
const PIE_COLORS = [
  CORPORATE_COLOR,
  CORPORATE_COLOR_LIGHT,
  "#b28cce", "#c8a2de", "#ded1e8", "#7a4d9c", "#3f225e"
];

// -- ÖNEMLİ: stats'ten özet KPI verisi çıkaran fonksiyon
function getKpis(stats: any[]) {
  const totalDeals = stats.reduce((sum, s) => sum + (s.count || 0), 0);
  const kazandi = stats.find(s => (s.name || "").toLowerCase().includes("kazandı")) || { count: 0, totalAmount: 0 };
  const kaybetti = stats.find(s => (s.name || "").toLowerCase().includes("kaybetti")) || { count: 0, totalAmount: 0 };
  const totalAmount = stats.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const avgAmount = totalDeals > 0 ? totalAmount / totalDeals : 0;
  const winRate = totalDeals > 0 ? (kazandi.count / totalDeals) * 100 : 0;
  return {
    totalDeals,
    kazandiCount: kazandi.count,
    kaybettiCount: kaybetti.count,
    totalAmount,
    avgAmount,
    winRate,
  };
}

export default function RaporlamaPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("1ay");
  const [selectedChart, setSelectedChart] = useState("bar"); // Başlangıçta Çubuk Grafik seçili

  // --- YENİ EKLENEN STATE'LER ---
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  // ------------------------------

  // Veri çekme fonksiyonu - Tarih aralığını da destekleyecek şekilde güncellendi
  const fetchData = (period?: string, start?: Date | null, end?: Date | null) => {
    setLoading(true);
    setError(null); // Yeni fetch'te hatayı temizle

    let apiUrl = `/api/hubspot/deal-stats`;
    if (period) {
      apiUrl += `?period=${period}`;
    } else if (start && end) {
      // Tarih aralığı varsa, API'ye başlangıç ve bitiş tarihini gönder
      apiUrl += `?startDate=${start.toISOString()}&endDate=${end.toISOString()}`;
    }

    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) {
          console.error("API yanıtı OK değil:", res.status, res.statusText);
          throw new Error("Sunucudan yanıt alınamadı.");
        }
        return res.json();
      })
      .then((data) => {
        console.log("API'dan gelen data:", data);
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
            setStats(data.data);
            setError(null);
        } else {
            setStats([]);
            setError("Gösterilecek veri bulunamadı. Filtreyi veya tarih aralığını değiştirerek deneyin.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Veri çekme hatası:", err);
        setError("Veriler yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.");
        setLoading(false);
      });
  };

  // useEffect - selectedFilter değiştiğinde veri çeker
  useEffect(() => {
    // Özel tarih aralığı seçili değilse filtreye göre veri çek
    if (!startDate && !endDate) {
      fetchData(selectedFilter);
    }
  }, [selectedFilter, startDate, endDate]); // startDate ve endDate de dinlenmeli ki, eğer seçilirse bu useEffect tekrar çalışmasın

  // Tarih aralığı seçildiğinde çalışacak özel fetch fonksiyonu
  const fetchWithDateRange = () => {
    if (startDate && endDate) {
      // Filtre seçimini sıfırla, çünkü özel tarih aralığı kullanılıyor
      setSelectedFilter("");
      fetchData(undefined, startDate, endDate);
    }
  };

  // --- EXCEL EXPORT FONKSİYONU ---
  const exportToExcel = () => {
    if (!stats.length) {
      alert("Dışa aktarılacak veri bulunamadı!");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(stats);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rapor");
    // Dosya adını dinamik olarak oluştur (filtreye veya tarihe göre)
    let fileName = `hubspot_rapor`;
    if (selectedFilter) {
      fileName += `_${selectedFilter}`;
    } else if (startDate && endDate) {
      fileName += `_${startDate.toISOString().slice(0, 10)}_${endDate.toISOString().slice(0, 10)}`;
    }
    fileName += `_${new Date().toISOString().slice(0, 10)}.xlsx`;

    XLSX.writeFile(wb, fileName);
    alert("Veriler Excel'e başarıyla aktarıldı!");
  };
  // ------------------------------

  // KPI hesaplama
  const kpis = getKpis(stats);

  // Pie label
  const renderPieLabel = ({ name, percent }: any) =>
    `${name} (${(percent * 100).toFixed(0)}%)`;

  // Grafik render (Aynı kodun devamı, sadeleştirildi)
  function renderChart() {
    const chartProps = {
      data: stats,
      margin: { top: 20, right: 50, left: 40, bottom: 120 },
    };
    switch (selectedChart) {
      case "bar":
        return (
          <BarChart {...chartProps} barCategoryGap={30} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={120}
              interval={0}
              tickFormatter={(value) =>
                value.length > 15 ? value.substring(0, 15) + "..." : value
              }
              tick={{ fill: "#555", fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke={CORPORATE_COLOR}
              tick={{ fill: "#555", fontSize: 12 }}
              label={{
                value: "Anlaşma Adedi",
                angle: -90,
                position: "insideLeft",
                fill: CORPORATE_COLOR,
                fontSize: 14,
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={CORPORATE_COLOR_LIGHT}
              tickFormatter={(val: any) => `₺${Number(val).toLocaleString("tr-TR")}`}
              tick={{ fill: "#555", fontSize: 12 }}
              label={{
                value: "Toplam Tutar (₺)",
                angle: 90,
                position: "insideRight",
                fill: CORPORATE_COLOR_LIGHT,
                fontSize: 14,
              }}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
              formatter={(value: any, name: string) => {
                if (name === "Toplam Tutar") {
                  return `₺${Number(value).toLocaleString("tr-TR")}`;
                }
                return value;
              }}
              labelFormatter={(label) => `Aşama: ${label}`}
              contentStyle={{ borderRadius: "8px", border: `1px solid ${CORPORATE_COLOR_LIGHT}`, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              itemStyle={{ padding: "4px 0", color: CORPORATE_COLOR_DARK }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px", fontSize: 14 }} iconType="circle" verticalAlign="top" align="center" />
            <Bar
              yAxisId="left"
              dataKey="count"
              fill={CORPORATE_COLOR}
              name="Anlaşma Adedi"
              barSize={28}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="totalAmount"
              fill={CORPORATE_COLOR_LIGHT}
              name="Toplam Tutar"
              barSize={28}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );
      case "line":
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={120}
              interval={0}
              tickFormatter={(value) =>
                value.length > 15 ? value.substring(0, 15) + "..." : value
              }
              tick={{ fill: "#555", fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke={CORPORATE_COLOR}
              tick={{ fill: "#555", fontSize: 12 }}
              label={{
                value: "Anlaşma Adedi",
                angle: -90,
                position: "insideLeft",
                fill: CORPORATE_COLOR,
                fontSize: 14,
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={CORPORATE_COLOR_LIGHT}
              tickFormatter={(val: any) => `₺${Number(val).toLocaleString("tr-TR")}`}
              tick={{ fill: "#555", fontSize: 12 }}
              label={{
                value: "Toplam Tutar (₺)",
                angle: 90,
                position: "insideRight",
                fill: CORPORATE_COLOR_LIGHT,
                fontSize: 14,
              }}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
              formatter={(value: any, name: string) => {
                if (name === "Toplam Tutar") {
                  return `₺${Number(value).toLocaleString("tr-TR")}`;
                }
                return value;
              }}
              labelFormatter={(label) => `Aşama: ${label}`}
              contentStyle={{ borderRadius: "8px", border: `1px solid ${CORPORATE_COLOR_LIGHT}`, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              itemStyle={{ padding: "4px 0", color: CORPORATE_COLOR_DARK }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px", fontSize: 14 }} iconType="circle" verticalAlign="top" align="center" />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="count"
              stroke={CORPORATE_COLOR}
              strokeWidth={3}
              name="Anlaşma Adedi"
              dot={{ r: 7 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="totalAmount"
              stroke={CORPORATE_COLOR_LIGHT}
              strokeWidth={3}
              name="Toplam Tutar"
              dot={{ r: 7 }}
            />
          </LineChart>
        );
      case "area":
        return (
          <AreaChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={120}
              interval={0}
              tickFormatter={(value) =>
                value.length > 15 ? value.substring(0, 15) + "..." : value
              }
              tick={{ fill: "#555", fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke={CORPORATE_COLOR}
              tick={{ fill: "#555", fontSize: 12 }}
              label={{
                value: "Anlaşma Adedi",
                angle: -90,
                position: "insideLeft",
                fill: CORPORATE_COLOR,
                fontSize: 14,
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={CORPORATE_COLOR_LIGHT}
              tickFormatter={(val: any) => `₺${Number(val).toLocaleString("tr-TR")}`}
              tick={{ fill: "#555", fontSize: 12 }}
              label={{
                value: "Toplam Tutar (₺)",
                angle: 90,
                position: "insideRight",
                fill: CORPORATE_COLOR_LIGHT,
                fontSize: 14,
              }}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
              formatter={(value: any, name: string) => {
                if (name === "Toplam Tutar") {
                  return `₺${Number(value).toLocaleString("tr-TR")}`;
                }
                return value;
              }}
              labelFormatter={(label) => `Aşama: ${label}`}
              contentStyle={{ borderRadius: "8px", border: `1px solid ${CORPORATE_COLOR_LIGHT}`, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              itemStyle={{ padding: "4px 0", color: CORPORATE_COLOR_DARK }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px", fontSize: 14 }} iconType="circle" verticalAlign="top" align="center" />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="count"
              stroke={CORPORATE_COLOR}
              fill={CORPORATE_COLOR}
              fillOpacity={0.25}
              name="Anlaşma Adedi"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="totalAmount"
              stroke={CORPORATE_COLOR_LIGHT}
              fill={CORPORATE_COLOR_LIGHT}
              fillOpacity={0.18}
              name="Toplam Tutar"
            />
          </AreaChart>
        );
      case "composed":
        return (
          <ComposedChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={120}
              interval={0}
              tickFormatter={(value) =>
                value.length > 15 ? value.substring(0, 15) + "..." : value
              }
              tick={{ fill: "#555", fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke={CORPORATE_COLOR}
              tick={{ fill: "#555", fontSize: 12 }}
              label={{
                value: "Anlaşma Adedi",
                angle: -90,
                position: "insideLeft",
                fill: CORPORATE_COLOR,
                fontSize: 14,
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={CORPORATE_COLOR_LIGHT}
              tickFormatter={(val: any) => `₺${Number(val).toLocaleString("tr-TR")}`}
              tick={{ fill: "#555", fontSize: 12 }}
              label={{
                value: "Toplam Tutar (₺)",
                angle: 90,
                position: "insideRight",
                fill: CORPORATE_COLOR_LIGHT,
                fontSize: 14,
              }}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
              formatter={(value: any, name: string) => {
                if (name === "Toplam Tutar") {
                  return `₺${Number(value).toLocaleString("tr-TR")}`;
                }
                return value;
              }}
              labelFormatter={(label) => `Aşama: ${label}`}
              contentStyle={{ borderRadius: "8px", border: `1px solid ${CORPORATE_COLOR_LIGHT}`, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              itemStyle={{ padding: "4px 0", color: CORPORATE_COLOR_DARK }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px", fontSize: 14 }} iconType="circle" verticalAlign="top" align="center" />
            <Bar
              yAxisId="left"
              dataKey="count"
              fill={CORPORATE_COLOR}
              name="Anlaşma Adedi"
              barSize={24}
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="totalAmount"
              stroke={CORPORATE_COLOR_LIGHT}
              strokeWidth={3}
              name="Toplam Tutar"
              dot={{ r: 6 }}
            />
          </ComposedChart>
        );
      case "pie":
        return (
          <PieChart width={600} height={430}>
            <Tooltip
              formatter={(value: any) => value}
              labelFormatter={(label) => `Aşama: ${label}`}
            />
            <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 16 }} />
            <Pie
              data={stats.map(s => ({ ...s, value: s.count }))}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="48%"
              outerRadius={170}
              innerRadius={60}
              label={renderPieLabel}
              labelLine={false}
              isAnimationActive
            >
              {stats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 lg:p-12">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: CORPORATE_COLOR_DARK }}>
          HubSpot Anlaşma Raporları
        </h1>
        <p className="mt-2 text-lg text-gray-600">Seçili döneme göre anlaşma performansını inceleyin.</p>
      </header>

      {/* --- KPI Kartları --- */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-10 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center bg-white border rounded-xl shadow p-5" style={{ background: KPI_BG }}>
          <span className="text-md text-gray-500 mb-1">Toplam Anlaşma</span>
          <span className="text-2xl font-bold" style={{ color: CORPORATE_COLOR }}>{kpis.totalDeals}</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-white border rounded-xl shadow p-5" style={{ background: KPI_BG }}>
          <span className="text-md text-gray-500 mb-1">Toplam Kazanma</span>
          <span className="text-2xl font-bold" style={{ color: CORPORATE_COLOR_DARK }}>{kpis.kazandiCount}</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-white border rounded-xl shadow p-5" style={{ background: KPI_BG }}>
          <span className="text-md text-gray-500 mb-1">Toplam Kayıp</span>
          <span className="text-2xl font-bold" style={{ color: "#D13C3C" }}>{kpis.kaybettiCount}</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-white border rounded-xl shadow p-5" style={{ background: KPI_BG }}>
          <span className="text-md text-gray-500 mb-1">Toplam Tutar</span>
          <span className="text-2xl font-bold" style={{ color: CORPORATE_COLOR }}>
            ₺{Number(kpis.totalAmount).toLocaleString("tr-TR")}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center bg-white border rounded-xl shadow p-5" style={{ background: KPI_BG }}>
          <span className="text-md text-gray-500 mb-1">Ort. Anlaşma Tutarı</span>
          <span className="text-2xl font-bold" style={{ color: CORPORATE_COLOR }}>
            ₺{Number(kpis.avgAmount).toLocaleString("tr-TR", { maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center bg-white border rounded-xl shadow p-5" style={{ background: KPI_BG }}>
          <span className="text-md text-gray-500 mb-1">Kazanma Oranı</span>
          <span className="text-2xl font-bold" style={{ color: CORPORATE_COLOR_LIGHT }}>
            %{kpis.winRate.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}
          </span>
        </div>
      </section>

      {/* --- Filtreleme ve Tarih Seçici Bölümü --- */}
      <section className="mb-8 flex flex-col sm:flex-row justify-center items-center gap-4 flex-wrap">
        {/* Hazır filtre butonları */}
        {filters.map((f) => (
          <button
            key={f.key}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ease-in-out shadow-sm
              ${selectedFilter === f.key && !startDate // startDate seçili değilse bu filtre aktif
                ? "text-white shadow-lg transform scale-105"
                : ""
              }`}
            style={{
                backgroundColor: selectedFilter === f.key && !startDate ? CORPORATE_COLOR : "white",
                color: selectedFilter === f.key && !startDate ? 'white' : CORPORATE_COLOR_DARK,
                borderColor: CORPORATE_COLOR,
            }}
            onClick={() => {
              setSelectedFilter(f.key);
              setDateRange([null, null]); // Tarih aralığını sıfırla
            }}
          >
            {f.label}
          </button>
        ))}

        {/* Tarih Aralığı Filtresi */}
        <div className="flex items-center gap-3 ml-4">
          <span className="font-medium text-gray-700">Tarih Aralığı:</span>
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update: [Date | null, Date | null]) => {
              setDateRange(update);
              // Eğer her iki tarih de seçiliyse ve daha önce bir filtre seçiliyse onu sıfırla
              if (update[0] && update[1]) {
                setSelectedFilter("");
              }
            }}
            isClearable={true}
            dateFormat="dd.MM.yyyy"
            placeholderText="Tarih seçin"
            className="border p-2 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-300"
            wrapperClassName="w-48" // Genişliği ayarla
          />
          <button
            className={`px-4 py-2 rounded-full font-semibold transition-all duration-200 shadow-sm
              ${(startDate && endDate) // Tarih aralığı seçiliyse buton aktif
                ? "text-white shadow-md transform scale-105"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            style={{
                backgroundColor: (startDate && endDate) ? CORPORATE_COLOR : undefined,
                color: (startDate && endDate) ? 'white' : undefined,
            }}
            onClick={fetchWithDateRange}
            disabled={!startDate || !endDate}
          >
            Filtrele
          </button>
        </div>
        
        {/* Excel'e Aktar Butonu */}
        <button
          className="ml-4 px-6 py-2 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-colors shadow-md"
          onClick={exportToExcel}
        >
          Excel'e Aktar
        </button>
      </section>

      <div className="max-w-7xl mx-auto">
        {/* Özet Kutuları */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {stats.length > 0 ? (
            stats.map((info: any) => (
              <div
                key={info.id || info.name}
                className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 flex flex-col items-center justify-center text-center transform hover:scale-105 transition-transform duration-300 ease-in-out group"
              >
                <h2 className="font-bold text-xl text-gray-700 mb-3 group-hover:text-blue-600 transition-colors" style={{ color: CORPORATE_COLOR_DARK }}>
                  {info.name}
                </h2>
                <div className="text-gray-600 text-base space-y-1">
                  <p>
                    <span className="font-medium">Toplam Anlaşma:</span>{" "}
                    <span className="font-bold text-lg" style={{ color: CORPORATE_COLOR }}>{info.count}</span>
                  </p>
                  <p>
                    <span className="font-medium">Toplam Tutar:</span>{" "}
                    <span className="font-extrabold text-xl" style={{ color: CORPORATE_COLOR_LIGHT }}>
                      ₺{Number(info.totalAmount).toLocaleString("tr-TR")}
                    </span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            // stats boşsa ve hata mesajı yoksa "veri bulunamadı" göster
            !error && <div className="md:col-span-3 text-center text-gray-600 text-lg">
                Seçili döneme ait özet veri bulunamadı.
            </div>
          )}
        </section>

        {/* Başlık + Grafik Tipi Butonları */}
        <section className="bg-white rounded-2xl shadow-xl p-6 md:p-10 mb-8" style={{ height: 800 }}>
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: CORPORATE_COLOR_DARK }}>
            Aşama Bazlı Anlaşma Dağılımı
          </h2>
          {/* Grafik Tipi Butonları */}
          <div className="flex justify-center gap-4 mb-6">
            {chartTypes.map((ct) => (
              <button
                key={ct.key}
                className={`px-6 py-2 rounded-full font-semibold border transition-all duration-200
                  ${selectedChart === ct.key
                    ? "text-white"
                    : ""
                  }`}
                style={{
                  backgroundColor: selectedChart === ct.key ? CORPORATE_COLOR : "white",
                  color: selectedChart === ct.key ? "white" : CORPORATE_COLOR_DARK,
                  borderColor: CORPORATE_COLOR,
                  boxShadow: selectedChart === ct.key ? "0 2px 8px rgba(80,40,130,0.12)" : "none",
                }}
                onClick={() => setSelectedChart(ct.key)}
              >
                {ct.label}
              </button>
            ))}
          </div>
          {/* Grafik */}
          <ResponsiveContainer width="100%" height={600}>
            {stats.length > 0 ? renderChart() : (
                <div className="flex justify-center items-center h-full text-gray-500 text-lg">
                    Seçili döneme ait grafik verisi bulunamadı.
                </div>
            )}
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}
