
const ASSETS = import.meta.glob("../assets/**/*.{png,jpg,jpeg,webp,avif}", {
  eager: true,
  import: "default",
});

export function resolveKeystaticAsset(path: string | null | undefined) {
  if (!path) return null;

  // Keystatic te devuelve algo como "@assets/posts/..."
  const key = path.replace(/^@assets\//, "../assets/");

  return (ASSETS as Record<string, any>)[key] ?? null;
}