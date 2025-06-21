"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const CORPORATE_COLOR = "#6A3C96";
const PIE_COLORS = [
  CORPORATE_COLOR, "#9a6cb6", "#c8a2de", "#b28cce", "#ded1e8", "#7a4d9c", "#3f225e"
];
const pipelineOptions = [
  { key: "default", label: "Ana Pipeline" },
  // { key: "diğerID", label: "Başka Pipeline" }
];

export default function KaynakAnaliziPage() {
  const [data, setData] = useState<any[]>([]);
  const [pipelineId, setPipelineId] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/hubspot/deal-stats-by-source?pipelineId=${pipelineId}`)
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

  // Yüzdesel label fonksiyonu
  const renderPieLabel = ({ name, percent }: any) =>
    `${name} (${(percent * 100).toFixed(0)}%)`;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 lg:p-12">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold" style={{ color: CORPORATE_COLOR }}>Kaynak/Kanal Analizi</h1>
        <p className="mt-2 text-gray-700">Anlaşmaların kaynak bazında dağılımı.</p>
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
      <section className="bg-white rounded-2xl shadow-xl p-8 mb-8 flex justify-center" style={{ height: 500 }}>
        {loading ? (
          <div className="flex justify-center items-center h-full text-xl text-gray-600">Yükleniyor...</div>
        ) : error ? (
          <div className="text-red-700 text-center">{error}</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.map(d => ({ ...d, value: d.count }))}
                dataKey="value"
                nameKey="source"
                cx="50%"
                cy="50%"
                outerRadius={180}
                innerRadius={70}
                label={renderPieLabel}
                labelLine={false}
                isAnimationActive
              >
                {data.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}
