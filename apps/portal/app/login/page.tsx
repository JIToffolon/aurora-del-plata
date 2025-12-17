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
    <div className="min-h-screen bg-brand-950 text-white flex items-center justify-center p-6">
  <div className="w-full max-w-sm">
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 shadow-lg"
    >
      <div className="space-y-1">
        <p className="text-sm text-white/70">Aurora del Plata</p>
        <h1 className="text-2xl font-semibold tracking-tight">Portal Pacientes</h1>
        <p className="text-sm text-white/70">
          Ingresá con el usuario provisto por la ONG.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-white/70">Email</label>
        <input
          className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-brand-500/70"
          placeholder="tuemail@dominio.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-white/70">Contraseña</label>
        <input
          className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-brand-500/70"
          placeholder="••••••••"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>

      <button
        className="w-full rounded-xl bg-brand-700 hover:bg-brand-500 transition px-3 py-2 text-sm font-medium disabled:opacity-60 disabled:hover:bg-brand-700"
        disabled={loading}
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>

      {msg && (
        <p className="text-sm text-white/70">
          {msg}
        </p>
      )}

      <p className="pt-2 text-xs text-white/50">
        Si necesitás acceso, contactate con la ONG.
      </p>
    </form>
  </div>
</div>

  );
}
