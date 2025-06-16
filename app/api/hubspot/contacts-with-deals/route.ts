// app/api/hubspot/contacts-with-deals/route.ts

import { NextResponse } from "next/server";

const HUBSPOT_API = "https://api.hubapi.com";
const TOKEN = process.env.HUBSPOT_PRIVATE_TOKEN!;

// Tüm kişileri detaylı şekilde al (ad, soyad, e-posta) + silinmemişler (archived=false)
async function getContacts() {
  const res = await fetch(
    `${HUBSPOT_API}/crm/v3/objects/contacts?limit=10&archived=false&properties=firstname,lastname,email`,
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await res.json();
  console.log("📥 Contacts:", data); // Vercel loglarında inceleyebilirsin
  return data.results || [];
}

// Bir kişiye ait anlaşmaları getir (deals)
async function getDealsForContact(contactId: string) {
  const res = await fetch(
    `${HUBSPOT_API}/crm/v3/objects/contacts/${contactId}/associations/deals`,
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await res.json();
  return data.results || [];
}

// GET isteğini işleyen ana fonksiyon
export async function GET() {
  try {
    const contacts = await getContacts();

    const enrichedContacts = await Promise.all(
      contacts.map(async (contact: any) => {
        const deals = await getDealsForContact(contact.id);
        return {
          ...contact,
          deals,
        };
      })
    );

    return NextResponse.json(enrichedContacts);
  } catch (err) {
    console.error("HubSpot API Hatası:", err);
    return NextResponse.json({ error: "Veri alınamadı" }, { status: 500 });
  }
}
