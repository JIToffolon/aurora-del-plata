import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const STATUSES = ["Pendiente", "En revisión", "Aprobado", "Listo", "Entregado"] as const;

function statusCard(status: string) {
  switch (status) {
    case "Pendiente":
      return "bg-white/5 ring-white/10";
    case "En revisión":
      return "bg-brand-500/10 ring-brand-500/25";
    case "Aprobado":
      return "bg-emerald-500/10 ring-emerald-500/25";
    case "Listo":
      return "bg-brand-150/15 ring-brand-150/25";
    case "Entregado":
      return "bg-white/5 ring-white/10";
    default:
      return "bg-white/5 ring-white/10";
  }
}

export default async function AdminHomePage() {
  const supabase = await createClient();

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  // Traer pedidos (solo campos necesarios) para conteo + últimos
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id,status,created_at,user_id")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Panel admin</h1>
        <div className="rounded-2xl bg-red-500/10 p-4 ring-1 ring-red-500/30 text-red-100 text-sm">
          Error: {error.message}
        </div>
      </div>
    );
  }

  const list = orders ?? [];
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<string, number>;
  for (const o of list) counts[o.status] = (counts[o.status] ?? 0) + 1;

  const latest = list.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Panel admin</h1>
          <p className="text-sm text-white/70">
            Resumen operativo de pedidos y accesos rápidos.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/pedidos"
            className="rounded-xl bg-brand-700 hover:bg-brand-500 transition px-3 py-2 text-sm font-medium"
          >
            Ver pedidos
          </Link>
          <Link
            href="/admin/pacientes"
            className="rounded-xl bg-white/10 hover:bg-white/15 ring-1 ring-white/10 px-3 py-2 text-sm transition"
          >
            Ver pacientes
          </Link>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/pedidos?status=${encodeURIComponent(s)}`}
            className={[
              "rounded-2xl p-4 ring-1 transition hover:bg-white/10",
              statusCard(s),
            ].join(" ")}
            title="Ir a pedidos"
          >
            <div className="text-sm text-white/70">{s}</div>
            <div className="text-2xl font-semibold">{counts[s] ?? 0}</div>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Últimos pedidos</h2>
        </div>

        <div className="mt-3 space-y-2">
          {latest.length === 0 ? (
            <div className="text-sm text-white/70">No hay pedidos todavía.</div>
          ) : (
            latest.map((o) => (
              <div
                key={o.id}
                className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10 text-sm flex flex-wrap gap-3"
              >
                <span className="text-white/80">
                  <b className="text-white">Estado:</b> {o.status}
                </span>
                <span className="text-white/70">
                  {new Date(o.created_at).toLocaleString()}
                </span>
                <span className="text-white/50 break-all">Paciente: {o.user_id}</span>
                <span className="text-white/50 break-all">ID: {o.id}</span>
                <Link href={`/admin/pedidos/${o.id}`}
                  className="text-sm text-white/70 hover:text-white rounded-xl bg-white/10 hover:bg-white/15 transition px-3 py-2 text-sm font-medium">
                  Ver Pedido
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
