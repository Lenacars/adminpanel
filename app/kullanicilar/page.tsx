"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { saveAs } from "file-saver";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
    } else {
      setUsers(data || []);
    }

    setLoading(false);
  };

  const deleteUser = async (id: string) => {
    const confirmed = confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?");
    if (!confirmed) return;

    const { error } = await supabase.from("kullanicilar").delete().eq("id", id);
    if (error) {
      alert("Kullanıcı silinirken hata oluştu.");
    } else {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const exportCSV = () => {
    const csv = [
      ["UID", "Ad", "Soyad", "E-posta", "Telefon", "Firma", "Kayıt Tarihi"],
      ...users.map((u) => [
        u.id,
        u.ad,
        u.soyad,
        u.email,
        u.telefon,
        u.firma || "",
        new Date(u.created_at).toLocaleString("tr-TR"),
      ]),
    ]
      .map((row) => row.map((val) => `"${val}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "kullanicilar.csv");
  };

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.ad} ${user.soyad}`.toLowerCase();
    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      user.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h1 className="text-xl font-bold text-[#6A3C96]">Tüm Kullanıcılar</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="İsim, Soyisim, UID veya E-posta"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded px-3 py-2 w-full md:w-64 focus:border-[#6A3C96] focus:ring-[#6A3C96]"
          />
          <Button onClick={exportCSV} className="bg-[#6A3C96] text-white">
            CSV İndir
          </Button>
        </div>
      </div>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#f3f0f7] text-[#6A3C96]">
              <tr>
                <th className="p-2">UID</th>
                <th className="p-2">Ad</th>
                <th className="p-2">Soyad</th>
                <th className="p-2">E-posta</th>
                <th className="p-2">Telefon</th>
                <th className="p-2">Firma</th>
                <th className="p-2">Kayıt Tarihi</th>
                <th className="p-2">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 font-mono text-xs">{user.id}</td>
                  <td className="p-2">{user.ad}</td>
                  <td className="p-2">{user.soyad}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{user.telefon}</td>
                  <td className="p-2">{user.firma || "-"}</td>
                  <td className="p-2">{new Date(user.created_at).toLocaleDateString("tr-TR")}</td>
                  <td className="p-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteUser(user.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Sil
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
