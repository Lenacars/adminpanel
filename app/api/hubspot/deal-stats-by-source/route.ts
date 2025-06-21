// app/api/hubspot/deal-stats-by-source/route.ts

import { NextRequest, NextResponse } from "next/server";

const HUBSPOT_API = "https://api.hubapi.com";
const TOKEN = process.env.HUBSPOT_PRIVATE_TOKEN!;

// HubSpot'ta en çok "hs_analytics_source" veya "deal_source" alanı kullanılır.
// Sende hangi alan varsa onu belirt.

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pipelineId = searchParams.get("pipelineId") || "default";
  const SOURCE_FIELD = "hs_analytics_source"; // Gerekirse burada alanı değiştir!

  try {
    let after = undefined;
    let hasMore = true;
    let allDeals: any[] = [];

    while (hasMore) {
      const body: any = {
        filterGroups: [
          { filters: [{ propertyName: "pipeline", operator: "EQ", value: pipelineId }] }
        ],
        properties: [SOURCE_FIELD, "amount"],
        limit: 100,
      };
      if (after) body.after = after;

      const res = await fetch(`${HUBSPOT_API}/crm/v3/objects/deals/search`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.results) allDeals = allDeals.concat(data.results);
      after = data.paging?.next?.after;
      hasMore = !!after;
    }

    // Kaynağa göre grupla
    const stats: Record<string, { count: number; totalAmount: number }> = {};
    allDeals.forEach(deal => {
      const source = deal.properties?.[SOURCE_FIELD] || "Bilinmeyen";
      const amount = parseFloat(deal.properties?.amount || "0") || 0;
      if (!stats[source]) stats[source] = { count: 0, totalAmount: 0 };
      stats[source].count += 1;
      stats[source].totalAmount += amount;
    });

    const result = Object.entries(stats).map(([source, data]) => ({
      source,
      count: data.count,
      totalAmount: data.totalAmount,
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
