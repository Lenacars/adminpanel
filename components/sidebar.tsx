"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// ** Menü öğeleri için tipleri tanımlayalım (Implicit 'any' hatasını düzeltmek için) **
interface MenuItem {
  label: string;
  href?: string; // Eğer alt öğeleri varsa href opsiyonel olabilir
  icon?: string;
  roles: string[];
  children?: ChildMenuItem[]; // Eğer alt öğeleri varsa
  highlight?: boolean; // extraMenuItems için eklenen özellik
}

interface ChildMenuItem {
  label: string;
  href: string;
}

// ** Dizi tanımlarını buraya, fonksiyonun dışına ekleyin **
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
    roles: ["superadmin", "editor"],
  },
  {
    label: "Kullanıcılar",
    icon: "👤",
    roles: ["superadmin"],
    children: [
      { label: "Tüm Kullanıcılar", href: "/kullanicilar" },
      { label: "Evraklar", href: "/kullanicilar/evraklar" },
      { label: "Teklifler", href: "/kullanicilar/teklifler" },
    ],
  },
  {
    label: "Çalışanlar",
    href: "/calisanlar",
    icon: "🧑‍💼",
    roles: ["superadmin"],
  },
  {
    label: "Siparişler",
    href: "/siparisler",
    icon: "🛒",
    roles: ["superadmin", "editor"],
  },
];

const pageMenu: ChildMenuItem[] = [ // Sadece label ve href olduğu için ChildMenuItem tipini kullandık
  { label: "Tüm Sayfalar", href: "/pages" },
  { label: "Yeni Ekle", href: "/pages/new" },
  { label: "Taslaklar", href: "/pages?status=draft" },
  { label: "Yayında", href: "/pages?status=published" },
  { label: "Menü Yönetimi", href: "/menu" },
];

const extraMenuItems: MenuItem[] = [ // highlight özelliği olduğu için MenuItem tipini kullandık
  { label: "Analitik", href: "/analitik", icon: "📈", roles: [] }, // roles boş veya ihtiyaca göre ayarlanabilir
  { label: "Mesajlar", href: "/mesajlar", icon: "💬", roles: [] },
  { label: "Ayarlar", href: "/ayarlar", icon: "⚙️", roles: [] },
  { label: "Ortam Kütüphanesi", href: "/media", icon: "🖼️", roles: [] },
  { label: "CSV Yükle", href: "/upload", icon: "📄", highlight: true, roles: [] },
];

export default function Sidebar() {
  const pathname = usePathname();

  // **** Hook'ları koşullu dönüşten önce, en üst seviyede çağırın ****
  const [rol, setRol] = useState<string | null>(null);
  const [openPages, setOpenPages] = useState(true);
  const [openUsers, setOpenUsers] = useState(true);

  // ROL çekme işlemi - Şimdi her zaman çağrılıyor
  useEffect(() => {
    async function fetchRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("calisanlar")
          .select("rol")
          .eq("auth_user_id", user.id)
          .single();

        if (!error && data) {
          setRol(data.rol);
        } else {
           // Hata durumunda veya rol bulunamazsa rolü null yap
           console.error("Rol bulunamadı veya çekilemedi", error);
           setRol(null);
        }
      } else {
         // Kullanıcı yoksa rolü null yap
         setRol(null);
      }
    }

    fetchRole();
  }, []); // Dependency array boş bırakıldı, component mount olduğunda bir kere çalışır.
          // Eğer kullanıcının auth durumu değiştiğinde tekrar çalışmasını isterseniz,
          // supabase.auth.onAuthStateChange'i kullanmanız veya user'ı dependency'ye eklemeniz gerekebilir.


  // **** Koşullu render mantığı şimdi Hook çağrılarından sonra ****
  if (pathname === "/login") {
    return null;
  }

  // Rol bilgisi yüklenene kadar bir loading durumu gösterebilirsiniz (isteğe bağlı)
  // if (rol === null) {
  //   return <div>Sidebar Yükleniyor...</div>;
  // }


  return (
    <aside className="h-screen bg-[#6A3C96] w-64 p-4 text-sm text-white">
      <div className="flex items-center mb-6 gap-2">
        <Image
          src="https://uxnpmdeizkzvnevpceiw.supabase.co/storage/v1/object/public/images/1746433174940-Untitled%20design%20(8).png"
          alt="LenaCars Logo"
          width={54}
          height={54}
        />
        <span className="bg-white text-[#6A3C96] text-xs px-2 py-1 rounded font-semibold">Admin</span>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
           // Rol bilgisi gelene kadar menü öğelerini gösterme
           if (rol === null) return null;
           // Eğer item'ın roles'i arasında kullanıcının rolü yoksa gösterme
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
              key={item.href} // Eğer href yoksa burada sorun yaşanabilir, tip tanımı href'i opsiyonel yaptı
              href={item.href!} // href'in burada kesinlikle olacağını belirtmek için ! kullanıldı veya koşul eklenebilir
              className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-[#5b3482] transition"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        {/* Sayfalar menüsü sadece superadmin görsün */}
        {rol === "superadmin" && ( // Rol bilgisi yüklendikten sonra kontrol edilecek
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
                {pageMenu.map((item) => ( // Burada item aslında ChildMenuItem tipinde
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

        {extraMenuItems.map((item) => ( // Burada item MenuItem tipinde
          <Link
            key={item.href}
            href={item.href!} // href'in burada kesinlikle olacağını belirtmek için ! kullanıldı veya koşul eklenebilir
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

        {/* Çıkış butonu */}
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            // Next.js App Router'da yönlendirme için useRouter kullanmak daha iyidir
            // import { useRouter } from 'next/navigation';
            // const router = useRouter();
            // router.push('/login');
             window.location.href = "/login"; // Bu da çalışır ama client-side navigasyon için useRouter tercih edilir.
          }}
          className="w-full mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
        >
          Çıkış Yap
        </button>
      </nav>
    </aside>
  );
}