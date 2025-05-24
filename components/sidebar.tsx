"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface MenuItem {
  label: string;
  href?: string;
  icon?: string;
  roles: string[];
  children?: ChildMenuItem[];
  highlight?: boolean;
}

interface ChildMenuItem {
  label: string;
  href: string;
}

const menuItems: MenuItem[] = [
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
      { label: "Yorumlar", href: "/kullanicilar/yorumlar" }, // ✅ YENİ EKLENDİ
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
    label: "Çalışan Hareketleri",
    href: "/calisan-aktiviteleri",
    icon: "📝",
    roles: ["superadmin"],
  },
   {
    label: "Bloglar", // ✅ YENİ
    href: "/blogs",
    icon: "✍️",
    roles: ["superadmin", "editor"], // 👈 Sadece bu roller görecek
  },
];

const pageMenu: ChildMenuItem[] = [
  { label: "Tüm Sayfalar", href: "/pages" },
  { label: "Yeni Ekle", href: "/pages/new" },
  { label: "Taslaklar", href: "/pages?status=draft" },
  { label: "Yayında", href: "/pages?status=published" },
  { label: "Menü Yönetimi", href: "/menu" },
];

const extraMenuItems: MenuItem[] = [
  { label: "Analitik", href: "/analitik", icon: "📈", roles: [] },
  { label: "Mesajlar", href: "/mesajlar", icon: "💬", roles: [] },
  { label: "Ayarlar", href: "/ayarlar", icon: "⚙️", roles: [] },
  { label: "Ortam Kütüphanesi", href: "/media", icon: "🖼️", roles: [] },
  { label: "CSV Yükle", href: "/upload", icon: "📄", highlight: true, roles: [] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [rol, setRol] = useState<string | null>(null);
  const [adSoyad, setAdSoyad] = useState<string | null>(null);
  const [openPages, setOpenPages] = useState(true);
  const [openUsers, setOpenUsers] = useState(true);

  useEffect(() => {
    async function fetchUserInfo() {
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
          console.error("Rol veya ad soyad bulunamadı:", error);
          setRol(null);
          setAdSoyad(null);
        }
      } else {
        setRol(null);
        setAdSoyad(null);
      }
    }

    fetchUserInfo();
  }, []);

  if (pathname === "/login") {
    return null;
  }

  return (
    <aside className="h-screen bg-[#6A3C96] w-64 p-4 text-sm text-white flex flex-col justify-between">
      <div>
        <div className="flex flex-col mb-6 gap-2">
          <div className="flex items-center gap-2">
            <Image
              src="https://uxnpmdeizkzvnevpceiw.supabase.co/storage/v1/object/public/images/1746433174940-Untitled%20design%20(8).png"
              alt="LenaCars Logo"
              width={54}
              height={54}
            />
            <span className="bg-white text-[#6A3C96] text-xs px-2 py-1 rounded font-semibold">Admin</span>
          </div>

          {adSoyad && rol && (
            <div className="bg-[#5b3482] rounded-md p-3 mt-2">
              <div className="flex items-center gap-2">
                <div className="bg-white text-[#6A3C96] rounded-full w-8 h-8 flex items-center justify-center font-bold uppercase">
                  {adSoyad[0]}
                </div>
                <div>
                  <div className="font-semibold text-sm">{adSoyad}</div>
                  <div className="text-xs italic text-gray-200">({rol})</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            if (rol === null) return null;
            if (!item.roles.includes(rol)) return null;

            if (item.children) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => setOpenUsers(!openUsers)}
                    className="flex items-center gap-2 px-4 py-2 w-full rounded-md hover:bg-[#5b3482] transition"
                  >
                    <span>{item.icon}</span>
                    <span className="flex-1 text-left">{item.label}</span>
                    <span>{openUsers ? "▲" : "▼"}</span>
                  </button>
                  {openUsers && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-3 py-1 rounded hover:bg-[#5b3482]"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href!}
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-[#5b3482] transition"
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}

          {rol === "superadmin" && (
            <div>
              <button
                onClick={() => setOpenPages(!openPages)}
                className="flex items-center gap-2 px-4 py-2 w-full rounded-md hover:bg-[#5b3482] transition"
              >
                <span>📄</span>
                <span className="flex-1 text-left">Sayfalar</span>
                <span>{openPages ? "▲" : "▼"}</span>
              </button>
              {openPages && (
                <div className="ml-4 mt-1 space-y-1">
                  {pageMenu.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-3 py-1 rounded hover:bg-[#5b3482]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {extraMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
                item.highlight
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  : "hover:bg-[#5b3482]"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <button
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/login";
        }}
        className="w-full mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
      >
        Çıkış Yap
      </button>
    </aside>
  );
}
