"use client";

import { useEffect, useState } from "react";

type DealStat = {
  id: string;
  name: string;
  count: number;
  totalAmount: number;
};

export default function RaporlamaPage() {
  const [stats, setStats] = useState<DealStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/hubspot/deal-stats")
      .then((res) => {
        if (!res.ok) throw new Error("API Error");
        return res.json();
      })
      .then((data) => {
        setStats(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Veri alınamadı.");
        console.error("Deal istatistik hatası:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;
  if (!stats.length) return <div>Kayıt bulunamadı.</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">HubSpot Anlaşma Özeti</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((info) => (
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
                ₺{info.totalAmount.toLocaleString("tr-TR")}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
