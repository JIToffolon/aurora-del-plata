import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

export default async function PedidoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) redirect("/login");

  // Por RLS, el paciente solo debería poder leer sus pedidos.
  const { data: order, error } = await supabase
    .from("orders")
    .select("id,status,created_at,notes")
    .eq("id", id)
    .single();

  if (error || !order) {
    return (
      <div className="space-y-3">
        <Link href="/dashboard/pedidos" className="text-sm text-white/70 hover:text-white">
          ← Volver
        </Link>
        <div className="rounded-2xl bg-red-500/10 p-4 ring-1 ring-red-500/30 text-red-100 text-sm">
          No se encontró el pedido (o no tenés acceso).
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/dashboard/pedidos" className="text-sm text-white/70 hover:text-white">
        ← Volver a mis pedidos
      </Link>

      <div>
        <h1 className="text-xl font-semibold">Detalle de pedido</h1>
        <p className="text-sm text-white/70 break-all">ID: {order.id}</p>
      </div>

      <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className={`inline-flex items-center rounded-full px-3 py-1 ring-1 ${statusBadge(order.status)}`}>
            <b className="mr-1">Estado:</b> {order.status}
          </span>

          <span className="text-white/80">
            <b className="text-white">Fecha:</b> {new Date(order.created_at).toLocaleString()}
          </span>
        </div>

        {order.notes ? (
          <div className="text-sm text-white/70 whitespace-pre-wrap">{order.notes}</div>
        ) : (
          <div className="text-sm text-white/50">Sin notas.</div>
        )}
      </div>
    </div>
  );
}
