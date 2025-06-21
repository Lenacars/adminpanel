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
const CORPORATE_COLOR = "#6A3C96";
const CORPORATE_COLOR_LIGHT = "#9a6cb6";
const CORPORATE_COLOR_DARK = "#4d296b";

// Pasta Grafik Renkleri
const PIE_COLORS = [
  CORPORATE_COLOR,
  CORPORATE_COLOR_LIGHT,
  "#b28cce", "#c8a2de", "#ded1e8", "#7a4d9c", "#3f225e"
];

export default function SatisciPerformansPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("1ay");
  const [selectedChart, setSelectedChart] = useState("bar");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/hubspot/deal-stats-by-owner?period=${selectedFilter}`)
      .then(res => res.json())
      .then(res => {
        setStats(res.data || []);
        setError(null);
        setLoading(false);
      })
      .catch(() => {
        setError("Veri alınamadı");
        setLoading(false);
      });
  }, [selectedFilter]);

  // KPI Hesapları
  const totalDeals = stats.reduce((sum, x) => sum + (x.count || 0), 0);
  const totalAmount = stats.reduce((sum, x) => sum + (x.totalAmount || 0), 0);
  const avgDeal = stats.length ? (totalAmount / totalDeals) : 0;

  // Pie chart label
  const renderPieLabel = ({ name, percent }: any) =>
    `${name} (${(percent * 100).toFixed(0)}%)`;

  // Dinamik grafik render fonksiyonu
  function renderChart() {
    const chartProps = {
      data: stats,
      margin: { top: 20, right: 50, left: 40, bottom: 100 },
    };

    switch (selectedChart) {
      case "bar":
        return (
          <BarChart {...chartProps} barCategoryGap={30} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="ownerName" angle={-45} textAnchor="end" height={120} interval={0} tick={{ fill: "#555", fontSize: 12 }} />
            <YAxis yAxisId="left" orientation="left" stroke={CORPORATE_COLOR} tick={{ fill: "#555", fontSize: 12 }} label={{ value: "Adet", angle: -90, position: "insideLeft", fill: CORPORATE_COLOR, fontSize: 14 }} />
            <YAxis yAxisId="right" orientation="right" stroke={CORPORATE_COLOR_LIGHT} tickFormatter={(val: any) => `₺${Number(val).toLocaleString("tr-TR")}`} tick={{ fill: "#555", fontSize: 12 }} label={{ value: "Ciro (₺)", angle: 90, position: "insideRight", fill: CORPORATE_COLOR_LIGHT, fontSize: 14 }} />
            <Tooltip />
            <Legend verticalAlign="top" height={36}/>
            <Bar yAxisId="left" dataKey="count" fill={CORPORATE_COLOR} name="Anlaşma Adedi" barSize={28} />
            <Bar yAxisId="right" dataKey="totalAmount" fill={CORPORATE_COLOR_LIGHT} name="Toplam Tutar" barSize={28} />
          </BarChart>
        );
      case "line":
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="ownerName" angle={-45} textAnchor="end" height={120} interval={0} tick={{ fill: "#555", fontSize: 12 }} />
            <YAxis yAxisId="left" orientation="left" stroke={CORPORATE_COLOR} tick={{ fill: "#555", fontSize: 12 }} label={{ value: "Adet", angle: -90, position: "insideLeft", fill: CORPORATE_COLOR, fontSize: 14 }} />
            <YAxis yAxisId="right" orientation="right" stroke={CORPORATE_COLOR_LIGHT} tickFormatter={(val: any) => `₺${Number(val).toLocaleString("tr-TR")}`} tick={{ fill: "#555", fontSize: 12 }} label={{ value: "Ciro (₺)", angle: 90, position: "insideRight", fill: CORPORATE_COLOR_LIGHT, fontSize: 14 }} />
            <Tooltip />
            <Legend verticalAlign="top" height={36}/>
            <Line yAxisId="left" type="monotone" dataKey="count" stroke={CORPORATE_COLOR} strokeWidth={3} name="Anlaşma Adedi" dot={{ r: 7 }} />
            <Line yAxisId="right" type="monotone" dataKey="totalAmount" stroke={CORPORATE_COLOR_LIGHT} strokeWidth={3} name="Toplam Tutar" dot={{ r: 7 }} />
          </LineChart>
        );
      case "area":
        return (
          <AreaChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="ownerName" angle={-45} textAnchor="end" height={120} interval={0} tick={{ fill: "#555", fontSize: 12 }} />
            <YAxis yAxisId="left" orientation="left" stroke={CORPORATE_COLOR} tick={{ fill: "#555", fontSize: 12 }} label={{ value: "Adet", angle: -90, position: "insideLeft", fill: CORPORATE_COLOR, fontSize: 14 }} />
            <YAxis yAxisId="right" orientation="right" stroke={CORPORATE_COLOR_LIGHT} tickFormatter={(val: any) => `₺${Number(val).toLocaleString("tr-TR")}`} tick={{ fill: "#555", fontSize: 12 }} label={{ value: "Ciro (₺)", angle: 90, position: "insideRight", fill: CORPORATE_COLOR_LIGHT, fontSize: 14 }} />
            <Tooltip />
            <Legend verticalAlign="top" height={36}/>
            <Area yAxisId="left" type="monotone" dataKey="count" stroke={CORPORATE_COLOR} fill={CORPORATE_COLOR} fillOpacity={0.25} name="Anlaşma Adedi" />
            <Area yAxisId="right" type="monotone" dataKey="totalAmount" stroke={CORPORATE_COLOR_LIGHT} fill={CORPORATE_COLOR_LIGHT} fillOpacity={0.18} name="Toplam Tutar" />
          </AreaChart>
        );
      case "composed":
        return (
          <ComposedChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="ownerName" angle={-45} textAnchor="end" height={120} interval={0} tick={{ fill: "#555", fontSize: 12 }} />
            <YAxis yAxisId="left" orientation="left" stroke={CORPORATE_COLOR} tick={{ fill: "#555", fontSize: 12 }} label={{ value: "Adet", angle: -90, position: "insideLeft", fill: CORPORATE_COLOR, fontSize: 14 }} />
            <YAxis yAxisId="right" orientation="right" stroke={CORPORATE_COLOR_LIGHT} tickFormatter={(val: any) => `₺${Number(val).toLocaleString("tr-TR")}`} tick={{ fill: "#555", fontSize: 12 }} label={{ value: "Ciro (₺)", angle: 90, position: "insideRight", fill: CORPORATE_COLOR_LIGHT, fontSize: 14 }} />
            <Tooltip />
            <Legend verticalAlign="top" height={36}/>
            <Bar yAxisId="left" dataKey="count" fill={CORPORATE_COLOR} name="Anlaşma Adedi" barSize={24} />
            <Line yAxisId="right" type="monotone" dataKey="totalAmount" stroke={CORPORATE_COLOR_LIGHT} strokeWidth={3} name="Toplam Tutar" dot={{ r: 6 }} />
          </ComposedChart>
        );
      case "pie":
        return (
          <PieChart width={600} height={430}>
            <Tooltip
              formatter={(value: any) => value}
              labelFormatter={(label) => `Satışçı: ${label}`}
              contentStyle={{
                borderRadius: "8px",
                border: `1px solid ${CORPORATE_COLOR_LIGHT}`,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              itemStyle={{ padding: "4px 0", color: CORPORATE_COLOR_DARK }}
            />
            <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 16 }} />
            <Pie
              data={stats.map(s => ({ ...s, value: s.count }))}
              dataKey="value"
              nameKey="ownerName"
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
        <h1 className="text-3xl font-extrabold" style={{ color: CORPORATE_COLOR }}>Satışçı Bazında Performans</h1>
        <p className="mt-2 text-gray-700">Her satışçı için toplam anlaşma ve ciro.</p>
      </header>

      {/* Filtreleme Butonları */}
      <section className="mb-4 flex justify-center gap-3 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ease-in-out shadow-sm
              ${selectedFilter === f.key ? "text-white shadow-lg transform scale-105" : ""}`}
            style={{
                backgroundColor: selectedFilter === f.key ? CORPORATE_COLOR : "white",
                color: selectedFilter === f.key ? 'white' : CORPORATE_COLOR_DARK,
                borderColor: CORPORATE_COLOR,
            }}
            onClick={() => setSelectedFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </section>

      {/* KPI Alanı */}
      <div className="flex flex-wrap gap-6 mb-8 justify-center">
        <div className="bg-white rounded-xl shadow p-6 min-w-[200px] text-center">
          <div className="text-gray-500 mb-2">Toplam Anlaşma</div>
          <div className="text-2xl font-bold" style={{ color: CORPORATE_COLOR }}>{totalDeals}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 min-w-[200px] text-center">
          <div className="text-gray-500 mb-2">Toplam Ciro</div>
          <div className="text-2xl font-bold" style={{ color: CORPORATE_COLOR_LIGHT }}>₺{totalAmount.toLocaleString("tr-TR")}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 min-w-[200px] text-center">
          <div className="text-gray-500 mb-2">Ortalama Anlaşma Tutarı</div>
          <div className="text-2xl font-bold" style={{ color: CORPORATE_COLOR_DARK }}>
            ₺{isNaN(avgDeal) ? 0 : avgDeal.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Grafik Tipi Seçici */}
      <section className="bg-white rounded-2xl shadow-xl p-6 md:p-10 mb-8" style={{ height: 800 }}>
        <div className="flex justify-center gap-4 mb-6">
          {chartTypes.map((ct) => (
            <button
              key={ct.key}
              className={`px-6 py-2 rounded-full font-semibold border transition-all duration-200
                ${selectedChart === ct.key ? "text-white" : ""}`}
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
  );
}
