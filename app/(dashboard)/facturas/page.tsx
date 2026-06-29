"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Receipt,
  Send,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ItemsTable } from "@/components/items-table";
import { ReceptorForm } from "@/components/receptor-form";
import { ReferenciasForm } from "@/components/referencias-form";
import {
  DTE_TYPES,
  type DteTypeCode,
  type Receptor,
  type ItemDetalle,
  type Referencia,
  type DteResult,
} from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  getEmpresa,
  getCertificateBase64,
  getCAFXml,
  consumeFolio,
  hasCertificate,
  hasCAF,
} from "@/lib/client-storage";

const emptyReceptor: Receptor = {
  rut: "",
  razonSocial: "",
  giro: "",
  contacto: "",
  email: "",
  direccion: "",
  comuna: "",
  ciudad: "",
};

const defaultItems: ItemDetalle[] = [
  { nombre: "", cantidad: 1, precioUnitario: 0, montoItem: 0 },
];

const needsReferencia: DteTypeCode[] = [56, 61];

export default function FacturasPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-muted-foreground">
          Cargando...
        </div>
      }
    >
      <FacturasContent />
    </Suspense>
  );
}

function FacturasContent() {
  const searchParams = useSearchParams();
  const [tipoDte, setTipoDte] = useState<DteTypeCode>(33);
  const [receptor, setReceptor] = useState<Receptor>(emptyReceptor);
  const [items, setItems] = useState<ItemDetalle[]>(defaultItems);
  const [referencias, setReferencias] = useState<Referencia[]>([]);
  const [certPassword, setCertPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<DteResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const [queryTrackId, setQueryTrackId] = useState("");
  const [queryPassword, setQueryPassword] = useState("");
  const [querying, setQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState<{
    estado: string;
    glosa: string;
  } | null>(null);

  const loadFromCotizacion = useCallback(() => {
    const from = searchParams.get("from");
    const data = searchParams.get("data");
    if (from === "cotizacion" && data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.receptor) setReceptor(parsed.receptor);
        if (parsed.items) setItems(parsed.items);
      } catch {
        // ignore
      }
    }
  }, [searchParams]);

  useEffect(() => {
    loadFromCotizacion();
  }, [loadFromCotizacion]);

  const neto = items.reduce((sum, item) => sum + item.montoItem, 0);
  const isExenta = tipoDte === 34;
  const iva = isExenta ? 0 : Math.round(neto * 0.19);
  const total = neto + iva;

  async function handleSubmit() {
    if (!certPassword) {
      toast.error("Ingrese la contraseña del certificado");
      return;
    }

    const empresa = getEmpresa();
    if (!empresa || !empresa.rut) {
      toast.error(
        "Debe configurar los datos de la empresa en Configuración"
      );
      return;
    }

    if (!hasCertificate()) {
      toast.error("Debe cargar su certificado digital en Configuración");
      return;
    }

    if (!hasCAF(tipoDte)) {
      toast.error(
        `Debe cargar el CAF para ${DTE_TYPES[tipoDte]} en Configuración`
      );
      return;
    }

    const certBase64 = getCertificateBase64();
    const cafXml = getCAFXml(tipoDte);
    const folioResult = consumeFolio(tipoDte);

    if (!folioResult) {
      toast.error(
        `No hay folios disponibles para ${DTE_TYPES[tipoDte]}. Cargue un nuevo CAF.`
      );
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/dte/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoDte,
          receptor,
          items,
          referencias: needsReferencia.includes(tipoDte)
            ? referencias
            : undefined,
          folio: folioResult.folio,
          certBase64,
          certPassword,
          cafXml,
          empresa,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al emitir DTE");
        return;
      }

      setResult(data);
      setShowResult(true);
      toast.success(`DTE emitido - Folio ${data.folio}`);

      if (folioResult.remaining <= 5) {
        toast.warning(
          `Quedan solo ${folioResult.remaining} folios para ${DTE_TYPES[tipoDte]}`
        );
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSending(false);
    }
  }

  async function consultarEstado() {
    if (!queryTrackId || !queryPassword) {
      toast.error("Ingrese TrackID y contraseña del certificado");
      return;
    }

    const empresa = getEmpresa();
    if (!empresa) {
      toast.error("Debe configurar los datos de la empresa");
      return;
    }

    const certBase64 = getCertificateBase64();
    if (!certBase64) {
      toast.error("Debe cargar su certificado digital");
      return;
    }

    setQuerying(true);
    try {
      const res = await fetch("/api/dte/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId: queryTrackId,
          certBase64,
          certPassword: queryPassword,
          empresa,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al consultar");
        return;
      }

      setQueryResult(data);
    } catch {
      toast.error("Error de conexión");
    } finally {
      setQuerying(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Receipt className="h-6 w-6" />
          Emisión de Factura Electrónica
        </h1>
        <p className="text-muted-foreground">
          Genere, firme y envíe documentos tributarios al SII.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tipo de Documento</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={String(tipoDte)}
            onValueChange={(v) => {
              if (v) setTipoDte(parseInt(v) as DteTypeCode);
            }}
          >
            <SelectTrigger className="max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(DTE_TYPES) as [string, string][]).map(
                ([code, name]) => (
                  <SelectItem key={code} value={code}>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono">
                        {code}
                      </Badge>
                      {name}
                    </div>
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Receptor</CardTitle>
          <CardDescription>
            Información del cliente o destinatario del documento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReceptorForm receptor={receptor} onChange={setReceptor} showGiro />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalle</CardTitle>
          <CardDescription>
            Items del documento. Los montos se calculan automáticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ItemsTable items={items} onChange={setItems} showDescuento={false} />
        </CardContent>
      </Card>

      {needsReferencia.includes(tipoDte) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Referencias
            </CardTitle>
            <CardDescription>
              Las Notas de Crédito y Débito requieren referencia al documento
              original.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReferenciasForm
              referencias={referencias}
              onChange={setReferencias}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Resumen y Firma</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Neto</p>
              <p className="text-lg font-bold">{formatCurrency(neto)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                IVA {isExenta ? "(Exento)" : "(19%)"}
              </p>
              <p className="text-lg font-bold">{formatCurrency(iva)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{formatCurrency(total)}</p>
            </div>
          </div>

          <Separator />

          <div className="max-w-sm space-y-2">
            <Label htmlFor="certPassword">Contraseña del Certificado</Label>
            <Input
              id="certPassword"
              type="password"
              value={certPassword}
              onChange={(e) => setCertPassword(e.target.value)}
              placeholder="Contraseña de su .pfx/.p12"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={sending}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Send className="mr-2 h-4 w-4" />
            {sending
              ? "Enviando al SII..."
              : "Generar, Firmar y Enviar al SII"}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Consultar Estado de Envío
          </CardTitle>
          <CardDescription>
            Ingrese el TrackID de un envío previo para verificar su estado en el
            SII.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="queryTrackId">TrackID</Label>
              <Input
                id="queryTrackId"
                value={queryTrackId}
                onChange={(e) => setQueryTrackId(e.target.value)}
                placeholder="Ej: 123456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="queryPassword">Contraseña Certificado</Label>
              <Input
                id="queryPassword"
                type="password"
                value={queryPassword}
                onChange={(e) => setQueryPassword(e.target.value)}
                placeholder="Contraseña de su .pfx/.p12"
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={consultarEstado}
            disabled={querying}
          >
            <Search className="mr-2 h-4 w-4" />
            {querying ? "Consultando..." : "Consultar Estado"}
          </Button>

          {queryResult && (
            <div className="mt-4 p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                {queryResult.estado === "EPR" ||
                queryResult.estado === "DOK" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Clock className="h-5 w-5 text-amber-500" />
                )}
                <span className="font-bold">
                  Estado: {queryResult.estado}
                </span>
              </div>
              {queryResult.glosa && (
                <p className="text-sm text-muted-foreground">
                  {queryResult.glosa}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              DTE Enviado al SII
            </DialogTitle>
            <DialogDescription>
              El documento fue generado, firmado y enviado correctamente.
            </DialogDescription>
          </DialogHeader>
          {result && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="font-medium">Tipo:</span>
                <span>{DTE_TYPES[result.tipoDte]}</span>
                <span className="font-medium">Folio:</span>
                <span className="font-mono">{result.folio}</span>
                <span className="font-medium">TrackID:</span>
                <span className="font-mono">{result.trackId}</span>
                <span className="font-medium">Estado:</span>
                <Badge variant="secondary">{result.estado}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Guarde el TrackID para consultar el estado del envío
                posteriormente.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
