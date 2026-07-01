"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ItemsTable } from "@/components/items-table";
import { ReceptorForm } from "@/components/receptor-form";
import type { Receptor, ItemDetalle } from "@/lib/types";
import { getEmpresa, getLogo } from "@/lib/client-storage";

const emptyReceptor: Receptor = {
  rut: "",
  razonSocial: "",
  contacto: "",
  email: "",
  direccion: "",
  comuna: "",
  ciudad: "",
};

const defaultItems: ItemDetalle[] = [
  { nombre: "", cantidad: 1, precioUnitario: 0, montoItem: 0 },
];

export default function CotizacionesPage() {
  const router = useRouter();
  const [receptor, setReceptor] = useState<Receptor>(emptyReceptor);
  const [items, setItems] = useState<ItemDetalle[]>(defaultItems);
  const [observaciones, setObservaciones] = useState("");
  const [diasValidez, setDiasValidez] = useState(30);
  const [generating, setGenerating] = useState(false);

  async function downloadPdf() {
    const empresa = getEmpresa();
    if (!empresa || !empresa.rut) {
      toast.error("Debe configurar los datos de la empresa primero");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/cotizacion/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receptor,
          items,
          observaciones,
          diasValidez,
          empresa,
          logoDataUrl: getLogo(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Error al generar PDF");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cotizacion-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("PDF descargado");
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
    router.push(`/facturas?${params.toString()}`);
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
          Nueva Cotización
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Arme su cotización y descárguela como PDF.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Datos del Cliente</CardTitle>
          <CardDescription className="hidden sm:block">
            Información del destinatario de la cotización.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReceptorForm receptor={receptor} onChange={setReceptor} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Productos / Servicios</CardTitle>
          <CardDescription className="hidden sm:block">
            Agregue los items con sus cantidades y precios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ItemsTable items={items} onChange={setItems} showDescuento />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Información Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="diasValidez">Días de Validez</Label>
            <Input
              id="diasValidez"
              type="number"
              value={diasValidez}
              onChange={(e) => setDiasValidez(parseInt(e.target.value) || 30)}
              min={1}
              className="max-w-[120px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Condiciones de pago, notas adicionales..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions: sticky on mobile */}
      <div className="sticky bottom-16 md:bottom-0 z-40 -mx-4 sm:-mx-6 md:mx-0 px-4 sm:px-6 md:px-0 py-3 md:py-0 bg-background/80 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none border-t md:border-0">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
          <Button
            variant="outline"
            onClick={convertirAFactura}
            disabled={items.every((i) => !i.nombre)}
            className="w-full sm:w-auto"
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Convertir a Factura
          </Button>
          <Button onClick={downloadPdf} disabled={generating} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            {generating ? "Generando..." : "Descargar PDF"}
          </Button>
        </div>
      </div>
    </div>
  );
}
