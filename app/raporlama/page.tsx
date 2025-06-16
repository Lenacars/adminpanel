"use client";

import { useEffect, useState } from "react";

export default function RaporlamaPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hubspot/contacts-with-deals")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4">Yükleniyor...</div>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">HubSpot Kişiler & Anlaşmalar</h1>
      {data.map((contact, index) => (
        <div key={index} className="p-4 border rounded-lg shadow">
          <p><strong>Ad:</strong> {contact.properties?.firstname || "-"} {contact.properties?.lastname || "-"}</p>
          <p><strong>Email:</strong> {contact.properties?.email || "-"}</p>

          <div className="mt-2">
            <p className="font-semibold">Deals:</p>
            <ul className="list-disc ml-6">
              {contact.deals.length > 0 ? (
                contact.deals.map((deal: any, i: number) => (
                  <li key={i}>Deal ID: {deal.id}</li>
                ))
              ) : (
                <li>İlgili anlaşma yok</li>
              )}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
