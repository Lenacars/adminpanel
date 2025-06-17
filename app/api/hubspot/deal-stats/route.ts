import { NextResponse } from "next/server";

const HUBSPOT_API = "https://api.hubapi.com";
const TOKEN = process.env.HUBSPOT_PRIVATE_TOKEN!;
const LIMIT = 100;
const PIPELINE_ID = "12060148"; // Araç Kiralama Süreci

export async function GET() {
  try {
    let allDeals: any[] = [];
    let after: string | null = null;

    do {
      const url = new URL(`${HUBSPOT_API}/crm/v3/objects/deals`);
      url.searchParams.set("limit", LIMIT.toString());
      url.searchParams.set("archived", "false");
      url.searchParams.set("properties", "dealstage,pipeline");
      if (after) url.searchParams.set("after", after);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });

      const data = await res.json();
      const filtered = (data.results || []).filter(
        (deal: any) => deal.properties?.pipeline === PIPELINE_ID
      );

      allDeals.push(...filtered);
      after = data.paging?.next?.after || null;
    } while (after && allDeals.length < 1000); // Çok büyümesin

    // 🎯 Statik olarak stage bazlı say
    const stageCounts: Record<string, number> = {};

    for (const deal of allDeals) {
      const stage = deal.properties?.dealstage || "bilinmeyen";
      if (!stageCounts[stage]) stageCounts[stage] = 0;
      stageCounts[stage]++;
    }

    return NextResponse.json({ stageCounts });
  } catch (err) {
    return NextResponse.json({ error: "HubSpot verisi alınamadı" }, { status: 500 });
  }
}
