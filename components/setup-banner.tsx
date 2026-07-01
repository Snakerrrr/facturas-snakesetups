"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, ChevronRight } from "lucide-react";
import {
  isEmpresaSaved,
  hasCertificate,
  hasCAF,
} from "@/lib/client-storage";

interface CheckItem {
  label: string;
  done: boolean;
}

export function SetupBanner() {
  const [checks, setChecks] = useState<CheckItem[] | null>(null);

  useEffect(() => {
    setChecks([
      { label: "Datos de empresa", done: isEmpresaSaved() },
      { label: "Certificado digital", done: hasCertificate() },
      { label: "CAF Factura (tipo 33)", done: hasCAF(33) },
    ]);
  }, []);

  if (!checks) return null;

  const allDone = checks.every((c) => c.done);
  if (allDone) return null;

  const pending = checks.filter((c) => !c.done).length;

  return (
    <Link href="/configuracion" className="block mb-4 sm:mb-6">
      <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
            Faltan {pending} paso{pending > 1 ? "s" : ""} para emitir facturas
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
            {checks.map((item) => (
              <span key={item.label} className="flex items-center gap-1 text-xs">
                {item.done ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <span className="h-3 w-3 rounded-full border-[1.5px] border-amber-400 inline-block" />
                )}
                <span className={item.done ? "text-muted-foreground line-through" : "text-amber-800 dark:text-amber-300"}>
                  {item.label}
                </span>
              </span>
            ))}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-amber-600 shrink-0" />
      </div>
    </Link>
  );
}
