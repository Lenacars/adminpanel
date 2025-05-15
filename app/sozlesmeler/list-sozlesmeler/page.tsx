"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ListSozlesmeler() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("sozlesmeler")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setData(data);
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Oluşturulmuş Sözleşmeler</h1>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Tarih</th>
            <th className="p-2 border">Müşteri</th>
            <th className="p-2 border">PDF</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td className="p-2 border">{new Date(item.created_at).toLocaleDateString("tr-TR")}</td>
              <td className="p-2 border">{item.musteri_adi}</td>
              <td className="p-2 border">
                <Link href={item.pdf_url} target="_blank" className="text-blue-600 underline">
                  Görüntüle
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
