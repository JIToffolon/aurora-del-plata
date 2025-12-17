import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

function statusBadge(status: string) {
  switch (status) {
    case "Pendiente":
      return "bg-white/10 ring-white/15 text-white/90";
    case "En revisión":
      return "bg-brand-500/15 ring-brand-500/30 text-white";
    case "Aprobado":
      return "bg-emerald-500/15 ring-emerald-500/30 text-emerald-100";
    case "Listo":
      return "bg-brand-150/20 ring-brand-150/30 text-white";
    case "Entregado":
      return "bg-white/10 ring-white/15 text-white/80";
    default:
      return "bg-white/10 ring-white/15 text-white/90";
  }
}

export default async function PedidosPage() {
  const supabase = await createClient();

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) redirect("/login");

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, status, created_at, notes")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Mis pedidos</h1>
        <div className="rounded-2xl bg-red-500/10 p-4 ring-1 ring-red-500/30 text-red-100 text-sm">
          Error: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Mis pedidos</h1>
        <p className="text-sm text-white/70">Acá podés ver el estado de cada pedido.</p>
      </div>

      <div className="space-y-3">
        {(orders ?? []).map((o) => (
          <div key={o.id} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span
                className={[
                  "inline-flex items-center rounded-full px-3 py-1",
                  "ring-1",
                  statusBadge(o.status),
                ].join(" ")}
              >
                <b className="mr-1">Estado:</b> {o.status}
              </span>

              <span className="text-white/80">
                <b className="text-white">Fecha:</b>{" "}
                {new Date(o.created_at).toLocaleString()}
              </span>
            </div>

            {o.notes ? (
              <p className="mt-3 text-sm text-white/70 whitespace-pre-wrap">{o.notes}</p>
            ) : null}

            <div className="mt-3 text-xs text-white/50 break-all mb-6">
              ID: {o.id}
            </div>
            <Link
              href={`/dashboard/pedidos/${encodeURIComponent(o.id)}`}
              className="rounded-xl bg-brand-700 hover:bg-brand-500 transition px-3 py-2 text-sm font-medium"
            >
              Ver detalle
            </Link>

          </div>
        ))}

        {(orders?.length ?? 0) === 0 ? (
          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 text-sm text-white/70">
            Todavía no tenés pedidos.
          </div>
        ) : null}
      </div>
    </div>
  );
}
