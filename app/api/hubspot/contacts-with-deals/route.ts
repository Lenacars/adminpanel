import { NextResponse } from "next/server";

const HUBSPOT_API = "https://api.hubapi.com";
const TOKEN = process.env.HUBSPOT_PRIVATE_TOKEN!;
const LIMIT = 100;

// 🔄 Belirli bir sayfadaki kişileri getir
async function getContactsPaginated(after: string | null = null) {
  const url = new URL(`${HUBSPOT_API}/crm/v3/objects/contacts`);
  url.searchParams.set("limit", LIMIT.toString());
  url.searchParams.set("archived", "false");
  url.searchParams.set(
    "properties",
    "firstname,lastname,email,phone,company,jobtitle,createdate"
  );

  if (after) {
    url.searchParams.set("after", after);
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  return res.json();
}

// 🔗 Her bir kişi için detaylı anlaşmaları getir
async function getDealsForContact(contactId: string) {
  // Kişiye bağlı anlaşma ID'lerini getir
  const res = await fetch(
    `${HUBSPOT_API}/crm/v3/objects/contacts/${contactId}/associ_
