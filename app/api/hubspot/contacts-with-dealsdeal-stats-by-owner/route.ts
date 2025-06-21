// app/api/hubspot/deal-stats-by-owner/route.ts

import { NextResponse } from "next/server";
const HUBSPOT_API = "https://api.hubapi.com";
const TOKEN = process.env.HUBSPOT_PRIVATE_TOKEN!;
const PIPELINE_ID = "default"; // veya "1234567" gibi

export async function GET() {
  try {
    // 1. Deal’leri pipeline filtresiyle çekiyoruz
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
        properties: ["dealstage", "amount", "hubspot_owner_id"],
        limit: 100,
      }),
    });
    const dealsData = await dealsRes.json();

    // 2. Kullanıcıları çek (owners)
    const ownersRes = await fetch(`${HUBSPOT_API}/crm/v3/owners`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    const ownersData = await ownersRes.json();

    // 3. Owner bazlı grupla ve hesapla
    // ... (kısa kod için burası özet)
    // Cevap: [{ ownerId, ownerName, count, totalAmount }, ...]

    return NextResponse.json({ success: true, data: [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
