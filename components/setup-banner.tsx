"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  isEmpresaSaved,
  hasCertificate,
  hasCAF,
} from "@/lib/client-storage";

interface CheckItem {
  label: string;
  done: boolean;
  tab: string;
}

export function SetupBanner() {
  const [checks, setChecks] = useState<CheckItem[] | null>(null);

  useEffect(() => {
    setChecks([
      { label: "Datos de empresa", done: isEmpresaSaved(), tab: "empresa" },
      { label: "Certificado digital (.pfx)", done: hasCertificate(), tab: "certificado" },
      { label: "CAF Factura Electrónica (tipo 33)", done: hasCAF(33), tab: "folios" },
    ]);
  }, []);

  if (!checks) return null;

  const allDone = checks.every((c) => c.done);
  if (allDone) return null;

  const pending = checks.filter((c) => !c.done).length;

  return (
    <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 mb-6">
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <p className="font-medium text-amber-900 dark:text-amber-200">
            Faltan {pending} paso{pending > 1 ? "s" : ""} para emitir facturas
          </p>
          <div className="flex flex-col gap-1">
            {checks.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                {item.done ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-amber-400" />
                )}
                <span className={item.done ? "text-muted-foreground line-through" : "text-amber-800 dark:text-amber-300"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <Link href="/configuracion">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Ir a Configuración
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
