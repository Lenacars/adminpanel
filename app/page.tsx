"use client";

import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// shadcn/ui Bileşenleri
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator"; // Ayırıcı için

// lucide-react İkonları
import { 
  LayoutDashboard, Users, MessageSquare, Car, Newspaper, // Kart başlıkları için
  ArrowRight, Loader2, AlertTriangle, Inbox, Star // Diğerleri
} from "lucide-react";
import { toast } from "@/hooks/use-toast"; // Toast eklendi

// Tipler (Mevcut olanlar)
interface Kullanici {
  id: string;
  ad: string;
  soyad: string;
  email: string;
  created_at: string;
  auth_user_id: string; // Bu önemli, yorumlardaki user_id ile eşleşiyor
}

interface Yorum {
  id: string;
  yorum: string;
  created_at: string;
  user_id: string; // Bu auth_user_id ile eşleşecek
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

// Yorumları zenginleştirmek için yeni tip
interface EnrichedYorum extends Yorum {
  userName: string;
  userAvatarFallback: string;
  vehicleName: string;
}

// Yıldız Puanlama Bileşeni (Yorumlar için)
const StarRatingDisplay = ({ rating, totalStars = 5 }: { rating: number; totalStars?: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(totalStars)].map((_, index) => (
        <Star
          key={index}
          className={`w-3.5 h-3.5 ${index < Math.round(rating) ? 'fill-yellow-400 text-yellow-500' : 'fill-gray-200 text-gray-400 dark:fill-slate-600 dark:text-slate-500'}`}
        />
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [kullanicilar, setKullanicilar] = useState<Kullanici[]>([]);
  const [yorumlar, setYorumlar] = useState<Yorum[]>([]);
  const [araclar, setAraclar] = useState<Arac[]>([]);
  const [bloglar, setBloglar] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const corporateColor = "#6A3C96";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [userData, commentData, vehicleData, blogData] = await Promise.all([
          supabase.from("kullanicilar").select("id, ad, soyad, email, created_at, auth_user_id").order("created_at", { ascending: false }).limit(5),
          supabase.from("yorumlar").select("*").order("created_at", { ascending: false }).limit(5),
          supabase.from("Araclar").select("id, isim, visit_count").order("visit_count", { ascending: false }).limit(5),
          supabase.from("bloglar").select("id, title, view_count").order("view_count", { ascending: false }).limit(5)
        ]);

        if (userData.error) throw new Error(`Kullanıcılar: ${userData.error.message}`);
        if (commentData.error) throw new Error(`Yorumlar: ${commentData.error.message}`);
        if (vehicleData.error) throw new Error(`Araçlar: ${vehicleData.error.message}`);
        if (blogData.error) throw new Error(`Bloglar: ${blogData.error.message}`);

        setKullanicilar(userData.data || []);
        setYorumlar(commentData.data || []);
        setAraclar(vehicleData.data || []);
        setBloglar(blogData.data || []);

      } catch (err: any) {
        console.error("Dashboard verisi alınamadı:", err);
        setError(err.message || "Veriler yüklenirken bir sorun oluştu.");
        toast({title: "Veri Yükleme Hatası", description: err.message, variant: "destructive"});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const enrichedYorumlar: EnrichedYorum[] = useMemo(() => {
    return yorumlar.map((y) => {
      const user = kullanicilar.find((k) => k.auth_user_id === y.user_id);
      const arac = araclar.find((a) => String(a.id) === String(y.arac_id)); // Araçlar listesinden bul
      return {
        ...y,
        userName: user ? `${user.ad} ${user.soyad}` : "Bilinmeyen Kullanıcı",
        userAvatarFallback: user ? `${(user.ad || '?').charAt(0)}${(user.soyad || '?').charAt(0)}` : '??',
        vehicleName: arac ? arac.isim : "Bilinmeyen Araç",
      };
    });
  }, [yorumlar, kullanicilar, araclar]); // araclar'ı dependency'e ekledim

  const renderSectionSkeleton = (title: string) => (
    <Card className="shadow-sm dark:bg-slate-850 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-700 dark:text-slate-200">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
        <div className="p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900 min-h-screen">
            <div className="flex items-center mb-6 pb-4 border-b dark:border-slate-700">
                <Loader2 className="w-8 h-8 mr-3 animate-spin" style={{color: corporateColor}}/>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Ana Sayfa Yükleniyor...</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {renderSectionSkeleton("Son Kullanıcılar")}
                {renderSectionSkeleton("Son Yorumlar")}
                {renderSectionSkeleton("Popüler Araçlar")}
                {renderSectionSkeleton("Popüler Bloglar")}
            </div>
        </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] p-8 text-center bg-gray-50 dark:bg-slate-900">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-600 mb-2">Hata Oluştu</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">Sayfayı Yenile</Button>
      </div>
    );
  }
  
  const renderCardContentList = (items: any[], renderItem: (item: any, index: number) => JSX.Element, emptyMessage: string, icon: JSX.Element) => {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-40 text-center text-gray-500 dark:text-slate-400">
          {React.cloneElement(icon, { className: "w-10 h-10 mb-2 opacity-50" })}
          <p className="text-sm">{emptyMessage}</p>
        </div>
      );
    }
    return (
      <ScrollArea className="h-[220px] pr-3"> {/* Yükseklik ayarlandı */}
        <div className="space-y-3">
          {items.map(renderItem)}
        </div>
      </ScrollArea>
    );
  };


  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900 min-h-screen">
        <div className="flex items-center justify-between mb-6 pb-4 border-b dark:border-slate-700">
            <h1 className="text-3xl font-bold flex items-center text-gray-800 dark:text-slate-100">
            <LayoutDashboard className="w-8 h-8 mr-3" style={{ color: corporateColor }} />
            Ana Sayfa
            </h1>
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* SON KULLANICILAR */}
            <Card className="shadow-sm hover:shadow-md transition-shadow dark:bg-slate-850 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold flex items-center dark:text-slate-100" style={{ color: corporateColor }}>
                    <Users className="w-5 h-5 mr-2"/>Son Kullanıcılar
                </CardTitle>
                <Button asChild variant="ghost" size="sm" className="text-xs h-7 px-2 dark:text-slate-300 dark:hover:bg-slate-700" style={{ color: corporateColor }}>
                    <Link href="/kullanicilar">Tümü <ArrowRight className="w-3 h-3 ml-1"/></Link>
                </Button>
            </CardHeader>
            <CardContent className="pt-1">
                {renderCardContentList(
                    kullanicilar,
                    (user: Kullanici) => (
                        <div key={user.id} className="flex items-center gap-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 px-1 rounded-md">
                            <Avatar className="h-8 w-8 border text-xs dark:border-slate-600">
                                <AvatarFallback style={{backgroundColor: corporateColor, color: 'white'}}>
                                    {user.ad?.charAt(0)}{user.soyad?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate" title={`${user.ad} ${user.soyad}`}>{user.ad} {user.soyad}</p>
                                <p className="text-xs text-muted-foreground dark:text-slate-400 truncate" title={user.email}>{user.email}</p>
                            </div>
                        </div>
                    ),
                    "Henüz kayıtlı kullanıcı yok.",
                    <Users />
                )}
            </CardContent>
            </Card>

            {/* SON YORUMLAR */}
            <Card className="shadow-sm hover:shadow-md transition-shadow dark:bg-slate-850 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold flex items-center dark:text-slate-100" style={{ color: corporateColor }}>
                    <MessageSquare className="w-5 h-5 mr-2"/>Son Yorumlar
                </CardTitle>
                <Button asChild variant="ghost" size="sm" className="text-xs h-7 px-2 dark:text-slate-300 dark:hover:bg-slate-700" style={{ color: corporateColor }}>
                    <Link href="/kullanicilar/yorumlar">Tümü <ArrowRight className="w-3 h-3 ml-1"/></Link>
                </Button>
            </CardHeader>
            <CardContent className="pt-1">
                {renderCardContentList(
                    enrichedYorumlar,
                    (y: EnrichedYorum) => (
                        <div key={y.id} className="py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 px-1 rounded-md">
                            <div className="flex items-center justify-between mb-0.5">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-7 w-7 border text-xs dark:border-slate-600">
                                        <AvatarFallback style={{backgroundColor: corporateColor, color: 'white', fontSize: '0.6rem'}}>
                                            {y.userAvatarFallback}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate" title={y.userName}>{y.userName}</span>
                                </div>
                                <StarRatingDisplay rating={y.puan} />
                            </div>
                            <p className="text-xs text-muted-foreground dark:text-slate-400 mb-1 truncate" title={y.vehicleName}>Araç: {y.vehicleName}</p>
                            <p className="text-xs text-gray-700 dark:text-slate-300 line-clamp-2 leading-snug" title={y.yorum}>"{y.yorum}"</p>
                        </div>
                    ),
                    "Henüz yorum yapılmamış.",
                    <MessageSquare />
                )}
            </CardContent>
            </Card>

            {/* EN ÇOK ZİYARET EDİLEN ARAÇLAR */}
            <Card className="shadow-sm hover:shadow-md transition-shadow dark:bg-slate-850 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold flex items-center dark:text-slate-100" style={{ color: corporateColor }}>
                    <Car className="w-5 h-5 mr-2"/>Popüler Araçlar
                </CardTitle>
                 <Button asChild variant="ghost" size="sm" className="text-xs h-7 px-2 dark:text-slate-300 dark:hover:bg-slate-700" style={{ color: corporateColor }}>
                    <Link href="/products">Tümü <ArrowRight className="w-3 h-3 ml-1"/></Link>
                </Button>
            </CardHeader>
            <CardContent className="pt-1">
                {renderCardContentList(
                    araclar, // Zaten sıralı geliyor
                    (a: Arac) => (
                        <div key={a.id} className="flex items-center justify-between py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 px-1 rounded-md">
                            <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate" title={a.isim}>{a.isim}</p>
                            <p className="text-xs text-muted-foreground dark:text-slate-400 whitespace-nowrap">{a.visit_count} Görüntülenme</p>
                        </div>
                    ),
                    "Araç verisi bulunamadı.",
                    <Car />
                )}
            </CardContent>
            </Card>

            {/* EN ÇOK GÖRÜNTÜLENEN BLOGLAR */}
            <Card className="shadow-sm hover:shadow-md transition-shadow dark:bg-slate-850 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold flex items-center dark:text-slate-100" style={{ color: corporateColor }}>
                    <Newspaper className="w-5 h-5 mr-2"/>Popüler Bloglar
                </CardTitle>
                <Button asChild variant="ghost" size="sm" className="text-xs h-7 px-2 dark:text-slate-300 dark:hover:bg-slate-700" style={{ color: corporateColor }}>
                    <Link href="/blogs">Tümü <ArrowRight className="w-3 h-3 ml-1"/></Link>
                </Button>
            </CardHeader>
            <CardContent className="pt-1">
                {renderCardContentList(
                    bloglar, // Zaten sıralı geliyor
                    (b: Blog) => (
                        <div key={b.id} className="flex items-center justify-between py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 px-1 rounded-md">
                            <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate" title={b.title}>{b.title}</p>
                            <p className="text-xs text-muted-foreground dark:text-slate-400 whitespace-nowrap">{b.view_count} Görüntülenme</p>
                        </div>
                    ),
                    "Blog verisi bulunamadı.",
                    <Newspaper />
                )}
            </CardContent>
            </Card>
        </div>
    </div>
  );
}
