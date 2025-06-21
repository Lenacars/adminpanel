"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
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

export default function RaporlamaPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("1ay");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/hubspot/deal-stats?period=${selectedFilter}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Sunucudan yanıt alınamadı.");
        }
        return res.json();
      })
      .then((data) => {
        setStats(data.data || []);
        setLoading(false);
        setError(null); // Başarılı olduğunda hatayı temizle
      })
      .catch((err) => {
        console.error("Veri çekme hatası:", err);
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

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 lg:p-12">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
          HubSpot Anlaşma Raporları
        </h1>
        <p className="mt-2 text-lg text-gray-600">Seçili döneme göre anlaşma performansını inceleyin.</p>
      </header>

      {/* Filtreleme Butonları */}
      <section className="mb-8 flex justify-center gap-3 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ease-in-out shadow-sm
              ${selectedFilter === f.key
                ? "bg-blue-700 text-white shadow-lg transform scale-105"
                : "bg-white text-blue-600 border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
              }`}
            onClick={() => setSelectedFilter(f.key)}
          >
            {f.label}
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
              <h2 className="font-bold text-xl text-gray-700 mb-3 group-hover:text-blue-600 transition-colors">
                {info.name}
              </h2>
              <div className="text-gray-600 text-base space-y-1">
                <p>
                  <span className="font-medium">Toplam Anlaşma:</span>{" "}
                  <span className="text-blue-600 font-bold text-lg">{info.count}</span>
                </p>
                <p>
                  <span className="font-medium">Toplam Tutar:</span>{" "}
                  <span className="text-green-600 font-extrabold text-xl">
                    ₺{Number(info.totalAmount).toLocaleString("tr-TR")}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Grafik Alanı */}
        <section className="bg-white rounded-2xl shadow-xl p-6 md:p-8 lg:p-10 mb-8 h-[500px]">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Aşama Bazlı Anlaşma Dağılımı
          </h2>
          <ResponsiveContainer width="100%" height="calc(100% - 40px)"> {/* Başlık yüksekliğini düşerek ayarla */}
            <BarChart
              data={stats}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="name"
                angle={-30}
                textAnchor="end"
                height={80}
                tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value} // Uzun isimler için kısaltma
                tick={{ fill: "#555", fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="#2563eb"
                tick={{ fill: "#555", fontSize: 12 }}
                label={{ value: 'Anlaşma Adedi', angle: -90, position: 'insideLeft', fill: '#2563eb' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#16a34a"
                tickFormatter={(val: any) => `₺${Number(val).toLocaleString("tr-TR")}`}
                tick={{ fill: "#555", fontSize: 12 }}
                label={{ value: 'Toplam Tutar (₺)', angle: 90, position: 'insideRight', fill: '#16a34a' }}
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
                contentStyle={{ borderRadius: "8px", border: "1px solid #e0e0e0", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                itemStyle={{ padding: "4px 0" }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="circle"
                verticalAlign="top"
                align="right"
              />
              <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="Anlaşma Adedi" barSize={30} radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="totalAmount" fill="#22c55e" name="Toplam Tutar" barSize={30} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}
