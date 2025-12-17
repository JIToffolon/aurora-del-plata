"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const { error } = await createClient().auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) return setMsg(error.message);

    window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-2xl border p-6">
        <h1 className="text-xl font-semibold">Portal Pacientes</h1>

        <input
          className="w-full rounded-md border px-3 py-2 bg-transparent"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full rounded-md border px-3 py-2 bg-transparent"
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full rounded-md border px-3 py-2"
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        {msg && <p className="text-sm opacity-80">{msg}</p>}
      </form>
    </div>
  );
}
