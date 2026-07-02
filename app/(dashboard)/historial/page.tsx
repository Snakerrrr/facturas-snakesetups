"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Search,
  Download,
  Copy,
  MessageCircle,
  FileText,
  Receipt,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/empty-state";
import { formatCurrency } from "@/lib/utils";
import {
  getHistorial,
  historialToCsv,
  type HistorialItem,
} from "@/lib/client-storage";
import { DTE_TYPES, type DteTypeCode } from "@/lib/types";

type FilterTab = "todos" | "cotizacion" | "factura";

export default function HistorialPage() {
  const router = useRouter();
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("todos");

  useEffect(() => {
    setHistorial(getHistorial());
  }, []);

  const filtered = useMemo(() => {
    let items = historial;

    if (filter !== "todos") {
      items = items.filter((h) => h.tipo === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (h) =>
          h.clienteNombre.toLowerCase().includes(q) ||
          h.clienteRut.toLowerCase().includes(q)
      );
    }

    return items;
  }, [historial, search, filter]);

  function exportCsv() {
    const csv = historialToCsv();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historial-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function shareWhatsApp(item: HistorialItem) {
    const tipoLabel = item.tipo === "cotizacion" ? "Cotización" : "Factura";
    const text = `${tipoLabel} para ${item.clienteNombre} por ${formatCurrency(item.montoTotal)}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  }

  function duplicate(item: HistorialItem) {
    const data = JSON.stringify({
      receptor: {
        rut: item.clienteRut,
        razonSocial: item.clienteNombre,
      },
    });
    const route =
      item.tipo === "cotizacion" ? "/cotizaciones" : "/facturas";
    const params = new URLSearchParams({ from: item.tipo, data });
    router.push(`${route}?${params.toString()}`);
  }

  function getTipoLabel(item: HistorialItem): string {
    if (item.tipo === "cotizacion") return "Cotización";
    if (item.tipoDte && DTE_TYPES[item.tipoDte as DteTypeCode]) {
      return DTE_TYPES[item.tipoDte as DteTypeCode];
    }
    return "Factura";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[var(--snake-muted)] flex items-center justify-center">
              <Clock className="h-4 w-4 text-[var(--snake)]" />
            </div>
            Historial
          </h1>
          <p className="text-sm text-muted-foreground mt-1 ml-[42px] hidden sm:block">
            Todos los documentos generados.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exportCsv}
          disabled={historial.length === 0}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Exportar CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o RUT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Tabs
        defaultValue="todos"
        onValueChange={(v) => setFilter(v as FilterTab)}
      >
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="cotizacion">Cotizaciones</TabsTrigger>
          <TabsTrigger value="factura">Facturas</TabsTrigger>
        </TabsList>

        <TabsContent value={filter}>
          {filtered.length === 0 ? (
            <Card className="border-border/50">
              <CardContent>
                <EmptyState
                  icon={Inbox}
                  title="Sin resultados"
                  description={
                    historial.length === 0
                      ? "Aún no ha generado documentos. Cree su primera cotización o factura."
                      : "No se encontraron documentos con los filtros aplicados."
                  }
                  actionLabel={historial.length === 0 ? "Crear Cotización" : undefined}
                  actionHref={historial.length === 0 ? "/cotizaciones" : undefined}
                />
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Desktop table */}
              <Card className="border-border/50 hidden md:block">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Fecha</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Tipo</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Cliente</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Folio</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">Monto</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-muted-foreground">
                            {new Date(item.fecha).toLocaleDateString("es-CL")}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                item.tipo === "factura"
                                  ? "bg-[var(--snake-muted)] text-[var(--snake)]"
                                  : ""
                              }
                            >
                              {item.tipo === "cotizacion" ? "Cotización" : "Factura"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium truncate max-w-[200px]">
                                {item.clienteNombre || "Sin nombre"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.clienteRut}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground">
                            {item.folio ?? item.numero ?? "—"}
                          </TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            {formatCurrency(item.montoTotal)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => shareWhatsApp(item)}
                                title="Compartir por WhatsApp"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => duplicate(item)}
                                title="Duplicar"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Mobile cards */}
              <div className="md:hidden space-y-2">
                {filtered.map((item) => (
                  <Card key={item.id} className="border-border/50">
                    <CardContent className="p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.tipo === "cotizacion" ? (
                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          ) : (
                            <Receipt className="h-4 w-4 text-[var(--snake)] shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.clienteNombre || "Sin nombre"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(item.fecha).toLocaleDateString("es-CL")}
                              {item.folio && ` · Folio ${item.folio}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium tabular-nums">
                            {formatCurrency(item.montoTotal)}
                          </p>
                          <Badge
                            variant="secondary"
                            className={
                              item.tipo === "factura"
                                ? "bg-[var(--snake-muted)] text-[var(--snake)] mt-1"
                                : "mt-1"
                            }
                          >
                            {item.tipo === "cotizacion" ? "Cotiz." : "Factura"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-border/30">
                        <Button
                          variant="ghost"
                          size="xs"
                          className="flex-1 text-muted-foreground"
                          onClick={() => shareWhatsApp(item)}
                        >
                          <MessageCircle className="mr-1 h-3 w-3" />
                          WhatsApp
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          className="flex-1 text-muted-foreground"
                          onClick={() => duplicate(item)}
                        >
                          <Copy className="mr-1 h-3 w-3" />
                          Duplicar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
