export function Spinner({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-white/80">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white/80" />
      <span>{label}</span>
    </div>
  );
}
