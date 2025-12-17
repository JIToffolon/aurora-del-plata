"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Alert } from "@/app/components/ui/Alert";
import { Spinner } from "@/app/components/ui/Spinner";

export default function CargarRecetaPage() {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);

  const [info, setInfo] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  function resetMessages() {
    setInfo(null);
    setSuccess(null);
    setError(null);
  }

  function pickFile() {
    resetMessages();
    inputRef.current?.click();
  }

  async function onUpload() {
    resetMessages();

    if (!file) {
      setError("Elegí un archivo (PDF o imagen).");
      return;
    }

    // (opcional) validación de tamaño (ej: 10MB)
    const MAX_MB = 10;
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`El archivo es muy grande. Máximo ${MAX_MB}MB.`);
      return;
    }

    setLoading(true);

    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      const user = userData.user;

      if (userErr || !user) {
        setError("Sesión inválida. Volvé a loguearte.");
        return;
      }

      const safeName = file.name.replaceAll(" ", "_");
      const path = `${user.id}/${crypto.randomUUID()}_${safeName}`;

      const { error: upErr } = await supabase.storage
        .from("prescriptions")
        .upload(path, file, { upsert: false, contentType: file.type });

      if (upErr) {
        setError(`No se pudo subir el archivo: ${upErr.message}`);
        return;
      }

      const { error: dbErr } = await supabase.from("prescriptions").insert({
        user_id: user.id,
        file_path: path,
      });

      if (dbErr) {
        setError(`No se pudo registrar en la base: ${dbErr.message}`);
        return;
      }

      setSuccess("✅ Receta cargada correctamente.");

      // reset input + estado (permite volver a subir el mismo archivo)
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Cargar receta</h1>
        <p className="text-sm text-white/70">
          Subí un PDF o imagen. Queda guardado en storage privado.
        </p>
      </div>

      {/* input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/*"
        className="hidden"
        onChange={(e) => {
          resetMessages();
          const f = e.target.files?.[0] ?? null;
          setFile(f);

          if (f) {
            setInfo(`Archivo seleccionado: ${f.name}`);
          } else {
            setInfo(null);
          }
        }}
      />

      {error ? <Alert type="error" title="No se pudo subir" message={error} /> : null}
      {success ? <Alert type="success" title="Listo" message={success} /> : null}
      {info ? <Alert type="info" title="Info" message={info} /> : null}

      <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="rounded-xl bg-white/10 hover:bg-white/15 ring-1 ring-white/10 px-3 py-2 text-sm transition disabled:opacity-60"
            type="button"
            onClick={pickFile}
            disabled={loading}
          >
            Elegir archivo
          </button>

          <button
            className="rounded-xl bg-brand-700 hover:bg-brand-500 transition px-3 py-2 text-sm font-medium disabled:opacity-60"
            type="button"
            disabled={loading || !file}
            onClick={onUpload}
          >
            {loading ? "Subiendo..." : "Subir receta"}
          </button>

          <span className="text-sm text-white/70">
            {file ? file.name : "No hay archivo seleccionado"}
          </span>
        </div>

        {loading ? <Spinner label="Subiendo receta..." /> : null}
      </div>
    </div>
  );
}
