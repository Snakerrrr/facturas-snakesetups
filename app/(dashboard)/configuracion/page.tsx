"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Upload, Check, Trash2, Shield, ShieldCheck } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DTE_TYPES, type EmpresaConfig, type DteTypeCode } from "@/lib/types";

const defaultEmpresa: EmpresaConfig = {
  rut: "",
  razonSocial: "",
  giro: "",
  actividadEconomica: 0,
  direccion: "",
  comuna: "",
  ciudad: "",
  nroResolucion: 0,
  fechaResolucion: "",
  ambiente: "certificacion",
};

export default function ConfiguracionPage() {
  const [empresa, setEmpresa] = useState<EmpresaConfig>(defaultEmpresa);
  const [saving, setSaving] = useState(false);
  const [certUploaded, setCertUploaded] = useState(false);
  const [cafStatus, setCafStatus] = useState<Record<string, { siguiente: number; maximo: number } | null>>({});

  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/config/empresa");
      const data = await res.json();
      if (data && data.rut) {
        setEmpresa(data);
      }
    } catch {
      // First time, no config yet
    }
  }, []);

  const loadCafStatus = useCallback(async () => {
    const statuses: Record<string, { siguiente: number; maximo: number } | null> = {};
    for (const code of Object.keys(DTE_TYPES)) {
      try {
        const res = await fetch(`/api/config/caf?tipoDte=${code}`);
        const data = await res.json();
        statuses[code] = data;
      } catch {
        statuses[code] = null;
      }
    }
    setCafStatus(statuses);
  }, []);

  useEffect(() => {
    loadConfig();
    loadCafStatus();
  }, [loadConfig, loadCafStatus]);

  async function saveEmpresa() {
    setSaving(true);
    try {
      const res = await fetch("/api/config/empresa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(empresa),
      });
      if (res.ok) {
        toast.success("Datos de empresa guardados");
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al guardar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  async function uploadCert(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("certificate", file);

    try {
      const res = await fetch("/api/config/certificate", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setCertUploaded(true);
        toast.success("Certificado subido correctamente");
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al subir certificado");
      }
    } catch {
      toast.error("Error de conexión");
    }
  }

  async function deleteCert() {
    try {
      const res = await fetch("/api/config/certificate", { method: "DELETE" });
      if (res.ok) {
        setCertUploaded(false);
        toast.success("Certificado eliminado");
      }
    } catch {
      toast.error("Error al eliminar certificado");
    }
  }

  async function uploadCaf(
    e: React.ChangeEvent<HTMLInputElement>,
    tipoDte: string
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("caf", file);
    formData.append("tipoDte", tipoDte);

    try {
      const res = await fetch("/api/config/caf", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(
          `CAF cargado: folios ${data.folioInicio} a ${data.folioFin}`
        );
        loadCafStatus();
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al subir CAF");
      }
    } catch {
      toast.error("Error de conexión");
    }
  }

  function updateEmpresa(field: keyof EmpresaConfig, value: string | number) {
    setEmpresa((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Configure los datos de su empresa, certificado digital y folios CAF.
        </p>
      </div>

      <Tabs defaultValue="empresa">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="certificado">Certificado</TabsTrigger>
          <TabsTrigger value="folios">Folios CAF</TabsTrigger>
        </TabsList>

        <TabsContent value="empresa" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Datos del Emisor</CardTitle>
              <CardDescription>
                Información de la empresa que aparecerá en los documentos
                tributarios.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rut">RUT Empresa</Label>
                  <Input
                    id="rut"
                    value={empresa.rut}
                    onChange={(e) => updateEmpresa("rut", e.target.value)}
                    placeholder="76.123.456-7"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="razonSocial">Razón Social</Label>
                  <Input
                    id="razonSocial"
                    value={empresa.razonSocial}
                    onChange={(e) =>
                      updateEmpresa("razonSocial", e.target.value)
                    }
                    placeholder="Mi Empresa SpA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="giro">Giro</Label>
                  <Input
                    id="giro"
                    value={empresa.giro}
                    onChange={(e) => updateEmpresa("giro", e.target.value)}
                    placeholder="Desarrollo de Software"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actividadEconomica">
                    Actividad Económica (Código)
                  </Label>
                  <Input
                    id="actividadEconomica"
                    type="number"
                    value={empresa.actividadEconomica || ""}
                    onChange={(e) =>
                      updateEmpresa(
                        "actividadEconomica",
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="620200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={empresa.direccion}
                    onChange={(e) => updateEmpresa("direccion", e.target.value)}
                    placeholder="Av. Providencia 1234"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comuna">Comuna</Label>
                  <Input
                    id="comuna"
                    value={empresa.comuna}
                    onChange={(e) => updateEmpresa("comuna", e.target.value)}
                    placeholder="Providencia"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ciudad">Ciudad</Label>
                  <Input
                    id="ciudad"
                    value={empresa.ciudad}
                    onChange={(e) => updateEmpresa("ciudad", e.target.value)}
                    placeholder="Santiago"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nroResolucion">N° Resolución SII</Label>
                  <Input
                    id="nroResolucion"
                    type="number"
                    value={empresa.nroResolucion || ""}
                    onChange={(e) =>
                      updateEmpresa(
                        "nroResolucion",
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaResolucion">Fecha Resolución</Label>
                  <Input
                    id="fechaResolucion"
                    type="date"
                    value={empresa.fechaResolucion}
                    onChange={(e) =>
                      updateEmpresa("fechaResolucion", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ambiente">Ambiente</Label>
                  <Select
                    value={empresa.ambiente}
                    onValueChange={(v) => {
                      if (v) updateEmpresa("ambiente", v as "certificacion" | "produccion");
                    }}
                  >
                    <SelectTrigger id="ambiente">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="certificacion">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Certificación
                        </div>
                      </SelectItem>
                      <SelectItem value="produccion">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4" />
                          Producción
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={saveEmpresa} disabled={saving} className="w-full sm:w-auto">
                {saving ? "Guardando..." : "Guardar Datos"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificado" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Certificado Digital</CardTitle>
              <CardDescription>
                Suba su certificado .pfx/.p12 del SII. Se almacena encriptado
                con AES-256. La contraseña se solicita al emitir cada factura.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {certUploaded ? (
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
                  <Check className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Certificado cargado
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Almacenado de forma segura con encriptación AES-256
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={deleteCert}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 p-8 rounded-lg border-2 border-dashed">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <div className="text-center">
                    <p className="font-medium">Subir certificado digital</p>
                    <p className="text-sm text-muted-foreground">
                      Archivo .pfx o .p12
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept=".pfx,.p12"
                    onChange={uploadCert}
                    className="max-w-xs"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="folios" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Códigos de Autorización de Folios (CAF)</CardTitle>
              <CardDescription>
                Suba los archivos CAF obtenidos del SII para cada tipo de
                documento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(Object.entries(DTE_TYPES) as [string, string][]).map(
                ([code, name]) => {
                  const status = cafStatus[code];
                  return (
                    <div
                      key={code}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-lg border"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{name}</p>
                          <Badge variant="secondary">Tipo {code}</Badge>
                        </div>
                        {status && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Folio siguiente: {status.siguiente} | Hasta:{" "}
                            {status.maximo} | Disponibles:{" "}
                            {status.maximo - status.siguiente + 1}
                          </p>
                        )}
                        {!status && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Sin CAF cargado
                          </p>
                        )}
                      </div>
                      <div className="shrink-0">
                        <Input
                          type="file"
                          accept=".xml"
                          onChange={(e) => uploadCaf(e, code)}
                          className="w-[200px]"
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
