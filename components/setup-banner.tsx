"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Circle, Shield, FileKey, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  isEmpresaSaved,
  hasCertificate,
  hasCAF,
} from "@/lib/client-storage";

interface StatusItem {
  label: string;
  done: boolean;
  icon: React.ElementType;
}

export function StatusBar() {
  const [items, setItems] = useState<StatusItem[] | null>(null);

  useEffect(() => {
    setItems([
      { label: "Empresa", done: isEmpresaSaved(), icon: Shield },
      { label: "Certificado", done: hasCertificate(), icon: FileKey },
      { label: "CAF", done: hasCAF(33), icon: FolderOpen },
    ]);
  }, []);

  if (!items) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {items.map((item) => (
        <Link key={item.label} href="/configuracion">
          <Badge
            variant={item.done ? "secondary" : "outline"}
            className={
              item.done
                ? "gap-1.5 bg-[var(--snake-muted)] text-[var(--snake)] border-[var(--snake)]/20 hover:bg-[var(--snake-muted)] cursor-pointer transition-colors"
                : "gap-1.5 border-border text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            }
          >
            {item.done ? (
              <Check className="h-3 w-3" />
            ) : (
              <Circle className="h-3 w-3" />
            )}
            {item.label}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
