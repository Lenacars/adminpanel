import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
  },
  section: {
    marginBottom: 10,
  },
  bold: {
    fontWeight: "bold",
  },
});

interface SozlesmePdfProps {
  musteriAdi?: string;
  aracModel?: string;
  baslangicTarihi?: string;
  bitisTarihi?: string;
  fiyat?: string;
}

const SozlesmePdf: React.FC<SozlesmePdfProps> = ({
  musteriAdi = "",
  aracModel = "",
  baslangicTarihi = "",
  bitisTarihi = "",
  fiyat = "",
}) => {
  const today = new Date();
  const tarih = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.bold}>LenaCars Araç Kiralama Sözleşmesi</Text>
        </View>
        <View style={styles.section}>
          <Text>{`Müşteri Adı: ${musteriAdi}`}</Text>
          <Text>{`Araç Modeli: ${aracModel}`}</Text>
          <Text>{`Başlangıç Tarihi: ${baslangicTarihi}`}</Text>
          <Text>{`Bitiş Tarihi: ${bitisTarihi}`}</Text>
          <Text>{`Toplam Fiyat: ${fiyat} ₺`}</Text>
        </View>
        <View style={styles.section}>
          <Text>Bu sözleşme LenaCars ile müşteri arasında hazırlanmıştır.</Text>
          <Text>Tüm trafik cezaları, gecikmeler ve masraflar müşteri sorumluluğundadır.</Text>
        </View>
        <View style={styles.section}>
          <Text>{`Tarih: ${tarih}`}</Text>
        </View>
        <View style={styles.section}>
          <Text>_______________________</Text>
          <Text>Müşteri İmzası</Text>
        </View>
        <View style={styles.section}>
          <Text>_______________________</Text>
          <Text>LenaCars Yetkilisi</Text>
        </View>
      </Page>
    </Document>
  );
};

export default SozlesmePdf;
