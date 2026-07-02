"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Receipt,
  TrendingUp,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { formatCurrency } from "@/lib/utils";
import { getHistorial, type HistorialItem } from "@/lib/client-storage";
import { DTE_TYPES, type DteTypeCode } from "@/lib/types";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function ResumenPage() {
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    setHistorial(getHistorial());
  }, []);

  const facturasMes = useMemo(() => {
    return historial.filter((h) => {
      if (h.tipo !== "factura") return false;
      const d = new Date(h.fecha);
      return d.getMonth() === month && d.getFullYear() === year;
    });
  }, [historial, month, year]);

  const totals = useMemo(() => {
    const montoTotal = facturasMes.reduce((s, h) => s + h.montoTotal, 0);
    const neto = Math.round(montoTotal / 1.19);
    const iva = montoTotal - neto;
    return { neto, iva, total: montoTotal };
  }, [facturasMes]);

  const breakdown = useMemo(() => {
    const map = new Map<number, { label: string; count: number; total: number }>();
    for (const item of facturasMes) {
      const code = item.tipoDte ?? 33;
      const existing = map.get(code);
      if (existing) {
        existing.count++;
        existing.total += item.montoTotal;
      } else {
        map.set(code, {
          label: DTE_TYPES[code as DteTypeCode] ?? `Tipo ${code}`,
          count: 1,
          total: item.montoTotal,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [facturasMes]);

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  const isCurrentMonth =
    month === now.getMonth() && year === now.getFullYear();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[var(--snake-muted)] flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-[var(--snake)]" />
          </div>
          Resumen Tributario
        </h1>
        <p className="text-sm text-muted-foreground mt-1 ml-[42px] hidden sm:block">
          Totales mensuales de facturación para el SII.
        </p>
      </div>

      {/* Month selector */}
      <Card className="border-border/50">
        <CardContent className="p-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <p className="font-semibold">
              {MONTHS[month]} {year}
            </p>
            {isCurrentMonth && (
              <p className="text-[11px] text-[var(--snake)]">Mes actual</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            disabled={isCurrentMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {facturasMes.length === 0 ? (
        <Card className="border-border/50">
          <CardContent>
            <EmptyState
              icon={Inbox}
              title="Sin facturas"
              description={`No hay facturas registradas en ${MONTHS[month]} ${year}.`}
              actionLabel="Emitir Factura"
              actionHref="/facturas"
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="border-border/50">
              <CardContent className="p-4">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Total Neto
                </p>
                <p className="text-2xl font-bold mt-1 tabular-nums">
                  {formatCurrency(totals.neto)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Total IVA (19%)
                </p>
                <p className="text-2xl font-bold mt-1 tabular-nums">
                  {formatCurrency(totals.iva)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-[var(--snake)]/20 bg-[var(--snake-muted)]">
              <CardContent className="p-4">
                <p className="text-[11px] uppercase tracking-wider text-[var(--snake)] font-medium">
                  Total Facturado
                </p>
                <p className="text-2xl font-bold mt-1 text-[var(--snake)] tabular-nums">
                  {formatCurrency(totals.total)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Desglose por Tipo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {breakdown.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Receipt className="h-4 w-4 text-[var(--snake)] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.count} documento{item.count !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium tabular-nums shrink-0">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Summary footer */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="tabular-nums">
                    {facturasMes.length}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    factura{facturasMes.length !== 1 ? "s" : ""} en{" "}
                    {MONTHS[month]}
                  </span>
                </div>
                <p className="text-sm font-medium text-[var(--snake)] tabular-nums">
                  {formatCurrency(totals.total)}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
