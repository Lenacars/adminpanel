import { NextResponse } from "next/server";

const HUBSPOT_API = "https://api.hubapi.com";
const TOKEN = process.env.HUBSPOT_PRIVATE_TOKEN!;
const PIPELINE_ID = "default"; // Eğer pipeline id 'default' ise (görselden), buraya yaz
const DEALSTAGES = [
  { id: "138070510", label: "Teklif İletilecek" },
  { id: "138070511", label: "Teklif Gönderildi" },
  { id: "138070512", label: "Teklife Dönüş Sağladı" },
  { id: "138070513", label: "Revize Teklif İstedi" },
  { id: "138070514", label: "Değerlendirme Aşamasında" },
  { id: "138070515", label: "Mali Evrak İletti" },
  { id: "138070516", label: "Sözleşme İletildi" },
  { id: "closedwon", label: "Won" },
  { id: "closedlost", label: "Lost" },
];

async function getDealCountAndAmount(stageId: string) {
  // Sadece ilgili stage'deki deal sayısını ve amount toplamını döndür
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
          filters: [
            { propertyName: "pipeline", operator: "EQ", value: PIPELINE_ID },
            { propertyName: "dealstage", operator: "EQ", value: stageId },
          ],
        },
      ],
      properties: ["amount"],
      limit: 100, // 100'den fazlaysa total'ı ayrıca sayabilirsin!
    }),
  });

  if (!res.ok) {
    return { count: 0, total: 0 };
  }
  const data = await res.json();
  let total = 0;
  for (const d of data.results || []) {
    total += Number(d.properties?.amount || 0);
  }
  return { count: data.total || (data.results?.length ?? 0), total };
}

export async function GET() {
  const results: any = {};
  for (const stage of DEALSTAGES) {
    // Her stage için tek tek istek at
    // Dilersen Promise.all ile paralel yapabilirsin
    const { count, total } = await getDealCountAndAmount(stage.id);
    results[stage.label] = { count, total };
  }
  return NextResponse.json({ success: true, data: results });
}
