"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  ComposedChart,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import * as XLSX from "xlsx"; // Excel Export için

// --- Yardımcı Sabitler ---
const filters = [
  { key: "1ay", label: "Son 1 Ay" },
  { key: "6ay", label: "Son 6 Ay" },
  { key: "12ay", label: "Son 12 Ay" },
  { key: "24ay", label: "Son 24 Ay" },
  { key: "36ay", label: "Son 36 Ay" },
];

const chartTypes = [
  { key: "bar", label: "Çubuk Grafik" },
  { key: "line", label: "Çizgi Grafik" },
  { key: "area", label: "Alan Grafik" },
  { key: "composed", label: "Kombine Grafik" },
  { key: "pie", label: "Pasta Grafik" }
];

// Kurumsal Renkler
const CORPORATE_COLOR = "#6A3C96";
const CORPORATE_COLOR_LIGHT = "#9a6cb6";
const CORPORATE_COLOR_DARK = "#4d296b";
const KPI_BG = "#F4EFFC";

// Pasta Grafik Renkleri
const PIE_COLORS = [
  CORPORATE_COLOR,
  CORPORATE_COLOR_LIGHT,
  "#b28cce", "#c8a2de", "#ded1e8", "#7a4d9c", "#3f225e"
];

// --- Yardımcı Fonksiyonlar ---
// Kaynak Analizi için KPI verisi çıkaran fonksiyon (güncellendi)
function getSourceKpis(stats: any[]) {
  const totalDeals = stats.reduce((sum, s) => sum + (s.count || 0), 0);
  const totalAmount = stats.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

  const highestSource = stats.reduce((maxSource, currentSource) => {
    return (currentSource.totalAmount || 0) > (maxSource.totalAmount || 0) ? currentSource : maxSource;
  }, { sourceName: "Yok", totalAmount: 0 }); // Başlangıç değeri

  return {
    totalDeals,
    totalAmount,
    highestSourceAmount: highestSource.totalAmount,
    highestSourceName: highestSource.sourceName,
  };
}

// PieChart özel label fonksiyonu (yüzde olarak gösterim)
const renderPieLabel = ({ name, percent }: any) =>
  `${name} (${(percent * 100).toFixed(0)}%)`;

// --- Yeni Component'ler ---

interface KpiCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
  bgColor?: string;
}

// KPI Kartı Component'i
const KpiCard: React.FC<KpiCardProps> = ({ label, value, subValue, color = CORPORATE_COLOR_DARK, bgColor = KPI_BG }) => (
  <div className="bg-white shadow rounded-xl p-6 min-w-[160px] text-center border" style={{ background: bgColor }}>
    <div className="text-md text-gray-500 font-medium">{label}</div>
    <div className="text-2xl font-bold" style={{ color: color }}>{value}</div>
    {subValue && <div className="text-md" style={{ color: CORPORATE_COLOR_LIGHT }}>{subValue}</div>}
  </div>
);

interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  isLoading: boolean;
}

// Filtre Butonu Component'i
const FilterButton: React.FC<FilterButtonProps> = ({ label, isActive, onClick, isLoading }) => (
  <button
    className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ease-in-out shadow-sm
      ${isActive ? "text-white shadow-lg transform scale-105" : ""}
      ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
    `}
    style={{
      backgroundColor: isActive ? CORPORATE_COLOR : "white",
      color: isActive ? 'white' : CORPORATE_COLOR_DARK,
      borderColor: CORPORATE_COLOR,
    }}
    onClick={onClick}
    disabled={isLoading}
  >
    {label}
  </button>
);

interface ChartTypeButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  isLoading: boolean;
}

// Grafik Tipi Butonu Component'i
const ChartTypeButton: React.FC<ChartTypeButtonProps> = ({ label, isActive, onClick, isLoading }) => (
  <button
    key={label}
    className={`px-6 py-2 rounded-full font-semibold border transition-all duration-200
      ${isActive ? "text-white" : ""}
      ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
    `}
    style={{
      backgroundColor: isActive ? CORPORATE_COLOR : "white",
      color: isActive ? "white" : CORPORATE_COLOR_DARK,
      borderColor: CORPORATE_COLOR,
      boxShadow: isActive ? "0 2px 8px rgba(80,40,130,0.12)" : "none",
    }}
    onClick={onClick}
    disabled={isLoading}
  >
    {label}
  </button>
);


export default function KaynakAnaliziPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("1ay");
  const [selectedChart, setSelectedChart] = useState("bar");

  const fetchData = useCallback(async (period: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/hubspot/deal-stats-by-source?period=${period}`);
      if (!res.ok) {
        console.error("API yanıtı OK değil:", res.status, res.statusText);
        throw new Error("Sunucudan yanıt alınamadı. Lütfen API endpoint'inizi kontrol edin.");
      }
      const data = await res.json();
      
      // Verinin standartlaşmasını burada frontend'de de güvence altına al
      const processedStats = (data.data || []).map((item: any) => ({
        sourceName: item.sourceName || item.name || "Bilinmeyen Kaynak", // Varsayılan değer
        count: item.count || 0,
        totalAmount: item.totalAmount || 0,
      }));

      if (processedStats.length > 0) {
        setStats(processedStats);
        setError(null);
      } else {
        setStats([]);
        setError("Seçili döneme ait kaynak verisi bulunamadı.");
      }
    } catch (err: any) {
      console.error("Veri çekme hatası:", err);
      setError("Veriler yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }, []); // Bağımlılık yok, bir kere oluşturulacak

  useEffect(() => {
    fetchData(selectedFilter);
  }, [selectedFilter, fetchData]); // fetchData useCallback olduğu için bu OK

  // KPI hesaplama - useMemo ile gereksiz hesaplamayı engelle
  const kpis = useMemo(() => getSourceKpis(stats), [stats]);

  // Grafik render fonksiyonu (Aynı kodun devamı, sadeleştirildi)
  const renderChart = useCallback(() => {
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
              dataKey="sourceName"
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
                fontWeight: 700,
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={CORPORATE_COLOR_LIGHT}
              tickFormatter={(val: any) => `₺${Number(val).toLocaleString("tr-TR")}`}
              tick={{ fill: "#555", fontSize: 12 }}
              label={{
                value: "Ciro (₺)",
                angle: 90,
                position: "insideRight",
                fill: CORPORATE_COLOR_LIGHT,
                fontSize: 14,
                fontWeight: 700,
              }}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
              formatter={(value: any, name: string) => {
                if (name === "Toplam Tutar" || name === "Ciro (₺)" || name === "totalAmount")
                  return `₺${Number(value).toLocaleString("tr-TR")}`;
                return value;
              }}
              labelFormatter={(label) => `Kaynak: ${label}`}
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
              dataKey="sourceName"
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
                value: "Adet", angle: -90, position: "insideLeft", fill: CORPORATE_COLOR, fontSize: 15, fontWeight: 700
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={CORPORATE_COLOR_LIGHT}
              tickFormatter={(val: any) => `₺${Number(val).toLocaleString("tr-TR")}`}
              tick={{ fill: "#555", fontSize: 12 }}
              label={{
                value: "Ciro (₺)", angle: 90, position: "insideRight", fill: CORPORATE_COLOR_LIGHT, fontSize: 15, fontWeight: 700
              }}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
              formatter={(value: any, name: string) => {
                if (name === "Toplam Tutar" || name === "Ciro (₺)" || name === "totalAmount")
                  return `₺${Number(value).toLocaleString("tr-TR")}`;
                return value;
              }}
              labelFormatter={(label) => `Kaynak: ${label}`}
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
              dataKey="sourceName"
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
                value: "Adet", angle: -90, position: "insideLeft", fill: CORPORATE_COLOR, fontSize: 15, fontWeight: 700
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={CORPORATE_COLOR_LIGHT}
              tickFormatter={(val: any) => `₺${Number(val).toLocaleString("tr-TR")}`}
              tick={{ fill: "#555", fontSize: 12 }}
              label={{
                value: "Ciro (₺)", angle: 90, position: "insideRight", fill: CORPORATE_COLOR_LIGHT, fontSize: 15, fontWeight: 700
              }}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
              formatter={(value: any, name: string) => {
                if (name === "Toplam Tutar" || name === "Ciro (₺)" || name === "totalAmount")
                  return `₺${Number(value).toLocaleString("tr-TR")}`;
                return value;
              }}
              labelFormatter={(label) => `Kaynak: ${label}`}
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
              dataKey="sourceName"
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
                value: "Adet", angle: -90, position: "insideLeft", fill: CORPORATE_COLOR, fontSize: 15, fontWeight: 700
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={CORPORATE_COLOR_LIGHT}
              tickFormatter={(val: any) => `₺${Number(val).toLocaleString("tr-TR")}`}
              tick={{ fill: "#555", fontSize: 12 }}
              label={{
                value: "Ciro (₺)", angle: 90, position: "insideRight", fill: CORPORATE_COLOR_LIGHT, fontSize: 15, fontWeight: 700
              }}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
              formatter={(value: any, name: string) => {
                if (name === "Toplam Tutar" || name === "Ciro (₺)" || name === "totalAmount")
                  return `₺${Number(value).toLocaleString("tr-TR")}`;
                return value;
              }}
              labelFormatter={(label) => `Kaynak: ${label}`}
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
        // Pie chart için 12'den fazla dilim varsa uyarı göster
        if (stats.length > 12) {
            return (
                <div className="flex justify-center items-center h-full text-red-600 text-lg p-4 text-center">
                    Çok fazla kaynak olduğu için Pasta Grafiği verimli görüntülenemiyor.
                    Lütfen filtreyi değiştirin veya başka bir grafik tipi seçin.
                </div>
            );
        }
        return (
          <PieChart width={700} height={430}>
            <Tooltip
              formatter={(value: any) => value}
              labelFormatter={(label) => `Kaynak: ${label}`}
              contentStyle={{ borderRadius: "8px", border: `1px solid ${CORPORATE_COLOR_LIGHT}`, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              itemStyle={{ padding: "4px 0", color: CORPORATE_COLOR_DARK }}
            />
            <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 16 }} />
            <Pie
              data={stats.map(s => ({ ...s, value: s.count }))}
              dataKey="value"
              nameKey="sourceName"
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
  }, [selectedChart, stats]); // stats değiştiğinde renderChart da yeniden oluşmalı

  // Excel Export fonksiyonu
  const exportToExcel = useCallback(() => {
    if (!stats.length) {
      alert("Dışa aktarılacak veri bulunamadı!");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(stats);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kaynak Analizi Raporu");
    
    const fileName = `kaynak_analizi_raporu_${selectedFilter}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    alert("Veriler Excel'e başarıyla aktarıldı!");
  }, [stats, selectedFilter]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 lg:p-12">
      <header className="mb-2 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: CORPORATE_COLOR_DARK }}>
          Kaynak/Kanal Analizi
        </h1>
        <p className="mt-2 text-lg text-gray-700">Anlaşmaların hangi kaynaklardan geldiği ve getirisini analiz edin.</p>
      </header>

      {/* Filtreleme Butonları */}
      <section className="mb-6 flex justify-center gap-3 flex-wrap">
        {filters.map((f) => (
          <FilterButton
            key={f.key}
            label={f.label}
            isActive={selectedFilter === f.key}
            onClick={() => setSelectedFilter(f.key)}
            isLoading={loading} // Loading durumunda devre dışı bırak
          />
        ))}
        {/* Excel'e Aktar Butonu */}
        <button
          className="ml-4 px-6 py-2 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={exportToExcel}
          disabled={loading || !stats.length} // Veri yoksa veya yükleniyorsa devre dışı bırak
        >
          Excel'e Aktar
        </button>
      </section>

      {/* KPI Kutuları */}
      <div className="flex justify-center gap-8 mb-8 flex-wrap">
        <KpiCard
          label="Toplam Anlaşma"
          value={kpis.totalDeals}
          color={CORPORATE_COLOR}
        />
        <KpiCard
          label="Toplam Ciro"
          value={`₺${Number(kpis.totalAmount).toLocaleString("tr-TR")}`}
          color={CORPORATE_COLOR_LIGHT}
        />
        <KpiCard
          label="En Çok Getiren Kanal"
          value={kpis.highestSourceName !== "Yok" ? kpis.highestSourceName : "Veri Yok"}
          subValue={kpis.highestSourceAmount > 0 ? `₺${Number(kpis.highestSourceAmount).toLocaleString("tr-TR")}` : undefined}
          color={CORPORATE_COLOR_DARK}
        />
      </div>

      {/* Grafik Tipi Butonları */}
      <div className="flex justify-center gap-4 mb-6">
        {chartTypes.map((ct) => (
          <ChartTypeButton
            key={ct.key}
            label={ct.label}
            isActive={selectedChart === ct.key}
            onClick={() => setSelectedChart(ct.key)}
            isLoading={loading} // Loading durumunda devre dışı bırak
          />
        ))}
      </div>

      {/* Grafik Alanı */}
      <section className="bg-white rounded-2xl shadow-xl p-6 md:p-10 mb-8" style={{ height: 650, minHeight: 500 }}>
        {loading ? (
          <div className="flex justify-center items-center h-full text-xl text-gray-600">Veriler Yükleniyor...</div>
        ) : error ? (
          <div className="text-red-700 text-center text-lg font-medium p-4">{error}</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {stats.length > 0 ? renderChart() : (
              <div className="flex justify-center items-center h-full text-gray-500 text-lg">
                Seçili döneme ait grafik verisi bulunamadı.
              </div>
            )}
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}
