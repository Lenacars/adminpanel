"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const tabs = [
  { key: "sozlesme", label: "Sözleşme Oluştur" },
  { key: "siparis", label: "Sipariş Onay Formu" },
];

export default function SozlesmePage() {
  const [activeTab, setActiveTab] = useState("sozlesme");
  const [loading, setLoading] = useState(false);

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
    const form = isSozlesme ? sozlesmeForm : siparisForm;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      toast({
        title: "✅ PDF Oluşturuldu",
        description: "Belge başarıyla yüklendi.",
        duration: 4000,
        className:
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 text-black px-6 py-4 rounded shadow-xl z-[9999]",
      });

      // formu sıfırla
      if (isSozlesme) {
        setSozlesmeForm({ musteriAdi: "", adres: "", vergiDairesi: "", eposta: "" });
      } else {
        setSiparisForm({
          musteriAdi: "",
          aracMarka: "",
          adet: "1",
          kiraSuresi: "",
          kmLimiti: "",
          kiraTutari: "",
        });
      }
    } else {
      toast({
        title: "❌ Hata",
        description: data.message || "Bir hata oluştu.",
        className:
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white px-6 py-4 rounded shadow-xl z-[9999]",
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded space-y-6">
      {/* Sekmeler */}
      <div className="flex justify-center gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded font-medium ${
              activeTab === tab.key ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Formlar */}
      {activeTab === "sozlesme" && (
        <>
          <h2 className="text-lg font-semibold text-center">Sözleşme Bilgileri</h2>
          <FormInput label="Kiracı Unvanı" name="musteriAdi" value={sozlesmeForm.musteriAdi} onChange={handleSozlesmeChange} />
          <FormInput label="Kiracı Adresi" name="adres" value={sozlesmeForm.adres} onChange={handleSozlesmeChange} />
          <FormInput label="Vergi Dairesi - Vergi No" name="vergiDairesi" value={sozlesmeForm.vergiDairesi} onChange={handleSozlesmeChange} />
          <FormInput label="Fatura E-posta Adresi" name="eposta" value={sozlesmeForm.eposta} onChange={handleSozlesmeChange} />
        </>
      )}

      {activeTab === "siparis" && (
        <>
          <h2 className="text-lg font-semibold text-center">Sipariş Onay Formu</h2>
          <FormInput label="Kiracı Unvanı" name="musteriAdi" value={siparisForm.musteriAdi} onChange={handleSiparisChange} />
          <FormInput label="Araç Marka / Model" name="aracMarka" value={siparisForm.aracMarka} onChange={handleSiparisChange} />
          <FormInput label="Adet" name="adet" type="number" value={siparisForm.adet} onChange={handleSiparisChange} />
          <FormInput label="Kira Süresi" name="kiraSuresi" value={siparisForm.kiraSuresi} onChange={handleSiparisChange} />
          <FormInput label="Kilometre Limiti / Ay" name="kmLimiti" value={siparisForm.kmLimiti} onChange={handleSiparisChange} />
          <FormInput label="Kira Tutarı / Ay" name="kiraTutari" value={siparisForm.kiraTutari} onChange={handleSiparisChange} />
        </>
      )}

      <Button className="w-full" onClick={handleSubmit} disabled={loading}>
        {loading ? "Oluşturuluyor..." : "PDF Oluştur"}
      </Button>
    </div>
  );
}

function FormInput({
  label,
  name,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} value={value} onChange={onChange} type={type} />
    </div>
  );
}
