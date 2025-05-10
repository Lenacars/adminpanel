"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Hata:", error.message);
    } else {
      const session = data?.session;

      if (!session) {
        console.error("Session bulunamadı!");
        return;
      }

      const user = session.user;

      // ✅ Supabase token'ı localStorage'a yaz (Authorization için gerekli)
      localStorage.setItem("sb-access-token", session.access_token);

      // ✅ Kullanıcının rolünü calisanlar tablosundan al
      const { data: userData, error: userError } = await supabase
        .from("calisanlar")
        .select("rol")
        .eq("auth_user_id", user.id)
        .single();

      if (userError) {
        console.error("Rol alınamadı:", userError.message);
      } else {
        // ✅ localStorage'a rolü yaz
        localStorage.setItem("user_role", userData.rol);
        console.log("Rol kaydedildi:", userData.rol);
      }

      console.log("Giriş başarılı ✅");
      router.push("/products");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Giriş Yap</h1>
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label htmlFor="email" className="block">E-posta</label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full p-2 border"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block">Şifre</label>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full p-2 border"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded"
        >
          Giriş Yap
        </button>
      </form>
    </div>
  );
}
