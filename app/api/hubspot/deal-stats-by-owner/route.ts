// app/api/hubspot/deal-stats-by-owner/route.ts

import { NextRequest, NextResponse } from "next/server";

const HUBSPOT_API = "https://api.hubapi.com";
const TOKEN = process.env.HUBSPOT_PRIVATE_TOKEN!;

// Owner isimlerini çek (paginated)
async function fetchOwners(): Promise<Record<string, string>> {
  let after: string | undefined = undefined;
  let owners: any[] = [];
  do {
    const url = new URL(`${HUBSPOT_API}/crm/v3/owners`);
    if (after) url.searchParams.set("after", after);
    url.searchParams.set("limit", "100");
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const data = await res.json();
    owners = owners.concat(data.results || []);
    after = data.paging?.next?.after;
  } while (after);

  const map: Record<string, string> = {};
  owners.forEach((o: any) => {
    map[o.id] =
      o.firstName || o.lastName
        ? `${o.firstName || ""} ${o.lastName || ""}`.trim()
        : o.email || o.id;
  });
  return map;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pipelineId = searchParams.get("pipelineId") || "default";
  try {
    let after: string | undefined = undefined;
    let hasMore = true;
    let allDeals: any[] = [];
    // Deal'ları topla
    while (hasMore) {
      const body: any = {
        filterGroups: [
          { filters: [{ propertyName: "pipeline", operator: "EQ", value: pipelineId }] }
        ],
        properties: ["hubspot_owner_id", "amount"],
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

    // Owner map’i çek
    const ownerMap = await fetchOwners();

    // Owner'a göre grupla
    const stats: Record<string, { count: number; totalAmount: number }> = {};
    allDeals.forEach(deal => {
      const ownerId = deal.properties?.hubspot_owner_id || "Bilinmeyen";
      const amount = parseFloat(deal.properties?.amount || "0") || 0;
      if (!stats[ownerId]) stats[ownerId] = { count: 0, totalAmount: 0 };
      stats[ownerId].count += 1;
      stats[ownerId].totalAmount += amount;
    });

    const result = Object.entries(stats).map(([ownerId, d]) => ({
      ownerId,
      ownerName: ownerMap[ownerId] || ownerId,
      count: d.count,
      totalAmount: d.totalAmount,
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
