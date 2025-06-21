// app/api/hubspot/deal-stats-by-source/route.ts

import { NextResponse } from "next/server";
const HUBSPOT_API = "https://api.hubapi.com";
const TOKEN = process.env.HUBSPOT_PRIVATE_TOKEN!;
const PIPELINE_ID = "default";

export async function GET() {
  try {
    const dealsRes = await fetch(`${HUBSPOT_API}/crm/v3/objects/deals/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filterGroups: [
          { filters: [{ propertyName: "pipeline", operator: "EQ", value: PIPELINE_ID }] }
        ],
        properties: ["dealstage", "amount", "hs_analytics_source"], // veya kullandığın kaynak alanı
        limit: 100,
      }),
    });
    const dealsData = await dealsRes.json();

    // 2. Kaynağa göre grupla ve hesapla
    // ... (örnek: {sourceName, count, totalAmount})

    return NextResponse.json({ success: true, data: [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
