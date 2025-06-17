import { NextResponse } from "next/server";

const HUBSPOT_API = "https://api.hubapi.com";
const TOKEN = process.env.HUBSPOT_PRIVATE_TOKEN!;
const LIMIT = 100;
const PIPELINE_ID = "12060148"; // ✅ Araç Kiralama Süreci'nin ID'si

export async function GET() {
  try {
    let deals: any[] = [];
    let after: string | null = null;

    // Tüm deal'ları sayfa sayfa çek
    do {
      const url = new URL(`${HUBSPOT_API}/crm/v3/objects/deals`);
      url.searchParams.set("limit", LIMIT.toString());
      url.searchParams.set("archived", "false");
      url.searchParams.set("properties", "dealstage,amount,pipeline");
      if (after) url.searchParams.set("after", after);

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      const pageDeals = (data.results || []).filter(
        (d: any) => d.properties?.pipeline === PIPELINE_ID
      );
      deals.push(...pageDeals);
      after = data.paging?.next?.after || null;
    } while (after);

    const stats: Record<string, { count: number; totalAmount: number }> = {};

    for (const deal of deals) {
      const stage = deal.properties?.dealstage || "Bilinmeyen";
      const amount = parseFloat(deal.properties?.amount || "0");

      if (!stats[stage]) {
        stats[stage] = { count: 0, totalAmount: 0 };
      }

      stats[stage].count += 1;
      stats[stage].totalAmount += isNaN(amount) ? 0 : amount;
    }

    return NextResponse.json({ pipeline_summary: stats });
  } catch (error) {
    return NextResponse.json({ error: "Veri alınamadı" }, { status: 500 });
  }
}
