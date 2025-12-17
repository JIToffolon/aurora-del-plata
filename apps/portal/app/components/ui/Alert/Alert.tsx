export function Alert({
  type = "info",
  title,
  message,
}: {
  type?: "success" | "error" | "info";
  title?: string;
  message: string;
}) {
  const styles =
    type === "success"
      ? "bg-emerald-500/10 ring-emerald-500/30 text-emerald-100"
      : type === "error"
      ? "bg-red-500/10 ring-red-500/30 text-red-100"
      : "bg-white/5 ring-white/10 text-white/90";

  return (
    <div className={`rounded-xl p-3 ring-1 ${styles}`}>
      {title ? <div className="mb-1 text-sm font-semibold">{title}</div> : null}
      <div className="text-sm leading-relaxed">{message}</div>
    </div>
  );
}
