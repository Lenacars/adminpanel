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
const PIE_COLORS = [
  CORPORATE_COLOR,
  CORPORATE_COLOR_LIGHT,
  "#b28cce",
  "#c8a2de",
  "#ded1e8",
  "#7a4d9c",
  "#3f225e"
];

export default function KaynakAnaliziPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("1ay");
  const [selectedChart, setSelectedChart] = useState("bar");

  // KPI hesapları
  const toplamAnlasma = stats.reduce((acc, x) => acc + (x.count || 0), 0);
  const toplamCiro = stats.reduce((acc, x) => acc + (x.totalAmount || 0), 0);
  const enYuksek = stats.reduce((max, x) => (x.totalAmount > max ? x.totalAmount : max), 0);
  const enCokGetiren = stats.find(x => x.totalAmount === enYuksek)?.sourceName || "-";

  useEffect(() => {
    setLoading(true);
    fetch(`/api/hubspot/deal-stats-by-source?period=${selectedFilter}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          setStats(data.data);
          setError(null);
        } else {
          setStats([]);
          setError("Gösterilecek veri bulunamadı.");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Veriler yüklenirken hata oluştu.");
        setLoading(false);
      });
  }, [selectedFilter]);

  // PieChart özel label fonksiyonu
  const renderPieLabel = ({ name, percent }: any) =>
    `${name} (${(percent * 100).toFixed(0)}%)`;

  // Grafik render fonksiyonu
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
              dataKey="sourceName"
              angle={-30}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fill: "#555", fontSize: 15, fontWeight: 500 }}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke={CORPORATE_COLOR}
              tick={{ fill: "#555", fontSize: 13 }}
              label={{
                value: "Adet",
                angle: -90,
                position: "insideLeft",
                fill: CORPORATE_COLOR,
                fontSize: 15,
                fontWeight: 700,
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={CORPORATE_COLOR_LIGHT}
              tickFormatter={(val: any) => `₺${Number(val).toLocaleString("tr-TR")}`}
              tick={{ fill: "#555", fontSize: 13 }}
              label={{
                value: "Ciro (₺)",
                angle: 90,
                position: "insideRight",
                fill: CORPORATE_COLOR_LIGHT,
                fontSize: 15,
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
              contentStyle={{
                borderRadius: "8px",
                border: `1px solid ${CORPORATE_COLOR_LIGHT}`,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              itemStyle={{ padding: "4px 0", color: CORPORATE_COLOR_DARK }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px", fontSize: 14 }}
              iconType="circle"
              verticalAlign="top"
              align="center"
            />
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
              angle={-30}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fill: "#555", fontSize: 15, fontWeight: 500 }}
            />
            <YAxis yAxisId="left" orientation="left" stroke={CORPORATE_COLOR}
              tick={{ fill: "#555", fontSize: 13 }}
              label={{
                value: "Adet", angle: -90, position: "insideLeft", fill: CORPORATE_COLOR, fontSize: 15, fontWeight: 700
              }}
            />
            <YAxis yAxisId="right" orientation="right" stroke={CORPORATE_COLOR_LIGHT}
              tickFormatter={(val: any) => `₺${Number(val).toLocaleString("tr-TR")}`}
              tick={{ fill: "#555", fontSize: 13 }}
              label={{
                value: "Ciro (₺)", angle: 90, position: "insideRight", fill: CORPORATE_COLOR_LIGHT, fontSize: 15, fontWeight: 700
              }}
            />
            <Tooltip /*...*/ />
            <Legend /*...*/ />
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
              angle={-30}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fill: "#555", fontSize: 15, fontWeight: 500 }}
            />
            <YAxis yAxisId="left" orientation="left" stroke={CORPORATE_COLOR}
              tick={{ fill: "#555", fontSize: 13 }}
              label={{
                value: "Adet", angle: -90, position: "insideLeft", fill: CORPORATE_COLOR, fontSize: 15, fontWeight: 700
              }}
            />
            <YAxis yAxisId="right" orientation="right" stroke={CORPORATE_COLOR_LIGHT}
              tickFormatter={(val: any) => `₺${Number(val).toLocaleString("tr-TR")}`}
              tick={{ fill: "#555", fontSize: 13 }}
              label={{
                value: "Ciro (₺)", angle: 90, position: "insideRight", fill: CORPORATE_COLOR_LIGHT, fontSize: 15, fontWeight: 700
              }}
            />
            <Tooltip /*...*/ />
            <Legend /*...*/ />
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
              angle={-30}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fill: "#555", fontSize: 15, fontWeight: 500 }}
            />
            <YAxis yAxisId="left" orientation="left" stroke={CORPORATE_COLOR}
              tick={{ fill: "#555", fontSize: 13 }}
              label={{
                value: "Adet", angle: -90, position: "insideLeft", fill: CORPORATE_COLOR, fontSize: 15, fontWeight: 700
              }}
            />
            <YAxis yAxisId="right" orientation="right" stroke={CORPORATE_COLOR_LIGHT}
              tickFormatter={(val: any) => `₺${Number(val).toLocaleString("tr-TR")}`}
              tick={{ fill: "#555", fontSize: 13 }}
              label={{
                value: "Ciro (₺)", angle: 90, position: "insideRight", fill: CORPORATE_COLOR_LIGHT, fontSize: 15, fontWeight: 700
              }}
            />
            <Tooltip /*...*/ />
            <Legend /*...*/ />
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
          <PieChart width={700} height={430}>
            <Tooltip /*...*/ />
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
  }

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
          <button
            key={f.key}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ease-in-out shadow-sm
              ${selectedFilter === f.key
                ? "text-white shadow-lg transform scale-105"
                : ""
              }`}
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

      {/* KPI Kutuları */}
      <div className="flex justify-center gap-8 mb-8 flex-wrap">
        <div className="bg-white shadow rounded-xl p-6 min-w-[160px] text-center border">
          <div className="text-md text-gray-500 font-medium">Toplam Anlaşma</div>
          <div className="text-2xl font-bold" style={{ color: CORPORATE_COLOR }}>{toplamAnlasma}</div>
        </div>
        <div className="bg-white shadow rounded-xl p-6 min-w-[160px] text-center border">
          <div className="text-md text-gray-500 font-medium">Toplam Ciro</div>
          <div className="text-2xl font-bold" style={{ color: CORPORATE_COLOR_LIGHT }}>
            ₺{Number(toplamCiro).toLocaleString("tr-TR")}
          </div>
        </div>
        <div className="bg-white shadow rounded-xl p-6 min-w-[210px] text-center border">
          <div className="text-md text-gray-500 font-medium">En Çok Getiren Kanal</div>
          <div className="text-xl font-bold" style={{ color: CORPORATE_COLOR_DARK }}>{enCokGetiren}</div>
          <div className="text-md" style={{ color: CORPORATE_COLOR_LIGHT }}>
            {enYuksek ? `₺${Number(enYuksek).toLocaleString("tr-TR")}` : ""}
          </div>
        </div>
      </div>

      {/* Grafik Tipi Butonları */}
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

      {/* Grafik Alanı */}
      <section className="bg-white rounded-2xl shadow-xl p-6 md:p-10 mb-8" style={{ height: 650, minHeight: 500 }}>
        {loading ? (
          <div className="flex justify-center items-center h-full text-xl text-gray-600">Yükleniyor...</div>
        ) : error ? (
          <div className="text-red-700 text-center">{error}</div>
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
