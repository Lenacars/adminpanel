import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ENV değişkenleri
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Supabase Admin Client (Service Key ile)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
    const body = await req.json();
    const { ad, soyad, email, telefon, rol, sifre } = body;

    // Form kontrolü
    if (!ad || !soyad || !email || !rol || !sifre) {
        return NextResponse.json({ error: "Eksik bilgi var." }, { status: 400 });
    }

    try {
        // 1️⃣ Önce kullanıcıyı Supabase Auth sistemine kaydet
        const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: sifre,
            email_confirm: true,
        });

        if (createError) {
            console.error("Auth kullanıcı oluşturma hatası:", createError.message);
            return NextResponse.json({ error: "Kullanıcı oluşturulamadı: " + createError.message }, { status: 500 });
        }

        const authUserId = userData?.user?.id;

        if (!authUserId) {
            return NextResponse.json({ error: "Auth kullanıcı ID alınamadı." }, { status: 500 });
        }

        // 2️⃣ calisanlar tablosuna ekle
        const { error: dbError } = await supabaseAdmin
            .from("calisanlar")
            .insert([
                {
                    ad,
                    soyad,
                    email,
                    telefon,
                    rol,
                    aktif: true,
                    auth_user_id: authUserId,
                },
            ]);

        if (dbError) {
            console.error("Çalışan tablo ekleme hatası:", dbError.message);
            return NextResponse.json({ error: "Çalışan eklenemedi: " + dbError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Çalışan başarıyla eklendi." });

    } catch (error: any) {
        console.error("Beklenmeyen hata:", error.message);
        return NextResponse.json({ error: "Beklenmeyen bir hata oluştu." }, { status: 500 });
    }
}
