// app/api/hubspot/deal-stats/route.ts

import { NextResponse } from "next/server";

const HUBSPOT_API = "https://api.hubapi.com";
const TOKEN = process.env.HUBSPOT_PRIVATE_TOKEN!;
const PIPELINE_ID = "default";

// Stage map örnek
const stageMap = {
  "appointmentscheduled": "Teklif Gönderildi",
  "qualifiedtobuy": "Teklife Dönüş Sağladı",
  "presentationscheduled": "Revize Teklif İstedi",
  "decisionmakerboughtin": "Değerlendirme Aşamasında",
  "contractsent": "Mali Evrak İletti",
  "closedwon": "Kazandı",
  "closedlost": "Kaybetti",
  // Gerekirse ekle
};

export async function GET() {
  console.log("==== API/Hubspot/Deal-Stats ÇALIŞTI ====");
  try {
    // 1) ENV kontrol
    if (!process.env.HUBSPOT_PRIVATE_TOKEN) {
      console.error("HUBSPOT_PRIVATE_TOKEN environment variable TANIMSIZ!");
      return NextResponse.json(
        { error: "Token environment variable eksik" },
        { status: 500 }
      );
    }
    console.log("ENV değişkeni OK:", !!process.env.HUBSPOT_PRIVATE_TOKEN);

    let after = undefined;
    let hasMore = true;
    let allDeals: any[] = [];
    let sayfa = 0;

    // 2) Veri çekme başlangıç
    while (hasMore) {
      sayfa++;
      console.log(`API çağrısı başlatılıyor, sayfa: ${sayfa}, after: ${after}`);

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

      // 3) Fetch
      const res = await fetch(`${HUBSPOT_API}/crm/v3/objects/deals/search`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      console.log("API response status:", res.status);
      if (!res.ok) {
        const errText = await res.text();
        console.error("API response NOT ok!", res.status, errText);
        return NextResponse.json(
          { error: `HubSpot API error: ${res.status} ${errText}` },
          { status: 500 }
        );
      }

      const data = await res.json();

      // 4) Sonuç kontrol
      if (data.results) {
        allDeals = allDeals.concat(data.results);
        console.log(`Sayfa ${sayfa} için results OK, toplam deal adedi: ${allDeals.length}`);
      } else {
        console.error(`Sayfa ${sayfa} için results YOK! Cevap:`, data);
      }

      after = data.paging?.next?.after;
      hasMore = !!after;
      // Debug amaçlı sadece ilk sayfayı al
      // if (sayfa >= 1) hasMore = false;
    }

    // 5) Gruplama işlemi
    console.log("Gruplama başlıyor. Deal toplamı:", allDeals.length);
    const stageStats: Record<string, { count: number; totalAmount: number }> = {};
    for (const key in stageMap) {
      stageStats[key] = { count: 0, totalAmount: 0 };
    }

    allDeals.forEach((deal, i) => {
      const stage = deal.properties?.dealstage;
      const amount = parseFloat(deal.properties?.amount || "0") || 0;
      if (stageStats[stage]) {
        stageStats[stage].count += 1;
        stageStats[stage].totalAmount += amount;
      }
      if (i < 5) console.log(`Örnek deal[${i}]: stage=${stage}, amount=${amount}`);
    });

    // 6) Sonuç hazırlama
    const response = Object.entries(stageMap).map(([id, name]) => ({
      id,
      name,
      count: stageStats[id]?.count || 0,
      totalAmount: stageStats[id]?.totalAmount || 0,
    }));

    console.log("Final response JSON:", response);

    return NextResponse.json({ success: true, data: response });
  } catch (err: any) {
    console.error("Server Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
