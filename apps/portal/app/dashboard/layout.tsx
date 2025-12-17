import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "../components/layout/Appshell/AppShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) redirect("/login");


  const nav= [
    { href: "/dashboard", label: "Inicio" },
    { href: "/dashboard/cargar-receta", label: "Cargar receta" },
    { href: "/dashboard/crear-pedido", label: "Crear pedido" },
    { href: "/dashboard/pedidos", label: "Mis pedidos" },
    { href: "/admin", label: "Admin" },
  ]

  return <AppShell title="Dashboard" nav={nav} children={children} />;
}
