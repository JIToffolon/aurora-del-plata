"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Alert } from "@/app/components/ui/Alert";
import { Spinner } from "@/app/components/ui/Spinner";
import { fetchJson } from "@/app/components/ui/FetchJson";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";


type Profile = {
  id: string;
  full_name: string | null;
  role: string;
  created_at: string;
};

export default function AdminPacientesPage() {
  const supabase = createClient();

  const [profiles, setProfiles] = useState<Profile[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [loadingList, setLoadingList] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Profile | null>(null);


  async function load() {
    setError(null);
    setSuccess(null);
    setLoadingList(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, created_at")
      .order("created_at", { ascending: false });

    setLoadingList(false);

    if (error) return setError(error.message);
    setProfiles(data ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createPatient(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setCreating(true);

    try {
      await fetchJson("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email, password }),
      });

      setFullName("");
      setEmail("");
      setPassword("");

      setSuccess("✅ Paciente creado.");
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Error creando usuario");
    } finally {
      setCreating(false);
    }
  }

  async function deleteUser(user_id: string) {
    setError(null);
    setSuccess(null);
    setDeletingId(user_id);

    try {
      await fetchJson("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id }),
      });

      setSuccess("✅ Usuario eliminado.");
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Error eliminando usuario");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Admin · Pacientes</h1>
          <p className="text-sm text-white/70">
            Alta/baja de pacientes (cuentas creadas por la ONG)
          </p>
        </div>

        <button
          className="rounded-xl bg-white/10 hover:bg-white/15 ring-1 ring-white/10 px-3 py-2 text-sm transition"
          onClick={load}
          disabled={loadingList}
        >
          {loadingList ? "Actualizando..." : "Refrescar"}
        </button>
      </div>

      {error ? <Alert type="error" title="Ocurrió un problema" message={error} /> : null}
      {success ? <Alert type="success" title="Listo" message={success} /> : null}

      <form
        onSubmit={createPatient}
        className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 space-y-3"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Crear paciente</h2>
          {creating ? <Spinner label="Creando..." /> : null}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <input
            className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Nombre completo (opcional)"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          disabled={creating}
          className="rounded-xl bg-brand-700 hover:bg-brand-500 transition px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {creating ? "Creando..." : "Crear"}
        </button>
      </form>

      <div className="space-y-2">
        {loadingList ? <Spinner label="Cargando pacientes..." /> : null}

        {!loadingList && profiles.length === 0 ? (
          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 text-sm text-white/70">
            No hay pacientes para mostrar.
          </div>
        ) : null}

        {profiles.map((p) => {
          const isDeleting = deletingId === p.id;
          const disabled = p.role === "admin" || isDeleting;

          return (
            <div
              key={p.id}
              className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="text-sm">
                <div>
                  <b>{p.full_name || "(sin nombre)"}</b> ·{" "}
                  <span className="text-white/70">{p.role}</span>
                </div>
                <div className="text-white/60">{p.id}</div>
              </div>

              <button
                className="rounded-xl bg-white/10 hover:bg-white/15 ring-1 ring-white/10 px-3 py-2 text-sm transition disabled:opacity-60"
                onClick={() => {
                  setToDelete(p);
                  setConfirmOpen(true);
                }}

                disabled={disabled}
                title={p.role === "admin" ? "No borrar admin" : "Borrar"}
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          );
        })}
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar paciente"
        description={
          <div className="space-y-2">
            <p>
              Vas a eliminar la cuenta del paciente:
            </p>
            <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
              <div className="font-semibold">
                {toDelete?.full_name || "(sin nombre)"}
              </div>
              <div className="text-xs text-white/60 break-all">{toDelete?.id}</div>
            </div>
            <p className="text-white/70">
              Esta acción no se puede deshacer.
            </p>
          </div>
        }
        danger
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        loading={deletingId != null}
        onCancel={() => {
          if (deletingId) return;
          setConfirmOpen(false);
          setToDelete(null);
        }}
        onConfirm={async () => {
          if (!toDelete) return;
          await deleteUser(toDelete.id);
          setConfirmOpen(false);
          setToDelete(null);
        }}
      />

    </div>
  );
}
