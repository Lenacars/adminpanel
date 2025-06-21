"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const CORPORATE_COLOR = "#6A3C96";
const CORPORATE_COLOR_LIGHT = "#9a6cb6";

// Eğer pipeline seçmek istersen dropdown ekleyebilirsin:
const pipelineOptions = [
  { key: "default", label: "Ana Pipeline" },
  // { key: "diğerID", label: "Başka Pipeline" }
];

export default function SatisciPerformansPage() {
  const [data, setData] = useState<any[]>([]);
  const [pipelineId, setPipelineId] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/hubspot/deal-stats-by-owner?pipelineId=${pipelineId}`)
      .then(res => res.json())
      .then(res => {
        setData(res.data || []);
        setError(null);
        setLoading(false);
      })
      .catch(() => {
        setError("Veri alınamadı");
        setLoading(false);
      });
  }, [pipelineId]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 lg:p-12">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold" style={{ color: CORPORATE_COLOR }}>Satışçı Bazında Performans</h1>
        <p className="mt-2 text-gray-700">Her satışçı için toplam anlaşma ve ciro.</p>
      </header>

      {/* Pipeline Seçimi */}
      <div className="flex justify-center mb-6">
        <select
          className="border rounded px-4 py-2"
          value={pipelineId}
          onChange={e => setPipelineId(e.target.value)}
        >
          {pipelineOptions.map(opt => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Grafik Alanı */}
      <section className="bg-white rounded-2xl shadow-xl p-8 mb-8" style={{ height: 500 }}>
        {loading ? (
          <div className="flex justify-center items-center h-full text-xl text-gray-600">Yükleniyor...</div>
        ) : error ? (
          <div className="text-red-700 text-center">{error}</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 40, left: 40, bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="ownerName" angle={-30} textAnchor="end" height={100} tick={{ fontSize: 14, fill: "#555" }} />
              <YAxis yAxisId="left" orientation="left" label={{ value: "Adet", angle: -90, position: "insideLeft", fill: CORPORATE_COLOR }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: "Ciro (₺)", angle: 90, position: "insideRight", fill: CORPORATE_COLOR_LIGHT }} tickFormatter={val => `₺${Number(val).toLocaleString("tr-TR")}`} />
              <Tooltip />
              <Legend verticalAlign="top" height={36}/>
              <Bar yAxisId="left" dataKey="count" fill={CORPORATE_COLOR} name="Anlaşma Adedi" barSize={30} />
              <Bar yAxisId="right" dataKey="totalAmount" fill={CORPORATE_COLOR_LIGHT} name="Toplam Tutar" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}
