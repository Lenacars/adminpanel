import { NextRequest, NextResponse } from "next/server";

const HUBSPOT_API = "https://api.hubapi.com";
const TOKEN = process.env.HUBSPOT_PRIVATE_TOKEN!;

// Kaynak mapping örneği (gerekiyorsa)
const sourceMap: Record<string, string> = {
  "1": "Doğrudan Trafik",
  "2": "Organik Arama",
  "3": "Yönlendirme",
  "4": "Sosyal Medya",
  "5": "E-posta Pazarlama",
  // Diğerleri eklenebilir
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pipelineId = searchParams.get("pipelineId");
  const SOURCE_FIELD = "hs_analytics_source";

  try {
    let after = undefined;
    let hasMore = true;
    let allDeals: any[] = [];

    while (hasMore) {
      const body: any = {
        filterGroups: pipelineId
          ? [{ filters: [{ propertyName: "pipeline", operator: "EQ", value: pipelineId }] }]
          : [],
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
      const rawSource = deal.properties?.[SOURCE_FIELD] || "Bilinmeyen";
      const sourceName = sourceMap[rawSource] || rawSource;
      const amount = parseFloat(deal.properties?.amount || "0") || 0;
      if (!stats[sourceName]) stats[sourceName] = { count: 0, totalAmount: 0 };
      stats[sourceName].count += 1;
      stats[sourceName].totalAmount += amount;
    });

    const result = Object.entries(stats).map(([sourceName, data]) => ({
      sourceName,
      count: data.count,
      totalAmount: data.totalAmount,
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
