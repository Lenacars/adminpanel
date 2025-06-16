"use client";

import { useEffect, useState } from "react";

export default function RaporlamaPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasNext, setHasNext] = useState(true);

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

  if (loading) return <div className="p-4">Yükleniyor...</div>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">HubSpot Kişiler & Anlaşmalar (Sayfa {page})</h1>

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
    </div>
  );
}
