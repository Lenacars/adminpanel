// app/api/hubspot/deal-stats/route.ts

import { NextResponse } from "next/server";

const HUBSPOT_API = "https://api.hubapi.com";
const TOKEN = process.env.HUBSPOT_PRIVATE_TOKEN!;
const PIPELINE_ID = "12060148"; // Pipeline ID'nin doğru olduğuna emin ol

// Kullanacağın stage ID'lerini buraya yaz!
const stageMap = {
  "2509884644": "Teklif İletilecek",
  "appointmentscheduled": "Teklif Gönderildi",
  "qualifiedtobuy": "Teklife Dönüş Sağladı",
  "presentationscheduled": "Revize Teklif İstedi",
  "decisionmakerboughtin": "Değerlendirme Aşamasında",
  "contractsent": "Mali Evrak İletti",
  "672697843": "Sözleşme İletildi",
  "closedwon": "Won",
  "closedlost": "Lost",
};

export async function GET() {
  try {
    let after = undefined;
    let hasMore = true;
    let allDeals: any[] = [];

    while (hasMore) {
      const body: any = {
        filterGroups: [
          {
            filters: [{ propertyName: "pipeline", operator: "EQ", value: PIPELINE_ID }],
          },
        ],
        properties: ["dealstage", "amount"],
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

    // Stage'lere göre grupla ve sayıları bul
    const stageStats: Record<string, { count: number; totalAmount: number }> = {};
    for (const key in stageMap) {
      stageStats[key] = { count: 0, totalAmount: 0 };
    }

    allDeals.forEach((deal) => {
      const stage = deal.properties?.dealstage;
      const amount = parseFloat(deal.properties?.amount || "0") || 0;
      if (stageStats[stage]) {
        stageStats[stage].count += 1;
        stageStats[stage].totalAmount += amount;
      }
    });

    // Daha okunaklı döndür
    const response = Object.entries(stageMap).map(([id, name]) => ({
      id,
      name,
      count: stageStats[id]?.count || 0,
      totalAmount: stageStats[id]?.totalAmount || 0,
    }));

    return NextResponse.json({ success: true, data: response });
  } catch (err: any) {
    console.error("Server Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
