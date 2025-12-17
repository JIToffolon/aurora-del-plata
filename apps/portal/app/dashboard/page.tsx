import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) redirect("/login");

  const user = userData.user;

  const { data: orders } = await supabase
    .from("orders")
    .select("id,status,created_at")
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Panel paciente</h1>
        <p className="text-sm text-white/70">
          Sesión: {user.email ?? "(sin email)"} · Administrá tus recetas y pedidos.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Link
          href="/dashboard/cargar-receta"
          className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 hover:bg-white/10 transition"
        >
          <div className="font-semibold">Cargar receta</div>
          <div className="text-sm text-white/70">Subí PDF o imagen</div>
        </Link>

        <Link
          href="/dashboard/crear-pedido"
          className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 hover:bg-white/10 transition"
        >
          <div className="font-semibold">Crear pedido</div>
          <div className="text-sm text-white/70">Elegí receta y notas</div>
        </Link>

        <Link
          href="/dashboard/pedidos"
          className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 hover:bg-white/10 transition"
        >
          <div className="font-semibold">Mis pedidos</div>
          <div className="text-sm text-white/70">Ver estados</div>
        </Link>
      </div>

      <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Últimos pedidos</h2>
          <Link href="/dashboard/pedidos" className="text-sm text-white/70 hover:text-white">
            Ver todos
          </Link>
        </div>

        <div className="mt-3 space-y-2">
          {(orders ?? []).length === 0 ? (
            <div className="text-sm text-white/70">Todavía no tenés pedidos.</div>
          ) : (
            (orders ?? []).map((o) => (
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
                <span className="text-white/50 break-all">ID: {o.id}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
