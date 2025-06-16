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
  const res = await fetch(
    `${HUBSPOT_API}/crm/v3/objects/contacts/${contactId}/associations/deals`,
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  const associations = await res.json();
  const dealIds = associations.results?.map((r: any) => r.id) || [];

  if (dealIds.length === 0) return [];

  const resDeals = await fetch(
    `${HUBSPOT_API}/crm/v3/objects/deals/batch/read`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: ["dealstage", "amount", "dealname", "closedate"],
        inputs: dealIds.map((id: string) => ({ id })),
      }),
    }
  );

  const dealData = await resDeals.json();
  return dealData.results || [];
}

// 🌐 API Route (GET)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");

    let after: string | null = null;
    let currentPage = 1;
    let pagingToken: string | null = null;

    // Sayfa ilerletme (örneğin page=3 için 2 kez ilerle)
    while (currentPage < page) {
      const data = await getContactsPaginated(after);
      pagingToken = data.paging?.next?.after;
      if (!pagingToken) break;
      after = pagingToken;
      currentPage++;
    }

    // İstenen sayfanın verisi
    const data = await getContactsPaginated(after);
    const contacts = data.results || [];

    // Kişilere bağlı deals getir + deals yoksa dışla
    const enrichedContacts = (
      await Promise.all(
        contacts.map(async (contact: any) => {
          const deals = await getDealsForContact(contact.id);
          if (deals.length === 0) return null;
          return {
            ...contact,
            deals,
          };
        })
      )
    ).filter(Boolean);

    return NextResponse.json({
      page,
      count: enrichedContacts.length,
      contacts: enrichedContacts,
      nextPageToken: data.paging?.next?.after || null,
    });
  } catch (err) {
    console.error("❌ HubSpot API Hatası:", err);
    return NextResponse.json({ error: "Veri alınamadı" }, { status: 500 });
  }
}
