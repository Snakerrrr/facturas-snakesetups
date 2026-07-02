"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, ArrowRight, FileText, RotateCcw, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ItemsTable } from "@/components/items-table";
import { ReceptorForm } from "@/components/receptor-form";
import type { Receptor, ItemDetalle } from "@/lib/types";
import {
  getEmpresa,
  getLogo,
  saveDraft,
  getDraft,
  clearDraft,
  addHistorial,
} from "@/lib/client-storage";

const emptyReceptor: Receptor = {
  rut: "", razonSocial: "", contacto: "", email: "",
  direccion: "", comuna: "", ciudad: "",
};

const defaultItems: ItemDetalle[] = [
  { nombre: "", cantidad: 1, precioUnitario: 0, montoItem: 0 },
];

interface CotizDraft {
  receptor: Receptor;
  items: ItemDetalle[];
  observaciones: string;
  diasValidez: number;
}

export default function CotizacionesPage() {
  const router = useRouter();
  const [receptor, setReceptor] = useState<Receptor>(emptyReceptor);
  const [items, setItems] = useState<ItemDetalle[]>(defaultItems);
  const [observaciones, setObservaciones] = useState("");
  const [diasValidez, setDiasValidez] = useState(30);
  const [generating, setGenerating] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    const draft = getDraft<CotizDraft>("cotizacion");
    if (draft && (draft.receptor.rut || draft.items.some((i) => i.nombre))) {
      setHasDraft(true);
      setReceptor(draft.receptor);
      setItems(draft.items);
      setObservaciones(draft.observaciones);
      setDiasValidez(draft.diasValidez);
    }
    initialized.current = true;
  }, []);

  useEffect(() => {
    if (!initialized.current) return;
    const timer = setTimeout(() => {
      saveDraft("cotizacion", { receptor, items, observaciones, diasValidez });
    }, 500);
    return () => clearTimeout(timer);
  }, [receptor, items, observaciones, diasValidez]);

  function resetForm() {
    setReceptor(emptyReceptor);
    setItems(defaultItems);
    setObservaciones("");
    setDiasValidez(30);
    clearDraft("cotizacion");
    setHasDraft(false);
    toast.success("Formulario limpiado");
  }

  async function generatePdfBlob(): Promise<Blob | null> {
    const empresa = getEmpresa();
    if (!empresa?.rut) {
      toast.error("Configure los datos de la empresa primero");
      return null;
    }
    const res = await fetch("/api/cotizacion/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receptor, items, observaciones, diasValidez, empresa,
        logoDataUrl: getLogo(),
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "Error al generar PDF");
      return null;
    }
    return await res.blob();
  }

  async function previewPdf() {
    setPreviewing(true);
    try {
      const blob = await generatePdfBlob();
      if (!blob) return;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch {
      toast.error("Error de conexión");
    } finally {
      setPreviewing(false);
    }
  }

  function closePreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }

  async function downloadPdf() {
    setGenerating(true);
    try {
      const blob = await generatePdfBlob();
      if (!blob) return;

      const neto = items.reduce((s, i) => s + i.montoItem, 0);
      addHistorial({
        id: crypto.randomUUID(),
        tipo: "cotizacion",
        clienteRut: receptor.rut,
        clienteNombre: receptor.razonSocial,
        montoTotal: neto + Math.round(neto * 0.19),
        fecha: new Date().toISOString(),
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cotizacion-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("PDF descargado");
      clearDraft("cotizacion");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setGenerating(false);
    }
  }

  function convertirAFactura() {
    const params = new URLSearchParams({
      from: "cotizacion",
      data: JSON.stringify({ receptor, items }),
    });
    clearDraft("cotizacion");
    router.push(`/facturas?${params.toString()}`);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[var(--snake-muted)] flex items-center justify-center">
              <FileText className="h-4 w-4 text-[var(--snake)]" />
            </div>
            Nueva Cotización
          </h1>
          {hasDraft && (
            <p className="text-xs text-[var(--snake)] mt-1 ml-[42px]">
              Borrador recuperado automáticamente
            </p>
          )}
        </div>
        <div className="hidden sm:flex gap-2">
          <Button variant="ghost" size="sm" onClick={resetForm} className="text-muted-foreground">
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />Limpiar
          </Button>
          <Button variant="outline" size="sm" onClick={convertirAFactura} disabled={items.every((i) => !i.nombre)}>
            <ArrowRight className="mr-1.5 h-3.5 w-3.5" />A Factura
          </Button>
          <Button variant="outline" size="sm" onClick={previewPdf} disabled={previewing}>
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            {previewing ? "Cargando..." : "Vista Previa"}
          </Button>
          <Button
            size="sm"
            onClick={downloadPdf}
            disabled={generating}
            className="bg-[var(--snake)] text-[var(--snake-foreground)] hover:bg-[var(--snake)]/90 shadow-[0_0_16px_var(--snake-muted)]"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            {generating ? "Generando..." : "Descargar PDF"}
          </Button>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <ReceptorForm receptor={receptor} onChange={setReceptor} />
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Detalle de Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ItemsTable items={items} onChange={setItems} showDescuento />
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Adicional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="diasValidez" className="text-xs text-muted-foreground">Validez (días)</Label>
              <Input id="diasValidez" type="number" value={diasValidez} onChange={(e) => setDiasValidez(parseInt(e.target.value) || 30)} min={1} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="observaciones" className="text-xs text-muted-foreground">Observaciones</Label>
              <Textarea id="observaciones" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Condiciones de pago, notas adicionales..." rows={2} className="resize-none" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile actions */}
      <div className="sm:hidden sticky bottom-16 z-40 -mx-4 px-4 py-3 bg-background/90 backdrop-blur-md border-t border-border/50">
        <div className="flex gap-2">
          <Button variant="outline" onClick={previewPdf} disabled={previewing} className="flex-1">
            <Eye className="mr-1.5 h-4 w-4" />Preview
          </Button>
          <Button onClick={downloadPdf} disabled={generating} className="flex-1 bg-[var(--snake)] text-[var(--snake-foreground)] hover:bg-[var(--snake)]/90">
            <Download className="mr-1.5 h-4 w-4" />{generating ? "..." : "PDF"}
          </Button>
        </div>
      </div>

      {/* PDF Preview modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/50 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <h3 className="font-semibold text-sm">Vista Previa - Cotización</h3>
              <div className="flex gap-2">
                <Button size="sm" onClick={downloadPdf} disabled={generating} className="bg-[var(--snake)] text-[var(--snake-foreground)] hover:bg-[var(--snake)]/90">
                  <Download className="mr-1.5 h-3.5 w-3.5" />Descargar
                </Button>
                <Button variant="ghost" size="icon" onClick={closePreview} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <iframe src={previewUrl} className="flex-1 w-full bg-white" title="PDF Preview" />
          </div>
        </div>
      )}
    </div>
  );
}
