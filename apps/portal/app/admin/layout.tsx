import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "../components/layout/Appshell/AppShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  const user = userData?.user;

  if (userErr || !user) redirect("/login");

  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profErr) {
    // Si esto falla, es porque no existe profile o RLS/query
    redirect("/dashboard");
  }

  if (profile?.role !== "admin") redirect("/dashboard");

  const nav = [
    { href: "/admin", label: "Admin" },
    { href: "/admin/pacientes", label: "Pacientes" },
    { href: "/admin/pedidos", label: "Pedidos" },
    { href: "/dashboard", label: "Dashboard" },
  ]

  return <AppShell title="Admin" nav={nav} children={children} />
}
