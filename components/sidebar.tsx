"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // Doğru import yolu olduğundan emin olun

// ÖNEMLİ: Daha iyi bir görünüm ve tutarlılık için emoji ikonlar yerine
// Heroicons (https://heroicons.com/) gibi bir SVG ikon kütüphanesi kullanmanızı öneririm.
// Örnek: import { ChartBarIcon } from '@heroicons/react/24/outline';
// MenuItem'daki icon tipi: React.ReactNode; icon: <ChartBarIcon className="w-5 h-5" />

interface ChildMenuItem {
  label: string;
  href: string;
}

interface MenuItem {
  label: string;
  href?: string;
  icon?: string | React.ReactNode; // Emoji veya SVG string/component'i olabilir
  roles: string[];
  children?: ChildMenuItem[];
  highlight?: boolean;
}

const unifiedMenuItems: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: "📊",
    roles: ["superadmin", "editor", "musteri_temsilcisi"],
  },
  {
    label: "Araçlar",
    href: "/products",
    icon: "🚗",
    roles: ["superadmin", "editor", "musteri_temsilcisi"],
  },
  {
    label: "Kullanıcılar",
    icon: "👤",
    roles: ["superadmin"],
    children: [
      { label: "Tüm Kullanıcılar", href: "/kullanicilar" },
      { label: "Evraklar", href: "/kullanicilar/evraklar" },
      { label: "Teklifler", href: "/kullanicilar/teklifler" },
      { label: "Yorumlar", href: "/kullanicilar/yorumlar" },
    ],
  },
  {
    label: "Çalışanlar",
    href: "/calisanlar",
    icon: "🧑‍💼",
    roles: ["superadmin"],
  },
  {
    label: "Sözleşme İşlemleri",
    icon: "📁",
    roles: ["superadmin", "editor", "musteri_temsilcisi"],
    children: [
      { label: "Sözleşme / Sipariş Oluştur", href: "/sozlesmeler" },
      { label: "Oluşturulmuş Sözleşmeler", href: "/sozlesmeler/list-sozlesmeler" },
      { label: "Oluşturulmuş Sipariş Formları", href: "/sozlesmeler/list-siparisler" },
    ],
  },
  {
    label: "Sayfalar",
    icon: "📄",
    roles: ["superadmin"],
    children: [
      { label: "Tüm Sayfalar", href: "/pages" },
      { label: "Yeni Ekle", href: "/pages/new" },
      { label: "Taslaklar", href: "/pages?status=draft" },
      { label: "Yayında", href: "/pages?status=published" },
      { label: "Menü Yönetimi", href: "/menu" },
    ],
  },
  {
    label: "Bloglar",
    href: "/blogs",
    icon: "✍️",
    roles: ["superadmin", "editor"],
  },
  {
    label: "Çalışan Hareketleri",
    href: "/calisan-aktiviteleri",
    icon: "📝",
    roles: ["superadmin"],
  },
];

const extraMenuItems: MenuItem[] = [
  { label: "Raporlama", href: "/raporlama", icon: "📈", roles: [] },
  { label: "Mesajlar", href: "/mesajlar", icon: "💬", roles: [] },
  { label: "Ayarlar", href: "/ayarlar", icon: "⚙️", roles: [] },
  { label: "Ortam Kütüphanesi", href: "/media", icon: "🖼️", roles: [] },
  { label: "CSV Yükle", href: "/upload", icon: "📤", highlight: true, roles: [] },
];

// Basit bir Chevron (ok) ikonu
const ChevronIcon = ({ isOpen, className = "h-4 w-4" }: { isOpen: boolean; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={`${className} transition-transform duration-200 ease-in-out ${isOpen ? 'rotate-90' : 'rotate-0'}`}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
      clipRule="evenodd"
    />
  </svg>
);

export default function Sidebar() {
  const pathname = usePathname();
  const [rol, setRol] = useState<string | null>(null);
  const [adSoyad, setAdSoyad] = useState<string | null>(null);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const [isSidebarLoading, setIsSidebarLoading] = useState(true);

  useEffect(() => {
    async function fetchUserInfo() {
      setIsSidebarLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("calisanlar")
          .select("rol, ad, soyad")
          .eq("auth_user_id", user.id)
          .single();

        if (!error && data) {
          setRol(data.rol);
          setAdSoyad(`${data.ad} ${data.soyad}`);
        } else {
          console.error("Rol veya ad soyad bulunamadı:", error?.message);
          setRol(null);
          setAdSoyad(null);
        }
      } else {
        setRol(null);
        setAdSoyad(null);
      }
      setIsSidebarLoading(false);
    }
    fetchUserInfo();
  }, []);

  useEffect(() => {
    const newOpenDropdowns: Record<string, boolean> = {};
    [...unifiedMenuItems, ...extraMenuItems].forEach(item => {
      if (item.children) {
        const isChildActive = item.children.some(child => child.href === pathname);
        if (isChildActive) {
          newOpenDropdowns[item.label] = true;
        }
      }
    });
    setOpenDropdowns(prev => ({ ...prev, ...newOpenDropdowns }));
  }, [pathname, rol]);

  const toggleDropdown = (label: string) => {
    setOpenDropdowns(prev => ({ ...prev, [label]: !prev[label] }));
  };

  // Login sayfasında sidebar'ı gösterme (bu kontrol layout.tsx yerine burada kalabilir veya layout'a taşınabilir)
  if (pathname === "/login") {
    return null;
  }

  // Rol yüklenirken veya sidebar bilgileri eksikse yükleniyor göster
  if (isSidebarLoading) {
    // Sabit sidebar için yükleme durumu da sabit olmalı
    return (
      <aside className="fixed top-0 left-0 z-40 h-screen bg-[#6A3C96] w-64 p-4 flex items-center justify-center">
        <span className="text-slate-200">Yükleniyor...</span>
      </aside>
    );
  }

  const renderMenuItems = (items: MenuItem[]) => {
    return items.map((item) => {
      if (rol === null && item.roles.length > 0) return null;
      if (item.roles.length > 0 && !item.roles.includes(rol!)) return null;

      const isParentActive = item.children?.some(child => pathname === child.href);
      const currentItemIsActive = item.href && pathname === item.href;

      if (item.children) {
        const isOpen = !!openDropdowns[item.label];
        return (
          <div key={item.label}>
            <button
              onClick={() => toggleDropdown(item.label)}
              className={`group relative flex items-center w-full text-left pl-3 pr-2 py-2.5 rounded-lg transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50
                ${isParentActive && !isOpen ? 'bg-[#552E7A] text-slate-50' : 'hover:bg-[#5b3482] text-slate-200 hover:text-slate-50'}
              `}
            >
              {isParentActive && (
                 <span className="absolute left-0 top-1/2 transform -translate-y-1/2 h-5 w-[3px] bg-purple-300 rounded-r-full"></span>
              )}
              {item.icon && (
                <span className="w-6 h-6 mr-3 flex items-center justify-center text-purple-200 group-hover:text-slate-50 transition-colors">
                  {typeof item.icon === 'string' ? <span className="text-lg">{item.icon}</span> : item.icon}
                </span>
              )}
              <span className="flex-1 font-medium text-sm">{item.label}</span>
              <ChevronIcon isOpen={isOpen} className="h-5 w-5 text-purple-200 group-hover:text-slate-50 transition-colors" />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="mt-1 pl-9 space-y-1 py-1">
                {item.children.map((child) => {
                  const isChildActive = pathname === child.href;
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`group relative block pl-3 pr-2 py-2 rounded-md text-sm transition-colors duration-150 ease-in-out
                        ${isChildActive ? 'bg-[#4A2A6D] text-slate-50 font-semibold' : 'text-slate-300 hover:text-slate-50 hover:bg-[#5b3482]'}
                      `}
                    >
                      {isChildActive && (
                        <span className="absolute left-0 top-1/2 transform -translate-y-1/2 h-4 w-[3px] bg-purple-300 rounded-r-full"></span>
                      )}
                       {child.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      return (
        <Link
          key={item.href || item.label}
          href={item.href!}
          className={`group relative flex items-center pl-3 pr-4 py-2.5 rounded-lg transition-colors duration-150 ease-in-out text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50
            ${currentItemIsActive ? 'bg-[#4A2A6D] text-slate-50 font-semibold' : 'hover:bg-[#5b3482] text-slate-200 hover:text-slate-50'}
            ${item.highlight ? "bg-sky-500 !text-white hover:bg-sky-600 font-semibold" : ""}
          `}
        >
          {currentItemIsActive && !item.highlight && (
            <span className="absolute left-0 top-1/2 transform -translate-y-1/2 h-5 w-[3px] bg-purple-300 rounded-r-full"></span>
          )}
          {item.icon && (
            <span className="w-6 h-6 mr-3 flex items-center justify-center text-purple-200 group-hover:text-slate-50 transition-colors">
               {typeof item.icon === 'string' ? <span className="text-lg">{item.icon}</span> : item.icon}
            </span>
          )}
          <span className="font-medium">{item.label}</span>
        </Link>
      );
    });
  };

  return (
    // === DEĞİŞİKLİK BURADA ===
    <aside className="fixed top-0 left-0 z-40 h-screen bg-[#6A3C96] w-64 text-slate-100 flex flex-col justify-between shadow-xl">
    {/* Önceki className: "h-screen bg-[#6A3C96] w-64 text-slate-100 flex flex-col justify-between shadow-xl" */}
    {/* Eklenenler: fixed top-0 left-0 z-40 */}
    
      {/* Scrollable Alan Başlangıcı */}
      <div className="flex flex-col flex-grow overflow-y-auto sidebar-scrollable pr-0.5">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6">
            <Image
              src="https://uxnpmdeizkzvnevpceiw.supabase.co/storage/v1/object/public/images/1746433174940-Untitled%20design%20(8).png"
              alt="LenaCars Logo"
              width={40}
              height={40}
              className="rounded-md"
            />
            <span className="bg-slate-100 text-[#6A3C96] text-xs px-2.5 py-1 rounded-md font-bold tracking-wider shadow">ADMIN</span>
          </div>

          {adSoyad && rol && (
            <div className="bg-[#5b3482]/70 rounded-lg p-3.5 mb-6 shadow-md">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 text-[#6A3C96] rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg uppercase">
                  {adSoyad.split(" ").map(n => n[0]).join("").substring(0, 2)}
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-50">{adSoyad}</div>
                  <div className="text-xs text-purple-200 capitalize italic">{rol.replace("_", " ")}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <nav className="space-y-1.5 px-4 flex-grow">
          {renderMenuItems(unifiedMenuItems)}
          
          {extraMenuItems.length > 0 && (
            <div className="mt-6 pt-6 border-t border-purple-500/40">
              <p className="px-0 text-xs font-semibold text-purple-200 uppercase tracking-wider mb-2">Ekstra</p>
              {renderMenuItems(extraMenuItems)}
            </div>
          )}
        </nav>
      </div>
      {/* Scrollable Alan Sonu */}

      <div className="p-4 mt-auto border-t border-purple-500/40">
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/login";
          }}
          className="w-full flex items-center justify-center gap-2 bg-red-600/90 text-slate-50 px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors duration-150 ease-in-out font-medium text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 shadow-md hover:shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
          </svg>
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}

/*
  globals.css veya ana stil dosyanıza ekleyin (eğer daha önce eklemediyseniz):

  // Webkit tabanlı tarayıcılar için (Chrome, Safari, Edge)
  .sidebar-scrollable::-webkit-scrollbar {
    width: 6px;
  }
  .sidebar-scrollable::-webkit-scrollbar-track {
    background: transparent; // Veya sidebar arka planının biraz daha koyu bir tonu: #5b3482
  }
  .sidebar-scrollable::-webkit-scrollbar-thumb {
    background: #4A2A6D; // Scrollbar tutamacı rengi
    border-radius: 3px;
  }
  .sidebar-scrollable::-webkit-scrollbar-thumb:hover {
    background: #3E235A; // Hover durumunda tutamaç rengi
  }

  // Firefox için
  .sidebar-scrollable {
    scrollbar-width: thin;
    scrollbar-color: #4A2A6D transparent; // thumb track
  }
*/
