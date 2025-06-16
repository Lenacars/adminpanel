// app/api/hubspot/contacts-with-deals/route.ts

import { NextResponse } from "next/server";

const HUBSPOT_API = "https://api.hubapi.com";
const TOKEN = process.env.HUBSPOT_PRIVATE_TOKEN!;

// 100'erlik sayfalama ile tüm kişileri çeker
async function getContacts(): Promise<any[]> {
  const allContacts: any[] = [];
  let after: string | null = null;

  while (true) {
    const url = new URL(`${HUBSPOT_API}/crm/v3/objects/contacts`);
    url.searchParams.set("limit", "100");
    url.searchParams.set("archived", "false");
    url.searchParams.set("properties", "firstname,lastname,email,phone,company,jobtitle,createdate");

    if (after) {
      url.searchParams.set("after", after);
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    allContacts.push(...(data.results || []));

    if (!data.paging?.next?.after) {
      break;
    }

    after = data.paging.next.after;
  }

  return allContacts;
}

// Her bir kişi için bağlı anlaşmaları çeker
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

// GET isteğini işleyen route
export async function GET() {
  try {
    const contacts = await getContacts();

    const enrichedContacts = await Promise.all(
      contacts.map(async (contact: any) => {
        const deals = await getDealsForContact(contact.id);
