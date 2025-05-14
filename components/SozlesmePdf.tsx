import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

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

const SozlesmePdf: React.FC<SozlesmePdfProps> = ({
  musteriAdi = "",
  aracModel = "",
  baslangicTarihi = "",
  bitisTarihi = "",
  fiyat = "",
}) => {
  // PDF içi console.log sadece local çalışır ama `toBuffer` aşamasında bile parse eder
  console.log("✅ SozlesmePdf verisi:", {
    musteriAdi,
    aracModel,
    baslangicTarihi,
    bitisTarihi,
    fiyat,
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.bold}>ARAÇ KİRALAMA SÖZLEŞMESİ</Text>
          <Text>{`\nTARİH: ${new Date().toLocaleDateString("tr-TR")}`}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>MÜŞTERİ BİLGİLERİ</Text>
          <Text>Adı: {musteriAdi || "-"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>ARAÇ BİLGİLERİ</Text>
          <Text>Model: {aracModel || "-"}</Text>
          <Text>Kiralama Süresi: {baslangicTarihi || "-"} → {bitisTarihi || "-"}</Text>
          <Text>Kira Bedeli: {fiyat?.toString() || "0"} ₺</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>GENEL HÜKÜMLER</Text>
          <Text>- Bu sözleşme {musteriAdi || "-"} ile LenaCars arasında geçerlidir.</Text>
          <Text>- Araç {baslangicTarihi || "-"} - {bitisTarihi || "-"} arası kiralanmıştır.</Text>
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
