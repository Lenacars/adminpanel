import { NextRequest, NextResponse } from "next/server";

const HUBSPOT_API = "https://api.hubapi.com";
const TOKEN = process.env.HUBSPOT_PRIVATE_TOKEN!;

const MANUAL_OWNER_MAP: Record<string, string> = {
  "26.066.921": "LenaCars",
  "46.165.993": "BUDAK EMRE",
  "27.555.920": "Lokman Işık",
  "47.871.939": "Elif Bilgin",
  "29.503.361": "Alper Tezal",
  "48.116.737": "Ayşegül Gündoğdu",
  "64.776.577": "Ayşegül Gündogdu",
  "66.383.712": "Ramazan Akgündüz",
  "43.674.251": "Funda Lena Nazik",
  "43.838.259": "Ali Karyağdı",
  "80.947.825": "Oğulcan Güneş",
  "46.589.348": "LenaCars Kiralama",
  "46.589.409": "Berat ÖZCAN",
  "56.927.612": "Bahar Demirel",
  "43.674.254": "Selçuk Nazik",
  "2.414.318": "Cafer Çavdar",
  "65.455.742": "Funda Lena",
  "80.947.829": "Furkan",
  "64.777.059": "Bahar Demirel",
  "46.589.398": "DİLEK YILDIZ",
  "46.164.692": "Canser Seven"
};

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

  const map: Record<string, string> = { ...MANUAL_OWNER_MAP };
  owners.forEach((o: any) => {
    if (!map[o.id]) {
      map[o.id] =
        o.firstName || o.lastName
          ? `${o.firstName || ""} ${o.lastName || ""}`.trim()
          : o.email || o.id;
    }
  });
  return map;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pipelineId = searchParams.get("pipelineId") || "default";
  const period = searchParams.get("period");

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

    // Filtre: Tarih aralığına göre işle
    const now = new Date();
    let minDate: Date | undefined = undefined;
    if (period === "1ay") minDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    if (period === "6ay") minDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    if (period === "12ay") minDate = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
    if (period === "24ay") minDate = new Date(now.getFullYear(), now.getMonth() - 24, now.getDate());
    if (period === "36ay") minDate = new Date(now.getFullYear(), now.getMonth() - 36, now.getDate());

    if (minDate) {
      allDeals = allDeals.filter(deal => {
        const dt = deal.properties?.createdate ? new Date(Number(deal.properties.createdate)) : undefined;
        return dt && dt >= minDate;
      });
    }

    const ownerMap = await fetchOwners();

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
