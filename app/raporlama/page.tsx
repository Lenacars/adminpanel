"use client";

import { useEffect, useState } from "react";

export default function RaporlamaPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hubspot/contacts-with-deals?page=1")
      .then((res) => res.json())
      .then((data) => {
        // 🔧 Doğru erişim: data.contacts
        setContacts(data.contacts || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Veri hatası:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4">Yükleniyor...</div>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">HubSpot Kişiler & Anlaşmalar</h1>
      {contacts.map((contact, index) => (
        <div key={index} className="p-4 border rounded-lg shadow">
          <p><strong>Ad:</strong> {contact.properties?.firstname || "-"} {contact.properties?.lastname || "-"}</p>
          <p><strong>Email:</strong> {contact.properties?.email || "-"}</p>
          <p><strong>Telefon:</strong> {contact.properties?.phone || "-"}</p>

          <div className="mt-2">
            <p className="font-semibold">Deals:</p>
            <ul className="list-disc ml-6">
              {contact.deals?.length > 0 ? (
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
