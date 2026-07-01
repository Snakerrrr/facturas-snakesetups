"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Receipt, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/cotizaciones", label: "Cotizaciones", icon: FileText },
  { href: "/facturas", label: "Facturas", icon: Receipt },
  { href: "/configuracion", label: "Config", fullLabel: "Configuración", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r bg-card p-4 gap-6 shrink-0">
        <div className="flex items-center gap-2.5 px-3 py-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Receipt className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">SnakeSetups</span>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                pathname === item.href
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.fullLabel || item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile: top brand bar */}
      <header className="md:hidden flex items-center justify-center border-b px-4 py-2.5 bg-card">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
            <Receipt className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm">SnakeSetups</span>
        </div>
      </header>

      {/* Mobile: bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-sm safe-area-bottom">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 px-3 min-w-[64px] text-[11px] font-medium transition-colors",
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", pathname === item.href && "stroke-[2.5px]")} />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
