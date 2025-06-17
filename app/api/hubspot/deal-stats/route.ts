import { NextResponse } from "next/server";

const HUBSPOT_API = "https://api.hubapi.com";
const TOKEN = process.env.HUBSPOT_PRIVATE_TOKEN!;
const PIPELINE_ID = "12060148"; // Araç Kiralama Süreci pipeline ID'si

export async function GET() {
  try {
    const url = `${HUBSPOT_API}/crm/v3/objects/deals/search`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [{ propertyName: "pipeline", operator: "EQ", value: PIPELINE_ID }],
          },
        ],
        properties: ["dealstage", "amount"],
        limit: 100,
      }),
    });

    if (!res.ok) {
      console.error("HubSpot API Error:", await res.text());
      return NextResponse.json({ error: "HubSpot API Error" }, { status: res.status });
    }

    const data = await res.json();

    const stageData: Record<string, { count: number; totalAmount: number }> = {};

    for (const deal of data.results) {
      const stage = deal.properties?.dealstage || "bilinmeyen";
      const amount = parseFloat(deal.properties?.amount || "0");

      if (!stageData[stage]) {
        stageData[stage] = { count: 0, totalAmount: 0 };
      }

      stageData[stage].count += 1;
      stageData[stage].totalAmount += amount;
    }

    return NextResponse.json({ success: true, data: stageData });
  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
