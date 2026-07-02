"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Receipt,
  Clock,
  FolderOpen,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  getHistorial,
  type HistorialItem,
  getFolioState,
  hasCertificate,
  isEmpresaSaved,
  hasCAF,
} from "@/lib/client-storage";
import { DTE_TYPES, type DteTypeCode } from "@/lib/types";

export default function DashboardPage() {
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [foliosDisponibles, setFoliosDisponibles] = useState<
    { tipo: string; disponibles: number }[]
  >([]);
  const [configStatus, setConfigStatus] = useState({
    empresa: false,
    cert: false,
    caf: false,
  });

  useEffect(() => {
    setHistorial(getHistorial());
    setConfigStatus({
      empresa: isEmpresaSaved(),
      cert: hasCertificate(),
      caf: hasCAF(33),
    });

    const folios: { tipo: string; disponibles: number }[] = [];
    for (const code of Object.keys(DTE_TYPES)) {
      const state = getFolioState(parseInt(code) as DteTypeCode);
      if (state) {
        folios.push({
          tipo: DTE_TYPES[parseInt(code) as DteTypeCode],
          disponibles: state.maximo - state.siguiente + 1,
        });
      }
    }
    setFoliosDisponibles(folios);
  }, []);

  const cotizaciones = historial.filter((h) => h.tipo === "cotizacion");
  const facturas = historial.filter((h) => h.tipo === "factura");
  const thisMonth = historial.filter((h) => {
    const d = new Date(h.fecha);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalMes = thisMonth.reduce((s, h) => s + h.montoTotal, 0);

  const allConfigured = configStatus.empresa && configStatus.cert && configStatus.caf;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[var(--snake-muted)] flex items-center justify-center">
            <Zap className="h-4 w-4 text-[var(--snake)]" />
          </div>
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1 ml-[42px] hidden sm:block">
          Resumen de actividad y accesos rápidos.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/cotizaciones" className="group">
          <Card className="border-border/50 hover:border-[var(--snake)]/30 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="h-10 w-10 rounded-xl bg-[var(--snake-muted)] flex items-center justify-center shrink-0 group-hover:shadow-[0_0_12px_var(--snake-muted)] transition-shadow">
                <FileText className="h-5 w-5 text-[var(--snake)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">Nueva Cotización</p>
                <p className="text-xs text-muted-foreground">Armar y descargar PDF</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[var(--snake)] transition-colors" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/facturas" className="group">
          <Card className="border-border/50 hover:border-[var(--snake)]/30 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="h-10 w-10 rounded-xl bg-[var(--snake-muted)] flex items-center justify-center shrink-0 group-hover:shadow-[0_0_12px_var(--snake-muted)] transition-shadow">
                <Receipt className="h-5 w-5 text-[var(--snake)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">Nueva Factura</p>
                <p className="text-xs text-muted-foreground">Firmar y enviar al SII</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[var(--snake)] transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Cotizaciones</p>
            <p className="text-2xl font-bold mt-1">{cotizaciones.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Facturas</p>
            <p className="text-2xl font-bold mt-1">{facturas.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Este Mes</p>
            <p className="text-2xl font-bold mt-1">{thisMonth.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Total Mes</p>
            <p className="text-lg font-bold mt-1 text-[var(--snake)] tabular-nums">{formatCurrency(totalMes)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Folios + Config */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {foliosDisponibles.length > 0 && (
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />Folios Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {foliosDisponibles.map((f) => (
                <div key={f.tipo} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate">{f.tipo}</span>
                  <Badge variant={f.disponibles <= 10 ? "destructive" : "secondary"} className="tabular-nums">
                    {f.disponibles}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {!allConfigured && (
          <Link href="/configuracion">
            <Card className="border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors cursor-pointer h-full">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-medium text-amber-500">Configuración pendiente</p>
                <div className="space-y-1.5">
                  {!configStatus.empresa && <p className="text-xs text-muted-foreground">- Guardar datos de empresa</p>}
                  {!configStatus.cert && <p className="text-xs text-muted-foreground">- Cargar certificado digital</p>}
                  {!configStatus.caf && <p className="text-xs text-muted-foreground">- Cargar CAF tipo 33</p>}
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {/* Recent history */}
      {historial.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />Últimos Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {historial.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  {item.tipo === "cotizacion" ? (
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <Receipt className="h-4 w-4 text-[var(--snake)] shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.clienteNombre || "Sin nombre"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.fecha).toLocaleDateString("es-CL")}
                      {item.folio && ` - Folio ${item.folio}`}
                    </p>
                  </div>
                  <span className="text-sm font-medium tabular-nums shrink-0">
                    {formatCurrency(item.montoTotal)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
