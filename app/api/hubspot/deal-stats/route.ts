import { NextResponse } from "next/server";

const HUBSPOT_API = "https://api.hubapi.com";
const TOKEN = process.env.HUBSPOT_PRIVATE_TOKEN!;
const PIPELINE_ID = "12060148"; // Araç Kiralama Süreci pipeline ID'si
const LIMIT = 100;

export async function GET() {
  try {
    let after: string | null = null;
    const stageData: Record<string, { count: number; totalAmount: number }> = {};

    while (true) {
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

      if (!res.ok) {
        console.error("API error:", await res.text());
        return NextResponse.json({ error: "API hatası" }, { status: res.status });
      }

      const data = await res.json();
      const deals = (data.results || []).filter(
        (deal: any) => deal.properties?.pipeline === PIPELINE_ID
      );

      for (const deal of deals) {
        const stage = deal.properties?.dealstage || "bilinmeyen";
        const amount = parseFloat(deal.properties?.amount || "0");

        if (!stageData[stage]) {
          stageData[stage] = { count: 0, totalAmount: 0 };
        }

        stageData[stage].count += 1;
        stageData[stage].totalAmount += amount;
      }

      after = data.paging?.next?.after;
      if (!after) break;
    }

    return NextResponse.json({ success: true, data: stageData });
  } catch (err) {
    console.error("Server hatası:", err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
