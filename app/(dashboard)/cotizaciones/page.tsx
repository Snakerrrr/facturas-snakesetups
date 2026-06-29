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
import { Separator } from "@/components/ui/separator";
import { ItemsTable } from "@/components/items-table";
import { ReceptorForm } from "@/components/receptor-form";
import type { Receptor, ItemDetalle } from "@/lib/types";
import { getEmpresa } from "@/lib/client-storage";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Nueva Cotización
        </h1>
        <p className="text-muted-foreground">
          Arme su cotización rápidamente y descárguela como PDF.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Cliente</CardTitle>
          <CardDescription>
            Información del destinatario de la cotización.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReceptorForm receptor={receptor} onChange={setReceptor} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalle de Productos / Servicios</CardTitle>
          <CardDescription>
            Agregue los items con sus cantidades y precios. Los totales se
            calculan automáticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ItemsTable items={items} onChange={setItems} showDescuento />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diasValidez">Días de Validez</Label>
              <Input
                id="diasValidez"
                type="number"
                value={diasValidez}
                onChange={(e) => setDiasValidez(parseInt(e.target.value) || 30)}
                min={1}
              />
            </div>
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

      <Separator />

      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button
          variant="outline"
          onClick={convertirAFactura}
          disabled={items.every((i) => !i.nombre)}
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          Convertir a Factura
        </Button>
        <Button onClick={downloadPdf} disabled={generating}>
          <Download className="mr-2 h-4 w-4" />
          {generating ? "Generando..." : "Descargar PDF"}
        </Button>
      </div>
    </div>
  );
}
