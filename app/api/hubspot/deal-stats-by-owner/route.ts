import { NextRequest, NextResponse } from "next/server";

const HUBSPOT_API = "https://api.hubapi.com";
const TOKEN = process.env.HUBSPOT_PRIVATE_TOKEN!;

// Manuel UserId - İsim map'i (güncellenebilir)
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

function getPeriodStart(period: string): Date | null {
  const now = new Date();
  switch (period) {
    case "1ay": return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case "6ay": return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    case "12ay": return new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
    case "24ay": return new Date(now.getFullYear(), now.getMonth() - 24, now.getDate());
    case "36ay": return new Date(now.getFullYear(), now.getMonth() - 36, now.getDate());
    default: return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pipelineId = searchParams.get("pipelineId") || "default";
  const period = searchParams.get("period") || "1ay";
  const minDate = getPeriodStart(period);

  try {
    let after: string | undefined = undefined;
    let hasMore = true;
    let allDeals: any[] = [];

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

    // Tarih filtresi uygula
    let filteredDeals = allDeals;
    if (minDate) {
      filteredDeals = allDeals.filter(deal => {
        const rawDate = deal.properties?.createdate;
        if (!rawDate) return false;
        const dt = isNaN(Number(rawDate)) ? new Date(rawDate) : new Date(Number(rawDate));
        return dt >= minDate;
      });
    }

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
      ownerName: USER_MAP[ownerId] || ownerId,
      count: d.count,
      totalAmount: d.totalAmount,
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
