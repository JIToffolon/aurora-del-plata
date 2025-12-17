import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "../components/layout/Appshell/AppShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) redirect("/login");


  const userId = data.claims.sub; 
  const {data:profile} = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  const isAdmin = profile?.role === "admin";

  const nav= [
    { href: "/dashboard", label: "Inicio" },
    { href: "/dashboard/cargar-receta", label: "Cargar receta" },
    { href: "/dashboard/crear-pedido", label: "Crear pedido" },
    { href: "/dashboard/pedidos", label: "Mis pedidos" },
    ...(isAdmin ? [{href:"/admin",label:"Panel de Administrador"}] : []),
  ]

  return <AppShell title="Dashboard" nav={nav} children={children} />;
}
