"use client";

import { useEffect } from "react";

export function ConfirmDialog({
  open,
  title = "Confirmar",
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black p-4"
      onMouseDown={(e) => {
        // click afuera cierra
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-brand-950 text-white ring-1 ring-white/15">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-base font-semibold">{title}</h3>
        </div>

        <div className="p-4 text-sm text-white/80">{description}</div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-white/10">
          <button
            className="rounded-xl bg-white/10 hover:bg-white/15 ring-1 ring-white/10 px-3 py-2 text-sm transition disabled:opacity-60"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            className={[
              "rounded-xl px-3 py-2 text-sm font-medium transition disabled:opacity-60",
              danger
                ? "bg-red-500/80 hover:bg-red-500"
                : "bg-brand-700 hover:bg-brand-500",
            ].join(" ")}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
