"use client";

import { useState } from "react";

export function LogoutButton({ className = "" }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      className={[
        "rounded-lg px-3 py-2 text-sm font-medium",
        "bg-brand-700 hover:bg-brand-500 transition text-white",
        "disabled:opacity-60",
        className,
      ].join(" ")}
      disabled={loading}
      onClick={() => {
        setLoading(true);
        window.location.href = "/api/auth/logout";
      }}
    >
      {loading ? "Cerrando sesión..." : "Cerrar sesión"}
    </button>
  );
}


export default LogoutButton;