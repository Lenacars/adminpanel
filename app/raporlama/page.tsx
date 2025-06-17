"use client";

import { useEffect, useState } from "react";

export default function RaporlamaPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasNext, setHasNext] = useState(true);

  // Kişi + anlaşmaları
  useEffect(() => {
    setLoading(true);
    fetch(`/api/hubspot/contacts-with-deals?page=${page}`)
      .then((res) => res.json())
      .then((data) => {
        const withDeals = (data.contacts || []).filter(
          (contact: any) => contact.deals && contact.deals.length > 0
        );
        setContacts(withDeals);
        setHasNext(!!data.nextPageToken);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Veri hatası:", err);
        setLoading(false);
      });
  }, [page]);

  // Deal Board verisi
  useEffect(() => {
    fetch("/api/hubspot/deals")
      .then((res) => res.json())
      .then((data) => {
        setDeals(data.deals || []);
      })
      .catch((err) => console.error("Deal board hatası:", err));
  }, []);

  if (loading) return <div className="p-4">Yükleniyor...</div>;

  // Deals'i stage'e göre grupla
  const groupedDeals: { [stage: string]: any[] } = {};
  for (const deal of deals) {
    const stage = deal.properties?.dealstage || "Bilinmeyen";
    if (!groupedDeals[stage]) {
      groupedDeals[stage] = [];
    }
    groupedDeals[stage].push(deal);
  }

  return (
    <div className="p-4 space-y-12">
      <h1 className="text-2xl font-bold">HubSpot Raporlama</h1>

      {/* 👤 Kişiler */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Kişiler & Anlaşmaları (Sayfa {page})</h2>
        <div className="space-y-6">
          {contacts.map((contact, index) => (
            <div key={index} className="p-4 border rounded-lg shadow">
              <p><strong>Ad:</strong> {contact.properties?.firstname || "-"} {contact.properties?.lastname || "-"}</p>
              <p><strong>Email:</strong> {contact.properties?.email || "-"}</p>
              <p><strong>Telefon:</strong> {contact.properties?.phone || "-"}</p>

              <div className="mt-2">
                <p className="font-semibold">Deals:</p>
                <ul className="list-disc ml-6">
                  {contact.deals.map((deal: any, i: number) => (
                    <li key={i}>
                      <strong>{deal.properties?.dealstage || "?"}</strong> — {deal.properties?.dealname || "-"} — {deal.properties?.amount || "₺0"}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-6">
          <button
            className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            ← Önceki Sayfa
          </button>
          <button
            className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!hasNext}
          >
            Sonraki Sayfa →
          </button>
        </div>
      </section>

      {/* 📊 Deal Pipeline Board */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Anlaşma Boardu (Pipeline)</h2>
        <div className="flex gap-4 overflow-x-auto">
          {Object.entries(groupedDeals).map(([stage, dealsInStage]) => (
            <div key={stage} className="min-w-[280px] bg-gray-100 rounded-lg shadow p-4">
              <h3 className="text-lg font-bold mb-2">{stage}</h3>
              <div className="space-y-3">
                {dealsInStage.map((deal, i) => (
                  <div key={i} className="bg-white rounded p-3 shadow">
                    <p className="font-semibold">{deal.properties?.dealname || "İsimsiz Deal"}</p>
                    <p>Tutar: ₺{deal.properties?.amount || "0"}</p>
                    <p>Kapanış: {deal.properties?.closedate || "-"}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
