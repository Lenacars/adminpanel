// components/Login.tsx
import React, { useState } from "react";
import { loginWithCredentials } from "@/lib/auth";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("admin@lenacars.com");
  const [password, setPassword] = useState("LenaCars*2023");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await loginWithCredentials(email, password);
      router.push("/admin");  // Başarılı giriş sonrası admin paneline yönlendir
    } catch (err) {
      setError("Giriş hatası: " + err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Admin Paneline Giriş Yap</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Şifre:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit">Giriş Yap</button>
      </form>
    </div>
  );
}
