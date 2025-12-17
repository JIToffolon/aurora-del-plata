"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogOutButton from "../../LogOutButton/LogOutButton"

type NavItem = { href: string; label: string };

export function AppShell({
  title,
  nav,
  children,
}: {
  title: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-brand-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-sm text-white/70">Portal Aurora del Plata</p>
          </div>
          <LogOutButton />
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
          <aside className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
            <nav className="flex flex-col gap-1">
              {nav.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "rounded-xl px-3 py-2 text-sm transition",
                      active
                        ? "bg-brand-700 text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
