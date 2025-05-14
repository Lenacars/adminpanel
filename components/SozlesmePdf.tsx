import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

// 🎯 Güvenli metin dönüşümü için yardımcı
const safe = (val: any, label = ""): string => {
  let result = "-";
  try {
    if (val === null || val === undefined) {
      console.warn(`⚠️ "${label}" alanı boş geldi`);
      return "-";
    }
    if (typeof val === "number") result = val.toFixed(2);
    else if (typeof val === "string") result = val;
    else if (typeof val.toString === "function") result = val.toString();
    console.log(`✅ "${label}" =`, result);
    return result;
  } catch (e) {
    console.error(`❌ safe() içinde hata: ${label}`, e);
    return "-";
  }
};

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  section: { marginBottom: 10 },
  bold: { fontWeight: "bold" },
});

type SozlesmePdfProps = {
  musteriAdi?: string | null;
  aracModel?: string | null;
  baslangicTarihi?: string | null;
  bitisTarihi?: string | null;
  fiyat?: string | number | null;
};

const SozlesmePdf: React.FC<SozlesmePdfProps> = (props) => {
  console.log("🧾 SozlesmePdf bileşeni render ediliyor");
  console.log("📥 Gelen props:", props);

  const {
    musteriAdi = "",
    aracModel = "",
    baslangicTarihi = "",
    bitisTarihi = "",
    fiyat = "",
  } = props ?? {};

  const tarih = new Date().toLocaleDateString("tr-TR");
  console.log("🗓️ Belge tarihi:", tarih);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.bold}>ARAÇ KİRALAMA SÖZLEŞMESİ</Text>
          <Text>{`\nTARİH: ${tarih}`}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>MÜŞTERİ BİLGİLERİ</Text>
          <Text>Adı: {safe(musteriAdi, "musteriAdi")}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>ARAÇ BİLGİLERİ</Text>
          <Text>Model: {safe(aracModel, "aracModel")}</Text>
          <Text>Süre: {safe(baslangicTarihi, "baslangicTarihi")} → {safe(bitisTarihi, "bitisTarihi")}</Text>
          <Text>Bedel: {safe(fiyat, "fiyat")} ₺</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>GENEL HÜKÜMLER</Text>
          <Text>- Bu sözleşme {safe(musteriAdi, "musteriAdi")} ile LenaCars arasında geçerlidir.</Text>
          <Text>- Araç {safe(baslangicTarihi, "baslangicTarihi")} - {safe(bitisTarihi, "bitisTarihi")} arası kiralanmıştır.</Text>
          <Text>- Ödeme bedeli {safe(fiyat, "fiyat")} ₺ olarak alınmıştır.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>İMZALAR</Text>
          <Text>MÜŞTERİ: ____________________</Text>
          <Text>LenaCars: ____________________</Text>
        </View>
      </Page>
    </Document>
  );
};

export default SozlesmePdf;
