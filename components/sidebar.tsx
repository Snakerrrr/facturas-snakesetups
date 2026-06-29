"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Receipt, Settings, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const navItems = [
  { href: "/cotizaciones", label: "Cotizaciones", icon: FileText },
  { href: "/facturas", label: "Facturas", icon: Receipt },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

function NavLinks({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClick}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === item.href
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card p-4 gap-6">
        <div className="flex items-center gap-2 px-3 py-2">
          <Receipt className="h-6 w-6" />
          <span className="text-lg font-bold">SnakeSetups</span>
        </div>
        <NavLinks />
      </aside>

      {/* Mobile */}
      <header className="md:hidden flex items-center justify-between border-b px-4 py-3 bg-card">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          <span className="font-bold">SnakeSetups</span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" />}>
            {open ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-4">
            <div className="flex items-center gap-2 px-3 py-2 mb-4">
              <Receipt className="h-6 w-6" />
              <span className="text-lg font-bold">SnakeSetups</span>
            </div>
            <NavLinks onClick={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}
