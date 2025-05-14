import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  section: { marginBottom: 10 },
  bold: { fontWeight: "bold" },
});

type SozlesmePdfProps = {
  musteriAdi?: string;
  aracModel?: string;
  baslangicTarihi?: string;
  bitisTarihi?: string;
  fiyat?: string;
};

const SozlesmePdf = (inputProps: SozlesmePdfProps = {}) => {
  const {
    musteriAdi = "",
    aracModel = "",
    baslangicTarihi = "",
    bitisTarihi = "",
    fiyat = "",
  } = inputProps ?? {};

  console.log("📄 SozlesmePdf props:", {
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
          <Text>Adı: {musteriAdi}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>ARAÇ BİLGİLERİ</Text>
          <Text>Model: {aracModel}</Text>
          <Text>Süre: {baslangicTarihi} → {bitisTarihi}</Text>
          <Text>Bedel: {fiyat} ₺</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>GENEL HÜKÜMLER</Text>
          <Text>- Bu sözleşme {musteriAdi} ile LenaCars arasında geçerlidir.</Text>
          <Text>- Araç {baslangicTarihi} - {bitisTarihi} arası kiralanmıştır.</Text>
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
