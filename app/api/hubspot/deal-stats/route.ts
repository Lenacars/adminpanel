import { NextResponse } from "next/server";

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

export async function GET() {
  try {
    const stats: any[] = [];

    for (const [stageId, stageName] of Object.entries(stageMap)) {
      // Sadece bu aşamadaki fırsatları çekiyoruz, limit yüksek tut ama sadece properties ile
      const body: any = {
        filterGroups: [
          {
            filters: [
              { propertyName: "pipeline", operator: "EQ", value: PIPELINE_ID },
              { propertyName: "dealstage", operator: "EQ", value: stageId },
            ],
          },
        ],
        properties: ["amount"],
        limit: 100, // 100 üzeri varsa, istersen sayfalama ile toplayabilirsin (bakınız not)
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
        // Çok büyük stage'ler için burada istersen toplam sayıyı limitleyebilirsin
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
