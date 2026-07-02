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
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
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
  rut: "", razonSocial: "", giro: "", contacto: "", email: "",
  direccion: "", comuna: "", ciudad: "",
};

const defaultItems: ItemDetalle[] = [
  { nombre: "", cantidad: 1, precioUnitario: 0, montoItem: 0 },
];

const needsReferencia: DteTypeCode[] = [56, 61];

export default function FacturasPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando...</div>}>
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
  const [queryResult, setQueryResult] = useState<{ estado: string; glosa: string } | null>(null);

  const loadFromCotizacion = useCallback(() => {
    const from = searchParams.get("from");
    const data = searchParams.get("data");
    if (from === "cotizacion" && data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.receptor) setReceptor(parsed.receptor);
        if (parsed.items) setItems(parsed.items);
      } catch { /* ignore */ }
    }
  }, [searchParams]);

  useEffect(() => { loadFromCotizacion(); }, [loadFromCotizacion]);

  const neto = items.reduce((sum, item) => sum + item.montoItem, 0);
  const isExenta = tipoDte === 34;
  const iva = isExenta ? 0 : Math.round(neto * 0.19);
  const total = neto + iva;

  async function handleSubmit() {
    if (!certPassword) { toast.error("Ingrese la contraseña del certificado"); return; }
    const empresa = getEmpresa();
    if (!empresa?.rut) { toast.error("Configure los datos de la empresa"); return; }
    if (!hasCertificate()) { toast.error("Cargue su certificado digital"); return; }
    if (!hasCAF(tipoDte)) { toast.error(`Cargue el CAF para ${DTE_TYPES[tipoDte]}`); return; }
    const certBase64 = getCertificateBase64();
    const cafXml = getCAFXml(tipoDte);
    const folioResult = consumeFolio(tipoDte);
    if (!folioResult) { toast.error(`Sin folios para ${DTE_TYPES[tipoDte]}`); return; }

    setSending(true);
    try {
      const res = await fetch("/api/dte/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoDte, receptor, items,
          referencias: needsReferencia.includes(tipoDte) ? referencias : undefined,
          folio: folioResult.folio, certBase64, certPassword, cafXml, empresa,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Error al emitir DTE"); return; }
      setResult(data);
      setShowResult(true);
      toast.success(`DTE emitido - Folio ${data.folio}`);
      if (folioResult.remaining <= 5) toast.warning(`Quedan ${folioResult.remaining} folios`);
    } catch { toast.error("Error de conexión"); }
    finally { setSending(false); }
  }

  async function consultarEstado() {
    if (!queryTrackId || !queryPassword) { toast.error("Ingrese TrackID y contraseña"); return; }
    const empresa = getEmpresa();
    if (!empresa) { toast.error("Configure la empresa"); return; }
    const certBase64 = getCertificateBase64();
    if (!certBase64) { toast.error("Cargue su certificado"); return; }

    setQuerying(true);
    try {
      const res = await fetch("/api/dte/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId: queryTrackId, certBase64, certPassword: queryPassword, empresa }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Error"); return; }
      setQueryResult(data);
    } catch { toast.error("Error de conexión"); }
    finally { setQuerying(false); }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[var(--snake-muted)] flex items-center justify-center">
            <Receipt className="h-4 w-4 text-[var(--snake)]" />
          </div>
          Factura Electrónica
        </h1>
        <p className="text-sm text-muted-foreground mt-1 ml-[42px] hidden sm:block">
          Genere, firme y envíe documentos al SII.
        </p>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tipo de Documento</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={String(tipoDte)} onValueChange={(v) => { if (v) setTipoDte(parseInt(v) as DteTypeCode); }}>
            <SelectTrigger className="w-full sm:max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(DTE_TYPES) as [string, string][]).map(([code, name]) => (
                <SelectItem key={code} value={code}>
                  <span className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono shrink-0">{code}</Badge>
                    <span className="truncate">{name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Receptor</CardTitle>
        </CardHeader>
        <CardContent>
          <ReceptorForm receptor={receptor} onChange={setReceptor} showGiro />
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Detalle</CardTitle>
        </CardHeader>
        <CardContent>
          <ItemsTable items={items} onChange={setItems} showDescuento={false} />
        </CardContent>
      </Card>

      {needsReferencia.includes(tipoDte) && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Referencias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReferenciasForm referencias={referencias} onChange={setReferencias} />
          </CardContent>
        </Card>
      )}

      {/* Firma y envío */}
      <Card className="border-[var(--snake)]/20 bg-[var(--snake-muted)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-[var(--snake)] flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Firmar y Enviar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 rounded-xl bg-background/50 border border-border/50">
            <div className="text-center">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Neto</p>
              <p className="text-sm sm:text-lg font-bold tabular-nums">{formatCurrency(neto)}</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">IVA {isExenta ? "Exento" : "19%"}</p>
              <p className="text-sm sm:text-lg font-bold tabular-nums">{formatCurrency(iva)}</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] text-[var(--snake)] uppercase tracking-wider font-medium">Total</p>
              <p className="text-base sm:text-2xl font-bold text-[var(--snake)] tabular-nums">{formatCurrency(total)}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="certPassword" className="text-xs text-muted-foreground">Contraseña del Certificado</Label>
            <Input
              id="certPassword"
              type="password"
              value={certPassword}
              onChange={(e) => setCertPassword(e.target.value)}
              placeholder="Contraseña de su .pfx/.p12"
              className="sm:max-w-sm"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={sending}
            size="lg"
            className="w-full sm:w-auto bg-[var(--snake)] text-[var(--snake-foreground)] hover:bg-[var(--snake)]/90 shadow-[0_0_20px_var(--snake-muted)]"
          >
            <Send className="mr-2 h-4 w-4" />
            {sending ? "Enviando al SII..." : "Firmar y Enviar al SII"}
          </Button>
        </CardContent>
      </Card>

      <Separator className="border-border/30" />

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Search className="h-4 w-4" />
            Consultar Estado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">TrackID</Label>
              <Input value={queryTrackId} onChange={(e) => setQueryTrackId(e.target.value)} placeholder="123456789" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Contraseña</Label>
              <Input type="password" value={queryPassword} onChange={(e) => setQueryPassword(e.target.value)} placeholder="Contraseña .pfx" />
            </div>
          </div>
          <Button variant="outline" onClick={consultarEstado} disabled={querying} className="w-full sm:w-auto">
            <Search className="mr-2 h-4 w-4" />
            {querying ? "Consultando..." : "Consultar"}
          </Button>
          {queryResult && (
            <div className="p-3 rounded-xl border border-border/50 bg-muted/30">
              <div className="flex items-center gap-2">
                {queryResult.estado === "EPR" || queryResult.estado === "DOK" ? (
                  <CheckCircle2 className="h-5 w-5 text-[var(--snake)]" />
                ) : (
                  <Clock className="h-5 w-5 text-amber-500" />
                )}
                <span className="font-bold">{queryResult.estado}</span>
              </div>
              {queryResult.glosa && <p className="text-sm text-muted-foreground mt-1">{queryResult.glosa}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[var(--snake)]" />
              DTE Enviado
            </DialogTitle>
            <DialogDescription>Documento firmado y enviado al SII correctamente.</DialogDescription>
          </DialogHeader>
          {result && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Tipo:</span>
                <span>{DTE_TYPES[result.tipoDte]}</span>
                <span className="text-muted-foreground">Folio:</span>
                <span className="font-mono">{result.folio}</span>
                <span className="text-muted-foreground">TrackID:</span>
                <span className="font-mono break-all text-[var(--snake)]">{result.trackId}</span>
                <span className="text-muted-foreground">Estado:</span>
                <Badge className="bg-[var(--snake-muted)] text-[var(--snake)] w-fit">{result.estado}</Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
