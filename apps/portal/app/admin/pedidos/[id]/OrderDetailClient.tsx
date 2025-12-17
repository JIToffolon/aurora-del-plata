"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Alert } from "@/app/components/ui/Alert";
import { Spinner } from "@/app/components/ui/Spinner";

const STATUSES = ["Pendiente", "En revisión", "Aprobado", "Listo", "Entregado"] as const;

type Order = {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  notes: string | null;
  prescription_id: string | null;
};

export default function OrderDetailClient({ initialOrder }: { initialOrder: Order }) {
  const supabase = createClient();

  const [order, setOrder] = useState<Order>(initialOrder);
  const [saving, setSaving] = useState(false);
  const [opening, setOpening] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function setStatus(nextStatus: string) {
    setError(null);
    setSuccess(null);
    setSaving(true);

    const { error } = await supabase.from("orders").update({ status: nextStatus }).eq("id", order.id);

    setSaving(false);

    if (error) return setError(error.message);

    setOrder((prev) => ({ ...prev, status: nextStatus }));
    setSuccess("✅ Estado actualizado.");
  }

  async function openPrescription() {
    setError(null);
    setSuccess(null);

    if (!order.prescription_id) {
      setError("Este pedido no tiene receta asociada.");
      return;
    }

    setOpening(true);

    const { data: rx, error: rxErr } = await supabase
      .from("prescriptions")
      .select("file_path")
      .eq("id", order.prescription_id)
      .single();

    if (rxErr || !rx?.file_path) {
      setOpening(false);
      setError(rxErr?.message ?? "No se encontró la receta.");
      return;
    }

    const { data: signed, error: sErr } = await supabase.storage
      .from("prescriptions")
      .createSignedUrl(rx.file_path, 60);

    setOpening(false);

    if (sErr || !signed?.signedUrl) {
      setError(sErr?.message ?? "No se pudo generar el link firmado.");
      return;
    }

    window.open(signed.signedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Detalle de pedido</h1>
        <p className="text-sm text-white/70 break-all">ID: {order.id}</p>
      </div>

      {error ? <Alert type="error" title="Ocurrió un problema" message={error} /> : null}
      {success ? <Alert type="success" title="Listo" message={success} /> : null}

      <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 space-y-3">
        <div className="text-sm text-white/80 flex flex-wrap gap-3">
          <span>
            <b className="text-white">Paciente:</b> {order.user_id}
          </span>
          <span>
            <b className="text-white">Fecha:</b> {new Date(order.created_at).toLocaleString()}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
            value={order.status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={saving}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <button
            className="rounded-xl bg-white/10 hover:bg-white/15 ring-1 ring-white/10 px-3 py-2 text-sm transition disabled:opacity-60"
            onClick={openPrescription}
            disabled={opening}
          >
            {opening ? "Abriendo..." : "Ver receta"}
          </button>

          {saving ? <Spinner label="Guardando..." /> : null}
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
