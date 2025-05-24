"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useState, Fragment } from "react"; // Fragment eklendi
import { supabase } from "@/lib/supabase"; // Doğru import yolu olduğundan emin olun
// import { Transition } from '@headlessui/react'; // Daha yumuşak geçişler için eklenebilir

interface ChildMenuItem {
  label: string;
  href: string;
  // İsteğe bağlı: Alt öğeler için de rol bazlı gösterim gerekirse eklenebilir
  // roles?: string[]; 
}

interface MenuItem {
  label: string;
  href?: string;
  icon?: string; // Emoji veya SVG string'i olabilir
  roles: string[]; // Bu öğeyi hangi roller görebilir
  children?: ChildMenuItem[];
  highlight?: boolean; // Özel vurgu için
}

// YENİ: Birleştirilmiş Menü Yapısı
const unifiedMenuItems: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: "📊", // Örnek emoji ikon
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
    label: "Sayfalar", // Eski pageMenu buraya entegre edildi
    icon: "📄",
    roles: ["superadmin"], // Sadece superadmin görebilir
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
  // extraMenuItems buraya eklenebilir veya ayrı bir grup olarak render edilebilir.
  // Şimdilik ayrı tutuyorum, ama istenirse birleştirilebilir.
];

const extraMenuItems: MenuItem[] = [
  { label: "Analitik", href: "/analitik", icon: "📈", roles: [] }, // roles: [] herkes görebilir demekse boş bırakılabilir veya özel bir kontrol eklenebilir
  { label: "Mesajlar", href: "/mesajlar", icon: "💬", roles: [] },
  { label: "Ayarlar", href: "/ayarlar", icon: "⚙️", roles: [] },
  { label: "Ortam Kütüphanesi", href: "/media", icon: "🖼️", roles: [] },
  { label: "CSV Yükle", href: "/upload", icon: "📤", highlight: true, roles: [] }, // İkon güncellendi
];


export default function Sidebar() {
  const pathname = usePathname();
  const [rol, setRol] = useState<string | null>(null);
  const [adSoyad, setAdSoyad] = useState<string | null>(null);
  
  // Her bir açılır menünün durumunu label'ına göre tutar
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

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
          console.error("Rol veya ad soyad bulunamadı:", error?.message);
          setRol(null); // Rol bulunamazsa null ata
          setAdSoyad(null);
        }
      } else {
        setRol(null);
        setAdSoyad(null);
      }
    }
    fetchUserInfo();
  }, []);

  // Aktif yola göre ilgili dropdown'ları varsayılan olarak açık başlat
  useEffect(() => {
    const newOpenDropdowns: Record<string, boolean> = {};
    [...unifiedMenuItems].forEach(item => { // extraMenuItems de dahil edilebilir istenirse
      if (item.children) {
        const isChildActive = item.children.some(child => child.href === pathname);
        if (isChildActive) {
          newOpenDropdowns[item.label] = true;
        }
      }
    });
    setOpenDropdowns(prev => ({...prev, ...newOpenDropdowns})); // Mevcut açık olanları koru, yenilerini ekle
  }, [pathname, rol]); // Rol değiştiğinde de menü yeniden değerlendirilebilir

  const toggleDropdown = (label: string) => {
    setOpenDropdowns(prev => ({ ...prev, [label]: !prev[label] }));
  };

  if (pathname === "/login") {
    return null;
  }
  
  // Rol yüklenene kadar veya rol yoksa sidebar'ı gösterme (isteğe bağlı)
  // if (rol === null && !adSoyad) { // Veya sadece rol === null
  //   return <aside className="h-screen bg-[#6A3C96] w-64 p-4 flex items-center justify-center"><span className="text-white">Yükleniyor...</span></aside>; 
  // }


  const renderMenuItems = (items: MenuItem[]) => {
    return items.map((item) => {
      if (rol === null && item.roles.length > 0) return null; // Rol yüklenmediyse ve role özel ise gösterme
      if (item.roles.length > 0 && !item.roles.includes(rol!)) return null; // Rol uyuşmuyorsa gösterme (rol null değilse)

      const isParentActive = item.children?.some(child => pathname === child.href);
      const currentItemIsActive = item.href && pathname === item.href;

      if (item.children) {
        const isOpen = !!openDropdowns[item.label];
        return (
          <div key={item.label}>
            <button
              onClick={() => toggleDropdown(item.label)}
              className={`flex items-center w-full text-left px-3 py-2.5 rounded-lg transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50
                ${isParentActive && !isOpen ? 'bg-[#552E7A] text-white' : 'hover:bg-[#5b3482] text-gray-100 hover:text-white'}
              `}
            >
              {item.icon && <span className="w-7 text-center text-lg mr-2">{item.icon}</span>}
              <span className="flex-1 font-medium text-sm">{item.label}</span>
              <ChevronIcon isOpen={isOpen} />
            </button>
            {/* Headless UI Transition ile daha yumuşak açılıp kapanma eklenebilir */}
            {isOpen && (
              <div className="mt-1 pl-7 space-y-0.5"> {/* Çocuklar için girinti artırıldı */}
                {item.children.map((child) => {
                  const isChildActive = pathname === child.href;
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block px-3 py-2 rounded-md text-sm transition-colors duration-150 ease-in-out
                        ${isChildActive ? 'bg-[#4A2A6D] text-white font-semibold shadow-inner' : 'text-gray-200 hover:text-white hover:bg-[#5b3482]'}
                      `}
                    >
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      return (
        <Link
          key={item.href || item.label}
          href={item.href!}
          className={`flex items-center px-3 py-2.5 rounded-lg transition-colors duration-150 ease-in-out text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50
            ${currentItemIsActive ? 'bg-[#4A2A6D] text-white font-semibold shadow-inner' : 'hover:bg-[#5b3482] text-gray-100 hover:text-white'}
            ${item.highlight ? "bg-sky-500 text-white hover:bg-sky-600 font-semibold" : ""}
          `}
        >
          {item.icon && <span className="w-7 text-center text-lg mr-2">{item.icon}</span>}
          <span className="font-medium">{item.label}</span>
        </Link>
      );
    });
  };

  return (
    <aside className="h-screen bg-[#6A3C96] w-64 p-4 text-white flex flex-col justify-between shadow-lg">
      <div className="flex flex-col flex-grow overflow-y-auto pr-1"> {/* Sağ scrollbar için pr-1 */}
        <div className="flex flex-col mb-6 gap-2">
          <div className="flex items-center gap-3 mb-4"> {/* Logo ve Admin yazısı arası boşluk */}
            <Image
              src="https://uxnpmdeizkzvnevpceiw.supabase.co/storage/v1/object/public/images/1746433174940-Untitled%20design%20(8).png"
              alt="LenaCars Logo"
              width={48} // Biraz küçülttüm
              height={48}
              className="rounded-md" // Kenarları yumuşatıldı
            />
            <span className="bg-white text-[#6A3C96] text-xs px-2.5 py-1 rounded-md font-bold tracking-wider">ADMIN</span> {/* Stil güncellendi */}
          </div>

          {adSoyad && rol && (
            <div className="bg-[#5b3482] rounded-lg p-3 mb-4 shadow"> {/* Gölge ve yuvarlaklık eklendi */}
              <div className="flex items-center gap-3">
                <div className="bg-white text-[#6A3C96] rounded-full w-9 h-9 flex items-center justify-center font-bold text-base uppercase">
                  {adSoyad.split(" ").map(n => n[0]).join("").substring(0,2)} {/* İsim soyisim baş harfleri */}
                </div>
                <div>
                  <div className="font-semibold text-sm text-white">{adSoyad}</div>
                  <div className="text-xs text-purple-200 capitalize italic">{rol.replace("_", " ")}</div> {/* Rol formatı */}
                </div>
              </div>
            </div>
          )}
        </div>

        <nav className="space-y-1.5 flex-grow"> {/* Öğeler arası boşluk ayarlandı */}
          {renderMenuItems(unifiedMenuItems)}
          
          {/* Extra Menu Items (eğer varsa ve her zaman gösterilecekse) */}
          {extraMenuItems.length > 0 && (
            <div className="mt-6 pt-6 border-t border-purple-500/50"> {/* Ayırıcı çizgi */}
              <p className="px-3 text-xs font-semibold text-purple-200 uppercase tracking-wider mb-2">Ekstra</p>
              {renderMenuItems(extraMenuItems)}
            </div>
          )}
        </nav>
      </div>

      <div className="mt-auto pt-4 border-t border-purple-500/50"> {/* Çıkış butonu için üst çizgi */}
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/login"; // Veya Next.js router ile: router.push('/login');
          }}
          className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors duration-150 ease-in-out font-medium text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
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
