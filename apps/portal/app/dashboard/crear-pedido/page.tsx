"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Alert } from "@/app/components/ui/Alert";
import { Spinner } from "@/app/components/ui/Spinner";

type Prescription = { id: string; created_at: string };

export default function CrearPedidoPage() {
  const supabase = createClient();

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [prescriptionId, setPrescriptionId] = useState<string>("");

  const [notes, setNotes] = useState("");

  const [loadingRx, setLoadingRx] = useState(false);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function resetMessages() {
    setError(null);
    setInfo(null);
  }

  useEffect(() => {
    (async () => {
      resetMessages();
      setLoadingRx(true);

      const { data, error } = await supabase
        .from("prescriptions")
        .select("id, created_at")
        .order("created_at", { ascending: false });

      setLoadingRx(false);

      if (error) {
        setError(error.message);
        return;
      }

      const list = data ?? [];
      setPrescriptions(list);
      setPrescriptionId(list[0]?.id ?? "");

      if (list.length === 0) {
        setInfo("Para crear un pedido primero tenés que cargar una receta.");
      }



    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();

    if (!prescriptionId) {
      setError("Tenés que seleccionar una receta para crear el pedido.");
      return;
    }
    setCreating(true);

    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      const user = userData.user;

      if (userErr || !user) {
        setError("Sesión inválida. Volvé a loguearte.");
        return;
      }

      const { error } = await supabase.from("orders").insert({
        user_id: user.id,
        prescription_id: prescriptionId || null,
        notes: notes.trim() || null,
      });

      if (error) {
        setError(error.message);
        return;
      }

      window.location.href = "/dashboard/pedidos";
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Crear pedido</h1>
        <p className="text-sm text-white/70">
          Seleccioná una receta (si tenés) y agregá notas opcionales.
        </p>
      </div>

      {error ? <Alert type="error" title="No se pudo crear" message={error} /> : null}
      {info ? <Alert type="info" title="Info" message={info} /> : null}

      <form
        onSubmit={onSubmit}
        className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 space-y-3"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-sm text-white/90">Datos del pedido</h2>
          {loadingRx ? <Spinner label="Cargando recetas..." /> : null}
        </div>

        <label className="block space-y-1">
          <span className="text-xs text-white/70">Receta asociada</span>
          <select
            className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
            value={prescriptionId}
            onChange={(e) => setPrescriptionId(e.target.value)}
            disabled={creating || loadingRx || prescriptions.length === 0}
          >
            {prescriptions.length === 0 ? (
              <option value="">(No hay recetas cargadas)</option>
            ) : null}

            {prescriptions.map((p) => (
              <option key={p.id} value={p.id}>
                {new Date(p.created_at).toLocaleString()}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-xs text-white/70">Notas (opcional)</span>
          <textarea
            className="w-full min-h-[110px] rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Ej: necesito retirar el viernes / aclaraciones del tratamiento / etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            className="rounded-xl bg-brand-700 hover:bg-brand-500 transition px-4 py-2 text-sm font-medium disabled:opacity-60"
            disabled={creating || loadingRx}
            type="submit"
          >
            {creating ? "Creando..." : "Crear pedido"}
          </button>

          {creating ? <Spinner label="Creando pedido..." /> : null}
        </div>
      </form>
    </div>
  );
}
