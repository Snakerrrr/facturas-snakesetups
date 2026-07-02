"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Settings,
  Menu,
  PanelLeftClose,
  Zap,
  Clock,
  Users,
  BarChart3,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getEmpresa, isEmpresaSaved } from "@/lib/client-storage";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cotizaciones", label: "Cotizaciones", icon: FileText },
  { href: "/facturas", label: "Facturas", icon: Receipt },
  { href: "/historial", label: "Historial", icon: Clock },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/resumen", label: "Resumen", icon: BarChart3 },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 overflow-hidden">
      <div className="h-9 w-9 shrink-0 rounded-xl bg-[var(--snake-muted)] flex items-center justify-center border border-[var(--snake)]/20">
        <Zap className="h-4.5 w-4.5 text-[var(--snake)]" />
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-foreground">
            FacturApp
          </span>
          <span className="text-[10px] text-muted-foreground leading-none">
            Facturación SII
          </span>
        </div>
      )}
    </div>
  );
}

function EmpresaInfo({ collapsed }: { collapsed?: boolean }) {
  const [empresa, setEmpresa] = useState<{ razonSocial: string; rut: string } | null>(null);

  useEffect(() => {
    if (isEmpresaSaved()) {
      const data = getEmpresa();
      if (data.razonSocial) {
        setEmpresa({ razonSocial: data.razonSocial, rut: data.rut });
      }
    }
  }, []);

  if (!empresa) {
    return (
      <Link href="/configuracion" className="block">
        <div className={cn("rounded-xl border border-dashed border-border p-3 hover:bg-muted/30 transition-colors", collapsed && "p-2")}>
          {collapsed ? (
            <Building2 className="h-4 w-4 text-muted-foreground mx-auto" />
          ) : (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Sin empresa configurada</p>
              <p className="text-[10px] text-muted-foreground">Click para configurar</p>
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <div className={cn("rounded-xl bg-[var(--snake-muted)] p-3", collapsed && "p-2")}>
      {collapsed ? (
        <Building2 className="h-4 w-4 text-[var(--snake)] mx-auto" />
      ) : (
        <div className="space-y-1">
          <p className="text-xs font-medium text-[var(--snake)] truncate">
            {empresa.razonSocial}
          </p>
          {empresa.rut && (
            <p className="text-[10px] text-muted-foreground">
              RUT: {empresa.rut}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function NavLink({
  item,
  collapsed,
  onClick,
}: {
  item: (typeof navItems)[0];
  collapsed?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        collapsed && "justify-center px-2.5",
        isActive
          ? "bg-[var(--snake-muted)] text-[var(--snake)] shadow-[0_0_12px_var(--snake-muted)]"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[var(--snake)]" />
      )}
      <item.icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors",
          isActive ? "text-[var(--snake)]" : "group-hover:text-foreground"
        )}
      />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

function MobileTabBar() {
  const pathname = usePathname();
  const mainItems = navItems.slice(0, 5);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-sidebar/95 backdrop-blur-md safe-area-bottom">
      <div className="flex items-center justify-around">
        {mainItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] text-[10px] font-medium transition-colors relative",
                isActive ? "text-[var(--snake)]" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-b-full bg-[var(--snake)]" />
              )}
              <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
              {item.label.length > 8 ? item.label.slice(0, 7) + "." : item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-border/50 bg-sidebar transition-all duration-300 shrink-0",
          collapsed ? "w-[68px]" : "w-60"
        )}
      >
        <div
          className={cn(
            "flex items-center border-b border-border/50 h-14",
            collapsed ? "justify-center px-2" : "justify-between px-4"
          )}
        >
          <Logo collapsed={collapsed} />
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => setCollapsed(true)}
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>

        <nav className={cn("flex flex-col gap-1 p-3 flex-1", collapsed && "px-2")}>
          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 mx-auto mb-2 text-muted-foreground hover:text-foreground"
              onClick={() => setCollapsed(false)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} />
          ))}
        </nav>

        <div className={cn("p-3 border-t border-border/50", collapsed && "px-2")}>
          <EmpresaInfo collapsed={collapsed} />
        </div>
      </aside>

      {/* Mobile: top brand bar */}
      <header className="md:hidden flex items-center justify-between border-b border-border/50 px-4 h-12 bg-sidebar">
        <Logo />
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
            <Menu className="h-4 w-4" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar border-border/50">
            <div className="flex items-center px-4 h-14 border-b border-border/50">
              <Logo />
            </div>
            <nav className="flex flex-col gap-1 p-3 flex-1">
              {navItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>
            <div className="p-3 border-t border-border/50">
              <EmpresaInfo />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <MobileTabBar />
    </>
  );
}
