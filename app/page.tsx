"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Kullanici {
  id: string;
  ad: string;
  soyad: string;
  email: string;
  created_at: string;
}

interface Yorum {
  id: string;
  yorum: string;
  created_at: string;
  kullanici: { ad: string; soyad: string };
  arac: { isim: string };
}

interface Arac {
  id: string;
  isim: string;
  visit_count: number;
}

interface Blog {
  id: string;
  title: string;
  view_count: number;
}

export default function DashboardPage() {
  const [kullanicilar, setKullanicilar] = useState<Kullanici[]>([]);
  const [yorumlar, setYorumlar] = useState<Yorum[]>([]);
  const [araclar, setAraclar] = useState<Arac[]>([]);
  const [bloglar, setBloglar] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Son Kullanıcılar
      const { data: users } = await supabase
        .from("kullanicilar")
        .select("id, ad, soyad, email, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      setKullanicilar(users || []);

      // 2. Son Yorumlar
      const { data: comments } = await supabase
        .from("yorumlar")
        .select("id, yorum, created_at, kullanici:kullanicilar(ad,soyad), arac:araclar(isim)")
        .order("created_at", { ascending: false })
        .limit(5);
      setYorumlar(comments || []);

      // 3. En Çok Ziyaret Edilen Araçlar
      const { data: topVehicles } = await supabase
        .from("araclar")
        .select("id, isim, visit_count")
        .order("visit_count", { ascending: false })
        .limit(5);
      setAraclar(topVehicles || []);

      // 4. En Çok Görüntülenen Bloglar
      const { data: topBlogs } = await supabase
        .from("bloglar")
        .select("id, title, view_count")
        .order("view_count", { ascending: false })
        .limit(5);
      setBloglar(topBlogs || []);
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Son Kullanıcılar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {kullanicilar.map((k) => (
              <div key={k.id} className="border-b pb-2">
                <p className="font-semibold">{k.ad} {k.soyad}</p>
                <p className="text-xs text-muted-foreground">{k.email}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son Yorumlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {yorumlar.map((y) => (
              <div key={y.id} className="border-b pb-2">
                <p className="text-muted-foreground text-xs">{new Date(y.created_at).toLocaleString("tr-TR")}</p>
                <p><span className="font-semibold">{y.kullanici.ad} {y.kullanici.soyad}</span> → <i>{y.arac.isim}</i></p>
                <p className="text-sm">"{y.yorum}"</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>En Çok Ziyaret Edilen Araçlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {araclar.map((a) => (
              <div key={a.id} className="flex justify-between border-b pb-1">
                <span>{a.isim}</span>
                <span className="text-muted-foreground">{a.visit_count} ziyaret</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>En Çok Görüntülenen Bloglar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {bloglar.map((b) => (
              <div key={b.id} className="flex justify-between border-b pb-1">
                <span>{b.title}</span>
                <span className="text-muted-foreground">{b.view_count} görüntüleme</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
