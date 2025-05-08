"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Aktivite {
    id: string;
    tarih: string;
    email: string;
    rol: string;
    islem: string;
    full_name: string;
    user_id: string;
}

export default function AktiviteLogPage() {
    const [loglar, setLoglar] = useState<Aktivite[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAktiviteler();
    }, []);

    async function fetchAktiviteler() {
        const { data, error } = await supabase
            .from("calisan_aktiviteleri")
            .select("*")
            .order("tarih", { ascending: false });

        if (error) {
            console.error("Aktiviteler çekilemedi:", error.message);
        } else {
            setLoglar(data || []);
        }
        setLoading(false);
    }

    return (
        <div className="p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Çalışan Aktivite Kayıtları</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Yükleniyor...</p>
                    ) : (
                        <table className="w-full border">
                            <thead>
                                <tr>
                                    <th>Tarih</th>
                                    <th>Ad Soyad</th>
                                    <th>Email</th>
                                    <th>Rol</th>
                                    <th>İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loglar.map((log) => (
                                    <tr key={log.id}>
                                        <td>{new Date(log.tarih).toLocaleString()}</td>
                                        <td>{log.full_name}</td>
                                        <td>{log.email}</td>
                                        <td>{log.rol}</td>
                                        <td>{log.islem}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
