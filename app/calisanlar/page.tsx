"use client";

import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase"; // Direkt Supabase kullanımı yerine API çağrısı var
import { toast } from "@/hooks/use-toast";

// shadcn/ui Bileşenleri
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// lucide-react İkonları
import { Edit, UserPlus, Save, Loader2, Users, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface Calisan {
  id: string;
  ad: string;
  soyad: string;
  email: string;
  telefon: string;
  rol: string;
  aktif: boolean;
  created_at?: string; // Tabloda gösterim için eklenebilir
}

const ROLLER = ["superadmin", "editor", "musteri_temsilcisi"];
const initialFormState = {
  ad: "",
  soyad: "",
  email: "",
  telefon: "",
  sifre: "",
  rol: "editor",
  aktif: true,
};

export default function CalisanlarPage() {
  const [calisanlar, setCalisanlar] = useState<Calisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Form gönderme durumu

  const [form, setForm] = useState(initialFormState);
  const [duzenlenenId, setDuzenlenenId] = useState<string | null>(null);

  const corporateColor = "#6A3C96"; // Ana kurumsal renk

  useEffect(() => {
    fetchCalisanlar();
  }, []);

  async function fetchCalisanlar() {
    setLoading(true);
    try {
      // Çalışanlar API üzerinden çekiliyorsa, o endpoint kullanılmalı.
      // Şimdilik direkt Supabase varsayımıyla devam ediyorum, ama API endpoint'iniz varsa onu kullanın.
      const { data, error } = await supabase
        .from("calisanlar")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      setCalisanlar(data || []);
    } catch (error: any) {
      console.error("Çalışanlar alınamadı:", error.message);
      toast({ title: "Hata", description: "Çalışan listesi yüklenirken bir sorun oluştu.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setForm(prev => ({ ...prev, [name]: checked }));
  };


  async function handleSubmitCalisan() {
    if (!form.ad || !form.soyad || !form.email || !form.rol || (!duzenlenenId && !form.sifre) ) {
      toast({ title: "Eksik Bilgi", description: "Lütfen tüm gerekli alanları doldurun (Yeni çalışan için şifre zorunludur).", variant: "destructive"});
      return;
    }
    setIsSubmitting(true);

    const payload: any = {
      ad: form.ad,
      soyad: form.soyad,
      email: form.email,
      telefon: form.telefon,
      rol: form.rol,
      aktif: form.aktif, // Aktif durumu eklendi
    };

    if (duzenlenenId) { // Güncelleme
      payload.id = duzenlenenId;
      if (form.sifre) { // Sadece yeni şifre girildiyse gönder
        payload.sifre = form.sifre;
      }
    } else { // Yeni ekleme
      payload.sifre = form.sifre;
    }
    
    try {
      const response = await fetch("/api/calisanlar", {
        method: duzenlenenId ? "PUT" : "POST", // ID varsa PUT, yoksa POST
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast({ title: "Başarılı", description: result.message || `Çalışan başarıyla ${duzenlenenId ? 'güncellendi' : 'eklendi'}.`, variant: "default" });
        resetFormAndMode();
        fetchCalisanlar();
      } else {
        throw new Error(result.error || "Bilinmeyen bir sunucu hatası oluştu.");
      }
    } catch (error: any) {
      console.error("Çalışan kaydetme/güncelleme hatası:", error);
      toast({ title: "Hata", description: error.message || "İşlem sırasında bir hata oluştu.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  function duzenlemeyiBaslat(calisan: Calisan) {
    setForm({
      ad: calisan.ad || "",
      soyad: calisan.soyad || "",
      email: calisan.email || "",
      telefon: calisan.telefon || "",
      sifre: "", // Düzenleme modunda şifre alanı güvenlik için boş başlar
      rol: calisan.rol || "editor",
      aktif: calisan.aktif !== undefined ? calisan.aktif : true, // Aktif durumu ayarla
    });
    setDuzenlenenId(calisan.id);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Formun olduğu yere scroll et
  }

  function resetFormAndMode() {
    setForm(initialFormState);
    setDuzenlenenId(null);
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold" style={{ color: corporateColor }}>
            {duzenlenenId ? "Çalışan Bilgilerini Düzenle" : "Yeni Çalışan Ekle"}
          </CardTitle>
          <CardDescription>
            {duzenlenenId ? `"${form.ad} ${form.soyad}" adlı çalışanın bilgilerini güncelleyin.` : "Sisteme yeni bir çalışan kaydı oluşturun."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ad">Ad *</Label>
              <Input id="ad" name="ad" placeholder="Çalışanın adı" value={form.ad} onChange={handleInputChange} style={{ "--ring-color": corporateColor } as React.CSSProperties} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="soyad">Soyad *</Label>
              <Input id="soyad" name="soyad" placeholder="Çalışanın soyadı" value={form.soyad} onChange={handleInputChange} style={{ "--ring-color": corporateColor } as React.CSSProperties} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-posta Adresi *</Label>
              <Input id="email" name="email" type="email" placeholder="ornek@example.com" value={form.email} onChange={handleInputChange} style={{ "--ring-color": corporateColor } as React.CSSProperties} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefon">Telefon Numarası</Label>
              <Input id="telefon" name="telefon" type="tel" placeholder="05XX XXX XX XX" value={form.telefon} onChange={handleInputChange} style={{ "--ring-color": corporateColor } as React.CSSProperties} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sifre">{duzenlenenId ? "Yeni Şifre (Değiştirmek istemiyorsanız boş bırakın)" : "Şifre *"}</Label>
              <Input id="sifre" name="sifre" type="password" placeholder="••••••••" value={form.sifre} onChange={handleInputChange} style={{ "--ring-color": corporateColor } as React.CSSProperties} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rol">Rol *</Label>
              <Select value={form.rol} onValueChange={(value) => handleSelectChange("rol", value)}>
                <SelectTrigger id="rol" style={{ "--ring-color": corporateColor } as React.CSSProperties}>
                  <SelectValue placeholder="Rol seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {ROLLER.map((rol) => (
                    <SelectItem key={rol} value={rol}>
                      {rol.charAt(0).toUpperCase() + rol.slice(1).replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 mt-2 md:col-span-2">
              <Switch id="aktif" checked={form.aktif} onCheckedChange={(checked) => handleSwitchChange("aktif", checked)} 
                      className="data-[state=checked]:bg-[#6A3C96]" />
              <Label htmlFor="aktif" className="cursor-pointer">Çalışan Aktif mi?</Label>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={handleSubmitCalisan}
              disabled={isSubmitting}
              style={{ backgroundColor: corporateColor }}
              className="text-white hover:opacity-90"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (duzenlenenId ? <Save className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />)}
              {isSubmitting ? (duzenlenenId ? "Güncelleniyor..." : "Ekleniyor...") : (duzenlenenId ? "Değişiklikleri Kaydet" : "Çalışanı Ekle")}
            </Button>
            {duzenlenenId && (
              <Button variant="outline" onClick={resetFormAndMode} disabled={isSubmitting}>
                İptal / Yeni Ekle Moduna Geç
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center" style={{ color: corporateColor }}>
            <Users className="w-7 h-7 mr-2" /> Kayıtlı Çalışanlar
          </CardTitle>
          <CardDescription>Mevcut çalışanları görüntüleyin ve yönetin.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: corporateColor }} />
              <p className="ml-3 text-gray-600">Çalışan listesi yükleniyor...</p>
            </div>
          ) : calisanlar.length === 0 ? (
            <div className="text-center py-10">
                 <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                 <h3 className="text-xl font-semibold text-gray-700 mb-2">Kayıtlı Çalışan Bulunmamaktadır</h3>
                 <p className="text-sm text-gray-500">Yukarıdaki formu kullanarak yeni çalışan ekleyebilirsiniz.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-100/80">
                    <TableHead className="font-semibold" style={{color: corporateColor}}>Ad Soyad</TableHead>
                    <TableHead className="font-semibold" style={{color: corporateColor}}>E-posta</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell" style={{color: corporateColor}}>Telefon</TableHead>
                    <TableHead className="font-semibold" style={{color: corporateColor}}>Rol</TableHead>
                    <TableHead className="font-semibold text-center" style={{color: corporateColor}}>Durum</TableHead>
                    <TableHead className="font-semibold text-right" style={{color: corporateColor}}>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calisanlar.map((c) => (
                    <TableRow key={c.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium">{c.ad} {c.soyad}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{c.telefon || "-"}</TableCell>
                      <TableCell className="capitalize">{c.rol.replace("_", " ")}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={c.aktif ? "default" : "destructive"} 
                               className={c.aktif ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}>
                          {c.aktif ? <CheckCircle2 className="w-3.5 h-3.5 mr-1"/> : <XCircle className="w-3.5 h-3.5 mr-1"/>}
                          {c.aktif ? "Aktif" : "Pasif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => duzenlemeyiBaslat(c)}
                          className="text-xs px-2.5 py-1"
                          style={{color: corporateColor, borderColor: corporateColor}}
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" /> Düzenle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
