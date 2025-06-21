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
      .then((res) => res.json())
      .then((data) => {
        setStats(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Veri alınamadı.");
        setLoading(false);
      });
  }, [selectedFilter]);

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;
  if (!stats.length) return <div>Kayıt bulunamadı.</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">HubSpot Anlaşma Özeti</h1>
      <div className="mb-4 flex gap-4 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`px-4 py-2 rounded border font-semibold ${
              selectedFilter === f.key
                ? "bg-blue-600 text-white"
                : "bg-white text-blue-600 border-blue-600"
            }`}
            onClick={() => setSelectedFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
      {/* KUTULAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((info: any) => (
          <div
            key={info.id}
            className="border p-6 rounded-2xl shadow-md bg-white flex flex-col items-center"
          >
            <h2 className="font-semibold text-lg mb-2">{info.name}</h2>
            <p className="mb-1">
              <span className="font-medium">Toplam Anlaşma:</span> {info.count}
            </p>
            <p>
              <span className="font-medium">Toplam Tutar:</span>{" "}
              <span className="text-blue-600 font-bold">
                ₺{Number(info.totalAmount).toLocaleString("tr-TR")}
              </span>
            </p>
          </div>
        ))}
      </div>
      {/* GRAFİK */}
      <div className="w-full h-[400px] bg-white rounded-2xl shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4">Aşama Bazlı Dağılım Grafiği</h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(val: any) => Number(val).toLocaleString("tr-TR")} />
            <Legend />
            <Bar dataKey="count" fill="#2563eb" name="Adet" />
            <Bar dataKey="totalAmount" fill="#16a34a" name="Toplam Tutar" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
