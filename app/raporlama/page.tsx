"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

// Filtre seçenekleri
const filters = [
  { key: "1ay", label: "Son 1 Ay" },
  { key: "6ay", label: "Son 6 Ay" },
  { key: "12ay", label: "Son 12 Ay" },
  { key: "24ay", label: "Son 24 Ay" },
  { key: "36ay", label: "Son 36 Ay" },
];

// Kurumsal renk kodunu buraya tanımlıyoruz, böylece kolayca erişebiliriz.
const CORPORATE_COLOR = "#6A3C96";
const CORPORATE_COLOR_LIGHT = "#9a6cb6"; // Kurumsal rengin daha açık bir tonu
const CORPORATE_COLOR_DARK = "#4d296b"; // Kurumsal rengin daha koyu bir tonu

export default function RaporlamaPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("1ay");

  useEffect(() => {
    console.log("Filtre değişti, yeni sorgu:", selectedFilter);
    setLoading(true);

    fetch(`/api/hubspot/deal-stats?period=${selectedFilter}`)
      .then((res) => {
        if (!res.ok) {
          console.error("API yanıtı OK değil:", res.status, res.statusText);
          throw new Error("Sunucudan yanıt alınamadı.");
        }
        return res.json();
      })
      .then((data) => {
        console.log("API'dan gelen data:", data);
        setStats(data.data || []);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        console.error("Veri çekme hatası:", err);
        setError("Veriler yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.");
        setLoading(false);
      });
  }, [selectedFilter]);

  // Debug log: render edilen stats
  console.log("RENDER ANINDA stats:", stats);

  if (loading) {
    console.log("Yükleniyor durumu aktif.");
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-xl font-medium text-gray-700 animate-pulse">Veriler Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    console.log("Hata durumu:", error);
    return (
      <div className="flex justify-center items-center h-screen bg-red-50 text-red-700 border border-red-300 rounded-lg p-6 m-4 shadow-md">
        <div className="text-xl font-medium">{error}</div>
      </div>
    );
  }

  if (!stats.length) {
    console.log("Boş veri! Stats uzunluğu:", stats.length);
    return (
      <div className="flex justify-center items-center h-screen bg-yellow-50 text-yellow-700 border border-yellow-300 rounded-lg p-6 m-4 shadow-md">
        <div className="text-xl font-medium">Gösterilecek kayıt bulunamadı. Lütfen filtreyi değiştirerek tekrar deneyin.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 lg:p-12">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight" style={{ color: CORPORATE_COLOR_DARK }}>
          HubSpot Anlaşma Raporları
        </h1>
        <p className="mt-2 text-lg text-gray-600">Seçili döneme göre anlaşma performansını inceleyin.</p>
      </header>

      {/* Filtreleme Butonları */}
      <section className="mb-8 flex justify-center gap-3 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ease-in-out shadow-sm
              ${selectedFilter === f.key
                ? "text-white shadow-lg transform scale-105"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:border-gray-400"
              }`}
            style={{
                backgroundColor: selectedFilter === f.key ? CORPORATE_COLOR : undefined,
                color: selectedFilter === f.key ? 'white' : CORPORATE_COLOR,
                borderColor: selectedFilter === f.key ? undefined : CORPORATE_COLOR_LIGHT,
            }}
            onClick={() => {
              console.log("Filtreye tıklandı:", f.key);
              setSelectedFilter(f.key);
            }}
          >
            {f.label}
          </button>
        ))}
      </section>

      <div className="max-w-7xl mx-auto">
        {/* Özet Kutuları */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {stats.map((info: any) => (
            <div
              key={info.id}
              className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 flex flex-col items-center justify-center text-center transform hover:scale-105 transition-transform duration-300 ease-in-out group"
            >
              <h2 className="font-bold text-xl text-gray-700 mb-3 group-hover:text-blue-600 transition-colors" style={{ color: CORPORATE_COLOR }}>
                {info.name}
              </h2>
              <div className="text-gray-600 text-base space-y-1">
                <p>
                  <span className="font-medium">Toplam Anlaşma:</span>{" "}
                  <span className="font-bold text-lg" style={{ color: CORPORATE_COLOR_DARK }}>{info.count}</span>
                </p>
                <p>
                  <span className="font-medium">Toplam Tutar:</span>{" "}
                  <span className="font-extrabold text-xl" style={{ color: CORPORATE_COLOR }}>
                    ₺{Number(info.totalAmount).toLocaleString("tr-TR")}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Grafik Alanı */}
        <section className="bg-white rounded-2xl shadow-xl p-6 md:p-10 mb-8" style={{ height: 600 }}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center" style={{ color: CORPORATE_COLOR_DARK }}>
            Aşama Bazlı Anlaşma Dağılımı
          </h2>
          {console.log("BarChart'a giden stats:", stats)}
          <ResponsiveContainer width="100%" height={500}>
            <BarChart
              data={stats}
              barCategoryGap={30} // Barlar arası boşluğu biraz azalt
              barGap={4} // Barların kendi içindeki boşluğu azalt
              margin={{
                top: 20,
                right: 50, // Sağdan boşluğu artır
                left: 40, // Soldan boşluğu artır
                bottom: 80, // Alt boşluğu daha da artır (X ekseni için)
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="name"
                angle={-35} // Eğimi biraz daha artır
                textAnchor="end"
                height={100} // X ekseni alanının yüksekliğini artır
                interval={0} // Tüm etiketleri göster (atlama yapma)
                tickFormatter={(value) =>
                  value.length > 15 ? value.substring(0, 15) + "..." : value // Kısaltma sınırını düşür
                }
                tick={{ fill: "#555", fontSize: 13 }} // X ekseni etiketlerinin font boyutunu küçült
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke={CORPORATE_COLOR}
                tick={{ fill: "#555", fontSize: 13 }} // Y ekseni etiketlerinin font boyutunu küçült
                label={{
                  value: "Anlaşma Adedi",
                  angle: -90,
                  position: "insideLeft",
                  fill: CORPORATE_COLOR,
                  fontSize: 14, // Y ekseni label font boyutunu küçült
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={CORPORATE_COLOR_LIGHT}
                tickFormatter={(val: any) => `₺${Number(val).toLocaleString("tr-TR")}`}
                tick={{ fill: "#555", fontSize: 13 }} // Y ekseni etiketlerinin font boyutunu küçült
                label={{
                  value: "Toplam Tutar (₺)",
                  angle: 90,
                  position: "insideRight",
                  fill: CORPORATE_COLOR_LIGHT,
                  fontSize: 14, // Y ekseni label font boyutunu küçült
                }}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
                formatter={(value: any, name: string) => {
                  if (name === "Toplam Tutar") {
                    return `₺${Number(value).toLocaleString("tr-TR")}`;
                  }
                  return value;
                }}
                labelFormatter={(label) => `Aşama: ${label}`}
                contentStyle={{
                  borderRadius: "8px",
                  border: `1px solid ${CORPORATE_COLOR_LIGHT}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                itemStyle={{ padding: "4px 0", color: CORPORATE_COLOR_DARK }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px", fontSize: 16 }} // Legend font boyutunu küçült
                iconType="circle"
                verticalAlign="top"
                align="center" // Legend'ı ortaya hizala
              />
              <Bar
                yAxisId="left"
                dataKey="count"
                fill={CORPORATE_COLOR}
                name="Anlaşma Adedi"
                barSize={28}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="totalAmount"
                fill={CORPORATE_COLOR_LIGHT}
                name="Toplam Tutar"
                barSize={28}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}
