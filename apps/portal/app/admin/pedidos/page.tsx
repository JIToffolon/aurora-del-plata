"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Alert } from "@/app/components/ui/Alert";
import { Spinner } from "@/app/components/ui/Spinner";
import Link from "next/link";

type Order = {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  notes: string | null;
  prescription_id: string | null;
};

const STATUSES = ["Pendiente", "En revisión", "Aprobado", "Listo", "Entregado"] as const;
type Status = (typeof STATUSES)[number];

export default function AdminPedidosPage() {
  const supabase = createClient();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [openingId, setOpeningId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  // ✅ filtros
  const [filterStatus, setFilterStatus] = useState<"ALL" | Status>("ALL");
  const [q, setQ] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const s = searchParams.get("status");
    const qq = searchParams.get("q");

    if (qq) setQ(qq);

    if (s && (STATUSES as readonly string[]).includes(s)) {
      setFilterStatus(s as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function syncUrl(nextStatus: typeof filterStatus, nextQ: string) {
    const params = new URLSearchParams();

    if (nextStatus !== "ALL") params.set("status", nextStatus);
    const cleanQ = nextQ.trim();
    if (cleanQ) params.set("q", cleanQ);

    const qs = params.toString();
    router.replace(qs ? `/admin/pedidos?${qs}` : "/admin/pedidos");
  }



  async function load() {
    setError(null);
    setSuccess(null);
    setLoadingList(true);

    const { data, error } = await supabase
      .from("orders")
      .select("id,user_id,status,created_at,notes,prescription_id")
      .order("created_at", { ascending: false });

    setLoadingList(false);

    if (error) return setError(error.message);
    setOrders(data ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function setStatus(orderId: string, status: string) {
    setError(null);
    setSuccess(null);
    setSavingId(orderId);

    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);

    setSavingId(null);

    if (error) return setError(error.message);

    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    setSuccess("✅ Estado actualizado.");
  }

  async function openPrescription(order: Order) {
    setError(null);
    setSuccess(null);

    if (!order.prescription_id) {
      setError("Este pedido no tiene receta asociada.");
      return;
    }

    setOpeningId(order.id);

    const { data: rx, error: rxErr } = await supabase
      .from("prescriptions")
      .select("file_path")
      .eq("id", order.prescription_id)
      .single();

    if (rxErr || !rx?.file_path) {
      setOpeningId(null);
      setError(rxErr?.message ?? "No se encontró la receta.");
      return;
    }

    const { data: signed, error: sErr } = await supabase.storage
      .from("prescriptions")
      .createSignedUrl(rx.file_path, 60);

    setOpeningId(null);

    if (sErr || !signed?.signedUrl) {
      setError(sErr?.message ?? "No se pudo generar el link firmado.");
      return;
    }

    window.open(signed.signedUrl, "_blank", "noopener,noreferrer");
  }

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return orders.filter((o) => {
      const statusOk = filterStatus === "ALL" ? true : o.status === filterStatus;
      if (!statusOk) return false;

      if (!query) return true;

      // búsqueda simple: por id de pedido o user_id
      return (
        o.id.toLowerCase().includes(query) ||
        o.user_id.toLowerCase().includes(query)
      );
    });
  }, [orders, filterStatus, q]);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin · Pedidos</h1>
          <p className="text-sm text-white/70">
            Filtrá por estado o buscá por ID/paciente.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            className="rounded-xl bg-white/10 hover:bg-white/15 ring-1 ring-white/10 px-3 py-2 text-sm transition disabled:opacity-60"
            onClick={load}
            disabled={loadingList}
          >
            {loadingList ? "Actualizando..." : "Refrescar"}
          </button>

        </div>
      </div>

      {/* ✅ Controles de filtro */}
      <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            value={filterStatus}
            onChange={(e) => {
              const next = e.target.value as any;
              setFilterStatus(next);
              syncUrl(next, q);
            }}

          >
            <option value="ALL">Todos los estados</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <input
            className="min-w-[240px] flex-1 rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Buscar por ID de pedido o paciente..."
            value={q}
            onChange={(e) => {
              const nextQ = e.target.value;
              setQ(nextQ);
              syncUrl(filterStatus, nextQ);
            }}
          />

          {(filterStatus !== "ALL" || q.trim()) && (
            <button
              className="rounded-xl bg-white/10 hover:bg-white/15 ring-1 ring-white/10 px-3 py-2 text-sm transition"
              onClick={() => {
                setFilterStatus("ALL");
                setQ("");
                syncUrl("ALL", "");
              }}
            >
              Limpiar
            </button>
          )}
        </div>

        <div className="text-sm text-white/70">
          Mostrando <b className="text-white">{filtered.length}</b> de{" "}
          <b className="text-white">{orders.length}</b>
        </div>
      </div>

      {error ? <Alert type="error" title="Ocurrió un problema" message={error} /> : null}
      {success ? <Alert type="success" title="Listo" message={success} /> : null}
      {loadingList ? <Spinner label="Cargando pedidos..." /> : null}

      <div className="space-y-3">
        {!loadingList && filtered.length === 0 ? (
          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 text-sm text-white/70">
            No hay pedidos que coincidan con el filtro/búsqueda.
          </div>
        ) : null}

        {filtered.map((o) => {
          const isOpening = openingId === o.id;
          const isSaving = savingId === o.id;

          return (
            <div key={o.id} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 space-y-3">
              <div className="text-sm text-white/80 flex flex-wrap gap-3">
                <span>
                  <b className="text-white">Pedido:</b> {o.id}
                </span>
                <span>
                  <b className="text-white">Paciente:</b> {o.user_id}
                </span>
                <span>
                  <b className="text-white">Fecha:</b>{" "}
                  {new Date(o.created_at).toLocaleString()}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
                  value={o.status}
                  onChange={(e) => setStatus(o.id, e.target.value)}
                  disabled={isSaving}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <button
                  className="rounded-xl bg-white/10 hover:bg-white/15 ring-1 ring-white/10 px-3 py-2 text-sm transition disabled:opacity-60"
                  onClick={() => openPrescription(o)}
                  disabled={isOpening}
                >
                  {isOpening ? "Abriendo..." : "Ver receta"}
                </button>

                {isSaving ? <Spinner label="Guardando..." /> : null}
                <Link
                  href={`/admin/pedidos/${o.id}`}
                  className="rounded-xl bg-white/10 hover:bg-white/15 transition px-3 py-2 text-sm font-medium"
                >
                  Ver detalle
                </Link>
              </div>


              {o.notes ? <p className="text-sm text-white/70 whitespace-pre-wrap">{o.notes}</p> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
