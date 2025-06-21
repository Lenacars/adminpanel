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
    if (o.firstName || o.lastName) {
      map[o.id] = `${o.firstName || ""} ${o.lastName || ""}`.trim();
    } else if (o.email) {
      map[o.id] = o.email;
    } else {
      map[o.id] = o.id;
    }
  });
  return map;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pipelineId = searchParams.get("pipelineId") || "default";
  const period = searchParams.get("period"); // eklendi

  try {
    let after: string | undefined = undefined;
    let hasMore = true;
    let allDeals: any[] = [];

    // HubSpot API'dan deal'ları topla
    while (hasMore) {
      const body: any = {
        filterGroups: [
          { filters: [{ propertyName: "pipeline", operator: "EQ", value: pipelineId }] }
        ],
        properties: ["hubspot_owner_id", "amount", "createdate"],
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

    // Eğer period (örn. "1ay", "6ay") parametresi gelirse, o kadar geriye gidip filtrele
    let filteredDeals = allDeals;
    if (period) {
      const now = new Date();
      let startDate = new Date();
      if (period === "1ay") startDate.setMonth(now.getMonth() - 1);
      else if (period === "6ay") startDate.setMonth(now.getMonth() - 6);
      else if (period === "12ay") startDate.setFullYear(now.getFullYear() - 1);
      else if (period === "24ay") startDate.setFullYear(now.getFullYear() - 2);
      else if (period === "36ay") startDate.setFullYear(now.getFullYear() - 3);

      filteredDeals = allDeals.filter(d => {
        const created = d.properties?.createdate ? new Date(Number(d.properties.createdate)) : null;
        return created && created >= startDate;
      });
    }

    // Owner map’i çek
    const ownerMap = await fetchOwners();

    // Owner'a göre grupla
    const stats: Record<string, { count: number; totalAmount: number }> = {};
    filteredDeals.forEach(deal => {
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
