import { NextRequest, NextResponse } from "next/server";

const HUBSPOT_API = "https://api.hubapi.com";
const TOKEN = process.env.HUBSPOT_PRIVATE_TOKEN!;

// Pipeline ID'nizi buraya yazın.
const PIPELINE_ID = "12060148"; // Örnek: "12060148", kendi pipeline ID'nizi buraya girin

const USER_MAP: Record<string, string> = {
  "26.066.921": "LenaCars",
  "46.165.993": "BUDAK EMRE",
  "27.555.920": "Lokman ışık",
  "47.871.939": "elif bilgin",
  "29.503.361": "Alper Tezal",
  "48.116.737": "Ayşegül Gündoğdu",
  "64.776.577": "Ayşegül Gündogdu",
  "66.383.712": "Ramazan Akgündüz",
  "43.674.251": "Funda Lena Nazik",
  "43.838.259": "Ali Karyağdı",
  "80.947.825": "Oğulcan Güneş",
  "46.589.348": "LenaCars Kiralama",
  "46.589.409": "Berat ÖZCAN",
  "56.927.612": "bahar demirel",
  "43.674.254": "Selcuk Nazik",
  "2.414.318": "Cafer Çavdar",
  "65.455.742": "Funda Lena",
  "80.947.829": "Furkan",
  "64.777.059": "Bahar Demirel",
  "46.589.398": "DİLEK YILDIZ",
  "46.164.692": "Canser Seven",
};

function getPeriodStart(period: string): number | null {
  const now = new Date();
  switch (period) {
    case "1ay": now.setMonth(now.getMonth() - 1); break;
    case "6ay": now.setMonth(now.getMonth() - 6); break;
    case "12ay": now.setMonth(now.getMonth() - 12); break;
    case "24ay": now.setMonth(now.getMonth() - 24); break;
    case "36ay": now.setMonth(now.getMonth() - 36); break;
    default: return null;
  }
  return now.getTime();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // Burada pipelineId queryden geliyorsa kullan, gelmiyorsa PIPELINE_ID sabitini kullan.
  const pipelineId = searchParams.get("pipelineId") || PIPELINE_ID;
  const period = searchParams.get("period") || "1ay";
  const minDate = getPeriodStart(period);

  try {
    let after: string | undefined = undefined;
    let hasMore = true;
    let allDeals: any[] = [];

    while (hasMore) {
      const body: any = {
        filterGroups: [
          {
            filters: [
              { propertyName: "pipeline", operator: "EQ", value: pipelineId },
              // Tarih filtresini buraya API seviyesinde ekle
              ...(minDate
                ? [{ propertyName: "createdate", operator: "GTE", value: minDate }]
                : [])
            ]
          }
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
      ownerName: USER_MAP[ownerId] || ownerId,
      count: d.count,
      totalAmount: d.totalAmount,
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
