import { NextResponse } from "next/server";

const HUBSPOT_API = "https://api.hubapi.com";
const TOKEN = process.env.HUBSPOT_PRIVATE_TOKEN!;
const PIPELINE_ID = "12060148"; // Sende "Araç Kiralama Süreci" pipeline id'si bu

export async function GET() {
  try {
    // Hubspot max 100 adet dönüyor, bu nedenle pagination lazım!
    let after: string | null = null;
    let hasMore = true;
    const stageData: Record<string, { count: number; totalAmount: number }> = {};

    while (hasMore) {
      const res = await fetch(`${HUBSPOT_API}/crm/v3/objects/deals/search`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                { propertyName: "pipeline", operator: "EQ", value: PIPELINE_ID },
              ],
            },
          ],
          properties: ["dealstage", "amount"],
          limit: 100,
          ...(after ? { after } : {}),
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        return NextResponse.json({ error: errorText }, { status: res.status });
      }

      const data = await res.json();

      for (const deal of data.results || []) {
        const stage = deal.properties?.dealstage || "bilinmeyen";
        const amount = parseFloat(deal.properties?.amount || "0");

        if (!stageData[stage]) {
          stageData[stage] = { count: 0, totalAmount: 0 };
        }
        stageData[stage].count += 1;
        stageData[stage].totalAmount += isNaN(amount) ? 0 : amount;
      }

      after = data.paging?.next?.after || null;
      hasMore = Boolean(after);
    }

    return NextResponse.json({ success: true, data: stageData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
