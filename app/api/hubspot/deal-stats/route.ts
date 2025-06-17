import { NextResponse } from "next/server";

const HUBSPOT_API = "https://api.hubapi.com";
const TOKEN = process.env.HUBSPOT_PRIVATE_TOKEN!;
const LIMIT = 100;
const PIPELINE_ID = "12060148"; // Araç Kiralama Süreci

export async function GET() {
  try {
    const stageCounts: Record<string, number> = {};
    let after: string | null = null;
    let totalFetched = 0;

    while (true) {
      const url = new URL(`${HUBSPOT_API}/crm/v3/objects/deals`);
      url.searchParams.set("limit", LIMIT.toString());
      url.searchParams.set("archived", "false");
      url.searchParams.set("properties", "dealstage,pipeline");
      if (after) url.searchParams.set("after", after);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });

      const data = await res.json();

      const deals = (data.results || []).filter(
        (d: any) => d.properties?.pipeline === PIPELINE_ID
      );

      for (const deal of deals) {
        const stage = deal.properties?.dealstage || "bilinmeyen";
        stageCounts[stage] = (stageCounts[stage] || 0) + 1;
      }

      totalFetched += deals.length;
      after = data.paging?.next?.after;

      if (!after || totalFetched > 500) break; // ⚠️ sınır koy
    }

    return NextResponse.json({ stageCounts });
  } catch (err) {
    console.error("Deal stage çekilemedi:", err);
    return NextResponse.json({ error: "Veri alınamadı" }, { status: 500 });
  }
}
