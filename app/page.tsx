"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Oturum kontrolü yap
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login");
      } else {
        setCheckingSession(false); // Oturum varsa gösterime izin ver
      }
    });
  }, []);

  if (checkingSession) {
    return (
      <div className="h-screen flex items-center justify-center text-xl text-[#68399e]">
        Giriş kontrol ediliyor...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* İstatistik kutuları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Toplam Gelir</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">₺45.231,89</p>
            <p className="text-sm text-muted-foreground">+20.1% geçen aydan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Abonelikler</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">+2.350</p>
            <p className="text-sm text-muted-foreground">+180.1% geçen aydan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Satışlar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">+12.234</p>
            <p className="text-sm text-muted-foreground">+19% geçen aydan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Aktif Kullanıcılar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">+573</p>
            <p className="text-sm text-muted-foreground">+201 geçen aydan</p>
          </CardContent>
        </Card>
      </div>

      {/* Grafik ve Son Aktiviteler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 h-[300px]">
          <CardHeader>
            <CardTitle>Genel Bakış</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Grafik burada yer alacak</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Son Aktiviteler</CardTitle>
            <p className="text-sm text-muted-foreground">
              Son 24 saatte 34 işlem gerçekleşti
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold">Ahmet Yılmaz</p>
              <p className="text-sm text-muted-foreground">ahmet@ornek.com</p>
              <p className="text-right">+₺1.999,00</p>
            </div>
            <div>
              <p className="font-semibold">Ayşe Demir</p>
              <p className="text-sm text-muted-foreground">ayse@ornek.com</p>
              <p className="text-right">+₺39,00</p>
            </div>
            <div>
              <p className="font-semibold">Mehmet Kaya</p>
              <p className="text-sm text-muted-foreground">mehmet@ornek.com</p>
              <p className="text-right">+₺299,00</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
