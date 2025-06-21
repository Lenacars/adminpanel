"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

// Filtre seçenekleri
const filters = [
  { key: "1ay", label: "Son 1 Ay" },
  { key: "6ay", label: "Son 6 Ay" },
  { key: "12ay", label: "Son 12 Ay" },
  { key: "24ay", label: "Son 24 Ay" },
  { key: "36ay", label: "Son 36 Ay" },
];

// Grafik tipi seçenekleri
const chartTypes = [
  { key: "bar", label: "Çubuk Grafik" },
  { key: "line", label: "Çizgi Grafik" },
  { key: "area", label: "Alan Grafik" },
];

const CORPORATE_COLOR = "#6A3C96";
const CORPORATE_COLOR_LIGHT = "#9a6cb6";
const CORPORATE_COLOR_DARK = "#4d296b";

export default function RaporlamaPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("1ay");
  const [selectedChart, setSelectedChart] = useState("bar");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/hubspot/deal-stats?period=${selectedFilter}`)
      .then((res) => {
        if (!res.ok) throw new Error("Sunucudan yanıt alınamadı.");
        return res.json();
      })
      .then((data) => {
        setStats(data.data || []);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        setError("Veriler yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.");
        setLoading(false);
      });
  }, [selectedFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-xl font-medium text-gray-700 animate-pulse">Veriler Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-red-50 text-red-700 border border-red-300 rounded-lg p-6 m-4 shadow-md">
        <div className="text-xl font-medium">{error}</div>
      </div>
    );
  }

  if (!stats.length) {
    return (
      <div className="flex justify-center items-center h-screen bg-yellow-50 text-yellow-700 border border-yellow-300 rounded-lg p-6 m-4 shadow-md">
        <div className="text-xl font-medium">Gösterilecek kayıt bulunamadı. Lütfen filtreyi değiştirerek tekrar deneyin.</div>
      </div>
    );
  }

  // Grafik komponentini seçici fonksiyon
  function renderChart() {
    const chartProps = {
      data: stats,
      margin: { top: 20, right: 50, left: 40, bottom: 80 },
    };
    const sharedElements = (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="name"
          angle={-35}
          textAnchor="end"
          height={100}
          interval={0}
          tickFormatter={(value) =>
            value.length > 15 ? value.substring(0, 15) + "..." : value
          }
          tick={{ fill: "#555", fontSize: 13 }}
        />
        <YAxis
          yAxisId="left"
          orientation="left"
          stroke={CORPORATE_COLOR}
          tick={{ fill: "#555", fontSize: 13 }}
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
          tick={{ fill: "#555", fontSize: 13 }}
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
          contentStyle={{
            borderRadius: "8px",
            border: `1px solid ${CORPORATE_COLOR_LIGHT}`,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
          itemStyle={{ padding: "4px 0", color: CORPORATE_COLOR_DARK }}
        />
        <Legend
          wrapperStyle={{ paddingTop: "20px", fontSize: 16 }}
          iconType="circle"
          verticalAlign="top"
          align="center"
        />
      </>
    );

    switch (selectedChart) {
      case "bar":
        return (
          <BarChart {...chartProps} barCategoryGap={30} barGap={4}>
            {sharedElements}
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
            {sharedElements}
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
            {sharedElements}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="count"
              stroke={CORPORATE_COLOR}
              fill={CORPORATE_COLOR_LIGHT}
              fillOpacity={0.3}
              name="Anlaşma Adedi"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="totalAmount"
              stroke={CORPORATE_COLOR_LIGHT}
              fill={CORPORATE_COLOR_LIGHT}
              fillOpacity={0.6}
              name="Toplam Tutar"
            />
          </AreaChart>
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

      {/* Filtreleme Butonları */}
      <section className="mb-4 flex justify-center gap-3 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ease-in-out shadow-sm
              ${selectedFilter === f.key
                ? "text-white shadow-lg transform scale-105"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:border-gray-400"
              }`}
            style={{
                backgroundColor: selectedFilter === f.key ? CORPORATE_COLOR : undefined,
                color: selectedFilter === f.key ? 'white' : CORPORATE_COLOR,
                borderColor: selectedFilter === f.key ? undefined : CORPORATE_COLOR_LIGHT,
            }}
            onClick={() => setSelectedFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </section>

      {/* Grafik tipi seçim butonları */}
      <section className="mb-8 flex justify-center gap-3 flex-wrap">
        {chartTypes.map((ct) => (
          <button
            key={ct.key}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ease-in-out shadow-sm
              ${selectedChart === ct.key
                ? "text-white shadow-lg transform scale-105"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:border-gray-400"
              }`}
            style={{
                backgroundColor: selectedChart === ct.key ? CORPORATE_COLOR_DARK : undefined,
                color: selectedChart === ct.key ? 'white' : CORPORATE_COLOR_DARK,
                borderColor: selectedChart === ct.key ? undefined : CORPORATE_COLOR_LIGHT,
            }}
            onClick={() => setSelectedChart(ct.key)}
          >
            {ct.label}
          </button>
        ))}
      </section>

      <div className="max-w-7xl mx-auto">
        {/* Özet Kutuları */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {stats.map((info: any) => (
            <div
              key={info.id}
              className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 flex flex-col items-center justify-center text-center transform hover:scale-105 transition-transform duration-300 ease-in-out group"
            >
              <h2 className="font-bold text-xl text-gray-700 mb-3 group-hover:text-blue-600 transition-colors" style={{ color: CORPORATE_COLOR }}>
                {info.name}
              </h2>
              <div className="text-gray-600 text-base space-y-1">
                <p>
                  <span className="font-medium">Toplam Anlaşma:</span>{" "}
                  <span className="font-bold text-lg" style={{ color: CORPORATE_COLOR_DARK }}>{info.count}</span>
                </p>
                <p>
                  <span className="font-medium">Toplam Tutar:</span>{" "}
                  <span className="font-extrabold text-xl" style={{ color: CORPORATE_COLOR }}>
                    ₺{Number(info.totalAmount).toLocaleString("tr-TR")}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Grafik Alanı */}
        <section className="bg-white rounded-2xl shadow-xl p-6 md:p-10 mb-8" style={{ height: 600 }}>
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: CORPORATE_COLOR_DARK }}>
            Aşama Bazlı Anlaşma Dağılımı
          </h2>
          <ResponsiveContainer width="100%" height={500}>
            {renderChart()}
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}
