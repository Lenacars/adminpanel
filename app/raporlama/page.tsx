"use client";

import { useEffect, useState } from "react";

export default function RaporlamaPage() {
  const [dealStats, setDealStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hubspot/deal-stats")
      .then((res) => res.json())
      .then((data) => {
        setDealStats(data.pipeline_summary || {});
        setLoading(false);
      })
      .catch((err) => {
        console.error("Deal istatistik hatası:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4">Yükleniyor...</div>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">HubSpot Anlaşma Özeti</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(dealStats).map(([stage, stats]: any) => (
          <div key={stage} className="border p-4 rounded-lg shadow bg-white">
            <h2 className="text-lg font-semibold mb-2">{stage}</h2>
            <p className="text-gray-700">Toplam Anlaşma: {stats.count}</p>
            <p className="text-gray-700">Toplam Tutar: ₺{Number(stats.totalAmount).toLocaleString("tr-TR")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
