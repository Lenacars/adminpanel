"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Kullanici {
  id: string;
  ad: string;
  soyad: string;
  email: string;
  created_at: string;
  auth_user_id: string;
}

interface Yorum {
  id: string;
  yorum: string;
  created_at: string;
  user_id: string;
  arac_id: string;
  puan: number;
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
      const { data: userData } = await supabase
        .from("kullanicilar")
        .select("id, ad, soyad, email, created_at, auth_user_id");

      const { data: commentData } = await supabase
        .from("yorumlar")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      const { data: vehicleData } = await supabase
        .from("araclar")
        .select("id, isim, visit_count");

      const { data: blogData } = await supabase
        .from("bloglar")
        .select("id, title, view_count")
        .order("view_count", { ascending: false })
        .limit(5);

      setKullanicilar(userData || []);
      setYorumlar(commentData || []);
      setAraclar(vehicleData || []);
      setBloglar(blogData || []);
    };

    fetchData();
  }, []);

  const enrichYorumlar = yorumlar.map((y) => {
    const user = kullanicilar.find((k) => k.auth_user_id === y.user_id);
    const arac = araclar.find((a) => a.id === y.arac_id);
    return {
      ...y,
      userName: user ? `${user.ad} ${user.soyad}` : "Bilinmeyen Kullanıcı",
      vehicleName: arac ? arac.isim : "Bilinmeyen Araç",
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
      {/* SON KULLANICILAR */}
      <Card>
        <CardHeader>
          <CardTitle>Son Kullanıcılar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {kullanicilar
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
            .map((user) => (
              <div key={user.id}>
                <p className="font-semibold">{user.ad} {user.soyad}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
          ))}
        </CardContent>
      </Card>

      {/* SON YORUMLAR */}
      <Card>
        <CardHeader>
          <CardTitle>Son Yorumlar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {enrichYorumlar.map((y) => (
            <div key={y.id}>
              <p className="font-semibold">{y.userName}</p>
              <p className="text-sm text-muted-foreground">{y.vehicleName}</p>
              <p className="text-sm mt-1">"{y.yorum}"</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* EN ÇOK ZİYARET EDİLEN ARAÇLAR */}
      <Card>
        <CardHeader>
          <CardTitle>En Çok Ziyaret Edilen Araçlar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {araclar
            .sort((a, b) => b.visit_count - a.visit_count)
            .slice(0, 5)
            .map((a) => (
              <div key={a.id}>
                <p className="font-semibold">{a.isim}</p>
                <p className="text-sm text-muted-foreground">{a.visit_count} görüntülenme</p>
              </div>
          ))}
        </CardContent>
      </Card>

      {/* EN ÇOK GÖRÜNTÜLENEN BLOGLAR */}
      <Card>
        <CardHeader>
          <CardTitle>En Çok Görüntülenen Bloglar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {bloglar.map((b) => (
            <div key={b.id}>
              <p className="font-semibold">{b.title}</p>
              <p className="text-sm text-muted-foreground">{b.view_count} görüntülenme</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
