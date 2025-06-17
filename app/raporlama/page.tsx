"use client";

import { useEffect, useState } from "react";

export default function RaporlamaPage() {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hubspot/deal-stats")
      .then((res) => {
        if (!res.ok) throw new Error("API Error");
        return res.json();
      })
      .then((data) => {
        setStats(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Deal istatistik hatası:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">HubSpot Anlaşma Özeti</h1>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {Object.entries(stats).map(([stage, info]: any) => (
          <div key={stage} className="border p-4 rounded shadow">
            <h2 className="font-semibold">{stage}</h2>
            <p>Toplam Anlaşma: {info.count}</p>
            <p>Toplam Tutar: ₺{info.totalAmount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
