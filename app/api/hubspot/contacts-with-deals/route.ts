import { NextResponse } from "next/server";

const HUBSPOT_API = "https://api.hubapi.com";
const TOKEN = process.env.HUBSPOT_PRIVATE_TOKEN!;
const LIMIT = 100;

export async function GET() {
  try {
    let allDeals: any[] = [];
    let after: string | null = null;

    while (true) {
      const url = new URL(`${HUBSPOT_API}/crm/v3/objects/deals`);
      url.searchParams.set("limit", LIMIT.toString());
      url.searchParams.set("archived", "false");
      url.searchParams.set(
        "properties",
        "dealname,dealstage,amount,closedate,pipeline"
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

      if (!res.ok) {
        throw new Error(`HubSpot API hatası: ${res.status}`);
      }

      const data = await res.json();
      allDeals.push(...(data.results || []));

      if (!data.paging?.next?.after) break;
      after = data.paging.next.after;
    }

    return NextResponse.json({
      count: allDeals.length,
      deals: allDeals,
    });
  } catch (error) {
    console.error("❌ Deal API Hatası:", error);
    return NextResponse.json({ error: "Deal verisi alınamadı." }, { status: 500 });
  }
}
