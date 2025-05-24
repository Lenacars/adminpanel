"use client";

import { useEffect, useState, useMemo } from "react"; // useMemo eklendi
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button"; // shadcn/ui Button
import { Trash2, Download, Search, Loader2, UsersIcon } from "lucide-react"; // İkonlar eklendi
import { saveAs } from "file-saver";

// Eğer shadcn/ui Input kullanılıyorsa:
// import { Input } from "@/components/ui/input";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Kurumsal Renk
  const corporateColor = "#6A3C96";
  const corporateColorLight = "#f3f0f7"; // Açık tonu (tablo başlığı için)

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("kullanicilar")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Kullanıcılar alınamadı:", error.message);
      // Kullanıcıya bir bildirim gösterilebilir (örn: toast notification)
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const deleteUser = async (id: string) => {
    const confirmed = window.confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?");
    if (!confirmed) return;

    const { error } = await supabase.from("kullanicilar").delete().eq("id", id);
    if (error) {
      alert("Kullanıcı silinirken hata oluştu: " + error.message);
    } else {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      // Başarı bildirimi gösterilebilir
    }
  };

  const exportCSV = () => {
    if (users.length === 0) {
      alert("Dışa aktarılacak kullanıcı bulunmamaktadır.");
      return;
    }
    const csvHeader = ["UID", "Ad", "Soyad", "E-posta", "Telefon", "Firma", "Kayıt Tarihi"];
    const csvRows = users.map((u) => [
      u.id,
      u.ad || "", // Boş değerler için ""
      u.soyad || "",
      u.email || "",
      u.telefon || "",
      u.firma || "",
      u.created_at ? new Date(u.created_at).toLocaleString("tr-TR", { dateStyle: 'short', timeStyle: 'short' }) : "",
    ]);

    const csvContent = [
      csvHeader.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","), // Başlık satırı
      ...csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")) // Veri satırları
    ].join("\n");
    
    // Türkçe karakter uyumluluğu için BOM (Byte Order Mark) ekleniyor
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "kullanicilar.csv");
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchTerm = searchQuery.toLowerCase();
      const fullName = `${user.ad || ""} ${user.soyad || ""}`.toLowerCase();
      return (
        fullName.includes(searchTerm) ||
        user.id?.toLowerCase().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm) ||
        user.telefon?.toLowerCase().includes(searchTerm) ||
        user.firma?.toLowerCase().includes(searchTerm)
      );
    });
  }, [users, searchQuery]);

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen"> {/* Sayfa arka planı ve padding */}
      {/* Başlık ve Eylemler */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0" style={{ color: corporateColor }}>
          Kullanıcı Yönetimi
        </h1>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input // Eğer shadcn/ui Input varsa: <Input type="text" ... />
              type="text"
              placeholder="Kullanıcılarda ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full sm:w-64 md:w-72 rounded-md border border-gray-300 bg-white px-3 py-2 pl-10 text-sm shadow-sm
                         focus:outline-none focus:ring-2 focus:border-transparent ring-offset-2"
              style={{ "--ring-color": corporateColor, "--tw-ring-color": corporateColor } as React.CSSProperties} // Focus ring rengi için
            />
          </div>
          <Button onClick={exportCSV} style={{ backgroundColor: corporateColor }} className="text-white hover:opacity-90 w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            CSV İndir
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center text-center py-10">
          <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: corporateColor }} />
          <p className="text-lg font-medium text-gray-700">Kullanıcılar yükleniyor...</p>
          <p className="text-sm text-gray-500">Lütfen bekleyiniz.</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
            <UsersIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchQuery ? "Aramanızla Eşleşen Kullanıcı Bulunamadı" : "Kayıtlı Kullanıcı Bulunmamaktadır"}
            </h3>
            <p className="text-sm text-gray-500">
                {searchQuery ? "Lütfen arama teriminizi değiştirin veya tüm kullanıcıları listelemek için aramayı temizleyin." : "Sistemde henüz kayıtlı kullanıcı yok."}
            </p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="font-semibold" style={{ backgroundColor: corporateColorLight, color: corporateColor }}>
                <tr>
                  <th className="px-4 py-3">UID</th>
                  <th className="px-4 py-3">Ad</th>
                  <th className="px-4 py-3">Soyad</th>
                  <th className="px-4 py-3">E-posta</th>
                  <th className="px-4 py-3">Telefon</th>
                  <th className="px-4 py-3">Firma</th>
                  <th className="px-4 py-3">Kayıt Tarihi</th>
                  <th className="px-4 py-3 text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{user.id}</td>
                    <td className="px-4 py-3">{user.ad || "-"}</td>
                    <td className="px-4 py-3">{user.soyad || "-"}</td>
                    <td className="px-4 py-3 break-all">{user.email || "-"}</td> {/* break-all uzun epostalar için */}
                    <td className="px-4 py-3">{user.telefon || "-"}</td>
                    <td className="px-4 py-3">{user.firma || "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap"> 
                      {user.created_at ? new Date(user.created_at).toLocaleDateString("tr-TR", {
                        year: 'numeric', month: 'short', day: 'numeric'
                      }) : "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteUser(user.id)}
                        className="px-2.5 py-1" // Buton boyutunu biraz ayarladım
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" /> Sil
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
