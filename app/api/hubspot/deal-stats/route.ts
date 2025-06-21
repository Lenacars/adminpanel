import { NextRequest, NextResponse } from "next/server";

const HUBSPOT_API = "https://api.hubapi.com";
const TOKEN = process.env.HUBSPOT_PRIVATE_TOKEN!;
const PIPELINE_ID = "default";

const stageMap = {
  "appointmentscheduled": "Teklif Gönderildi",
  "qualifiedtobuy": "Teklife Dönüş Sağladı",
  "presentationscheduled": "Revize Teklif İstedi",
  "decisionmakerboughtin": "Değerlendirme Aşamasında",
  "contractsent": "Mali Evrak İletti",
  "closedwon": "Kazandı",
  "closedlost": "Kaybetti",
};

// Yardımcı: Ayları ms olarak hesapla
const getStartDate = (period: string) => {
  const now = new Date();
  let past: Date;
  if (period === "1ay") past = new Date(now.setMonth(now.getMonth() - 1));
  else if (period === "6ay") past = new Date(now.setMonth(now.getMonth() - 6));
  else if (period === "12ay") past = new Date(now.setMonth(now.getMonth() - 12));
  else past = new Date(now.setMonth(now.getMonth() - 1)); // default: son 1 ay
  return past.getTime();
};

export async function GET(req: NextRequest) {
  try {
    // URL’den “period” parametresini oku (ör: ?period=6ay)
    const period = req.nextUrl.searchParams.get("period") || "1ay";
    const startDate = getStartDate(period);

    const stats: any[] = [];

    for (const [stageId, stageName] of Object.entries(stageMap)) {
      const body: any = {
        filterGroups: [
          {
            filters: [
              { propertyName: "pipeline", operator: "EQ", value: PIPELINE_ID },
              { propertyName: "dealstage", operator: "EQ", value: stageId },
              { propertyName: "createdate", operator: "GTE", value: startDate },
            ],
          },
        ],
        properties: ["amount"],
        limit: 100, // Yine sayfalama koyulabilir!
      };

      let after = undefined;
      let count = 0;
      let totalAmount = 0;
      let hasMore = true;

      while (hasMore) {
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
        if (data.results) {
          count += data.results.length;
          totalAmount += data.results.reduce(
            (sum: number, deal: any) =>
              sum + (parseFloat(deal.properties?.amount || "0") || 0),
            0
          );
        }
        after = data.paging?.next?.after;
        hasMore = !!after;
      }

      stats.push({
        id: stageId,
        name: stageName,
        count,
        totalAmount,
      });
    }

    return NextResponse.json({ success: true, data: stats });
  } catch (err: any) {
    console.error("Server Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
