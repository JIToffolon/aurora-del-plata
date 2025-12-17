import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrderDetailClient from "./OrderDetailClient";

export default async function AdminPedidoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: order, error } = await supabase
    .from("orders")
    .select("id,user_id,status,created_at,notes,prescription_id")
    .eq("id", id)
    .single();

  if (error || !order) {
    return (
      <div className="space-y-3">
        <Link href="/admin/pedidos" className="text-sm text-white/70 hover:text-white">
          ← Volver a pedidos
        </Link>
        <div className="rounded-2xl bg-red-500/10 p-4 ring-1 ring-red-500/30 text-red-100 text-sm">
          No se encontró el pedido.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/admin/pedidos" className="text-sm text-white/70 hover:text-white">
        ← Volver a pedidos
      </Link>

      <OrderDetailClient initialOrder={order} />
    </div>
  );
}
