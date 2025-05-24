"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Card bileşenleri
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Tabs bileşenleri
import { toast } from "@/hooks/use-toast"; // shadcn/ui toast
import { Loader2, FileText, ClipboardCheck } from "lucide-react"; // İkonlar

const TABS_CONFIG = [
  { key: "sozlesme", label: "Sözleşme Oluştur", icon: <FileText className="w-4 h-4 mr-2" /> },
  { key: "siparis", label: "Sipariş Onay Formu", icon: <ClipboardCheck className="w-4 h-4 mr-2" /> },
];

// FormInput bileşeni (değişiklik yok, ama focus rengi için stil eklenebilir)
function FormInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const corporateColor = "#6A3C96";
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input 
        id={name} 
        name={name} 
        value={value} 
        onChange={onChange} 
        type={type}
        placeholder={placeholder || label}
        required={required}
        className="focus-visible:ring-1" // shadcn/ui Input focus stili
        style={{ "--ring-color": corporateColor } as React.CSSProperties} // Focus rengi için
      />
    </div>
  );
}

export default function SozlesmePage() {
  const [activeTab, setActiveTab] = useState("sozlesme");
  const [loading, setLoading] = useState(false);
  // const [successMessage, setSuccessMessage] = useState(""); // Toast ile değiştirilecek

  const corporateColor = "#6A3C96";

  const [sozlesmeForm, setSozlesmeForm] = useState({
    musteriAdi: "",
    adres: "",
    vergiDairesi: "",
    eposta: "",
  });

  const [siparisForm, setSiparisForm] = useState({
    musteriAdi: "",
    aracMarka: "",
    adet: "1",
    kiraSuresi: "",
    kmLimiti: "",
    kiraTutari: "",
  });

  const handleSozlesmeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSozlesmeForm({ ...sozlesmeForm, [e.target.name]: e.target.value });
  };

  const handleSiparisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSiparisForm({ ...siparisForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    const isSozlesme = activeTab === "sozlesme";
    const endpoint = isSozlesme ? "/api/sozlesme" : "/api/siparis";
    const formToSubmit = isSozlesme ? sozlesmeForm : siparisForm;

    // Basit bir client-side validasyon (gerekirse daha kapsamlı yapılabilir)
    const requiredFields = isSozlesme 
        ? ["musteriAdi", "adres", "vergiDairesi", "eposta"] 
        : ["musteriAdi", "aracMarka", "adet", "kiraSuresi", "kmLimiti", "kiraTutari"];
    
    for (const field of requiredFields) {
        if (!(formToSubmit as any)[field].trim()) {
            toast({
                title: "Eksik Bilgi",
                description: `Lütfen "${field}" alanını doldurun.`, // Daha kullanıcı dostu bir field adı gösterilebilir
                variant: "destructive",
            });
            setLoading(false);
            return;
        }
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToSubmit),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Başarılı ✅",
          description: data.message || `${isSozlesme ? "Sözleşme" : "Sipariş Onay Formu"} PDF'i başarıyla oluşturuldu.`,
          variant: "default", // veya temanızda "success" varsa
        });

        // Formu sıfırla
        if (isSozlesme) {
          setSozlesmeForm({ musteriAdi: "", adres: "", vergiDairesi: "", eposta: "" });
        } else {
          setSiparisForm({
            musteriAdi: "", aracMarka: "", adet: "1", kiraSuresi: "", kmLimiti: "", kiraTutari: "",
          });
        }
      } else {
        throw new Error(data.message || "Bilinmeyen bir sunucu hatası oluştu.");
      }
    } catch (error: any) {
      toast({
        title: "Hata Oluştu",
        description: error.message || "PDF oluşturulurken bir sorunla karşılaşıldı.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-xl shadow-xl"> {/* Sayfa içeriği Card içine alındı */}
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold" style={{ color: corporateColor }}>
            Belge Oluşturma Merkezi
          </CardTitle>
          <CardDescription>
            Sözleşme veya sipariş onay formu oluşturmak için ilgili sekmeyi seçin.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 sm:pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="sozlesme" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
              {TABS_CONFIG.map((tab) => (
                <TabsTrigger 
                    key={tab.key} 
                    value={tab.key} 
                    className="text-sm sm:text-base data-[state=active]:text-white h-10"
                    style={activeTab === tab.key ? {backgroundColor: corporateColor} : {}}
                >
                  {tab.icon} {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="sozlesme" className="space-y-4">
              {/* <h2 className="text-lg font-semibold text-center text-gray-700 mb-2">Sözleşme Bilgileri</h2> */}
              <FormInput label="Kiracı Unvanı" name="musteriAdi" value={sozlesmeForm.musteriAdi} onChange={handleSozlesmeChange} placeholder="Örn: Lena Cars A.Ş." required />
              <FormInput label="Kiracı Adresi" name="adres" value={sozlesmeForm.adres} onChange={handleSozlesmeChange} placeholder="Tam adres" required />
              <FormInput label="Vergi Dairesi - Vergi No" name="vergiDairesi" value={sozlesmeForm.vergiDairesi} onChange={handleSozlesmeChange} placeholder="Örn: Maslak V.D. - 1234567890" required />
              <FormInput label="Fatura E-posta Adresi" name="eposta" type="email" value={sozlesmeForm.eposta} onChange={handleSozlesmeChange} placeholder="fatura@example.com" required />
            </TabsContent>

            <TabsContent value="siparis" className="space-y-4">
              {/* <h2 className="text-lg font-semibold text-center text-gray-700 mb-2">Sipariş Onay Formu Bilgileri</h2> */}
              <FormInput label="Kiracı Unvanı" name="musteriAdi" value={siparisForm.musteriAdi} onChange={handleSiparisChange} placeholder="Örn: Müşteri Ltd. Şti." required />
              <FormInput label="Araç Marka / Model" name="aracMarka" value={siparisForm.aracMarka} onChange={handleSiparisChange} placeholder="Örn: Audi A4 2.0 TDI" required />
              <FormInput label="Adet" name="adet" type="number" value={siparisForm.adet} onChange={handleSiparisChange} placeholder="1" required />
              <FormInput label="Kira Süresi (Ay)" name="kiraSuresi" value={siparisForm.kiraSuresi} onChange={handleSiparisChange} placeholder="Örn: 12 Ay" required />
              <FormInput label="Kilometre Limiti / Ay" name="kmLimiti" value={siparisForm.kmLimiti} onChange={handleSiparisChange} placeholder="Örn: 2.500 KM" required />
              <FormInput label="Kira Tutarı / Ay (₺)" name="kiraTutari" type="text" value={siparisForm.kiraTutari} onChange={handleSiparisChange} placeholder="Örn: 15.000" required />
            </TabsContent>
          </Tabs>

          <Button 
            className="w-full mt-8 h-11 text-base" 
            onClick={handleSubmit} 
            disabled={loading}
            style={{ backgroundColor: loading ? undefined : corporateColor }}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Oluşturuluyor...
              </>
            ) : (
              "PDF Oluştur ve İndir"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
