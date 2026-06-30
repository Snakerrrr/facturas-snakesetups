"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Upload, Check, Trash2, Shield, ShieldCheck, Plus } from "lucide-react";
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
import { DTE_TYPES, type EmpresaConfig, type Producto } from "@/lib/types";
import {
  saveEmpresa,
  getEmpresa,
  saveLogo,
  getLogo,
  deleteLogo,
  saveCertificate,
  getCertificateName,
  hasCertificate,
  deleteCertificate,
  saveCAF,
  getFolioState,
  fileToBase64,
  getProductos,
  saveProducto,
  deleteProducto,
} from "@/lib/client-storage";

export default function ConfiguracionPage() {
  const [empresa, setEmpresa] = useState<EmpresaConfig>(getEmpresa());
  const [certLoaded, setCertLoaded] = useState(false);
  const [certName, setCertName] = useState<string | null>(null);
  const [cafStatus, setCafStatus] = useState<
    Record<string, { siguiente: number; maximo: number } | null>
  >({});
  const [productos, setProductos] = useState<Producto[]>([]);
  const [newProd, setNewProd] = useState({ nombre: "", precio: "" });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    setCertLoaded(hasCertificate());
    setCertName(getCertificateName());
    setProductos(getProductos());
    setLogoPreview(getLogo());

    const statuses: Record<
      string,
      { siguiente: number; maximo: number } | null
    > = {};
    for (const code of Object.keys(DTE_TYPES)) {
      statuses[code] = getFolioState(parseInt(code) as keyof typeof DTE_TYPES);
    }
    setCafStatus(statuses);
  }, []);

  function handleSaveEmpresa() {
    saveEmpresa(empresa);
    toast.success("Datos de empresa guardados");
  }

  async function handleUploadCert(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.match(/\.(pfx|p12)$/i)) {
      toast.error("El archivo debe ser .pfx o .p12");
      return;
    }
    const base64 = await fileToBase64(file);
    saveCertificate(base64, file.name);
    setCertLoaded(true);
    setCertName(file.name);
    toast.success("Certificado guardado");
  }

  function handleDeleteCert() {
    deleteCertificate();
    setCertLoaded(false);
    setCertName(null);
    toast.success("Certificado eliminado");
  }

  async function handleUploadCaf(
    e: React.ChangeEvent<HTMLInputElement>,
    tipoDte: string
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const cafXml = await file.text();
    const folioInicioMatch = cafXml.match(/<D>(\d+)<\/D>/);
    const folioFinMatch = cafXml.match(/<H>(\d+)<\/H>/);
    if (!folioInicioMatch || !folioFinMatch) {
      toast.error("No se pudieron extraer los rangos de folios del CAF");
      return;
    }
    const folioInicio = parseInt(folioInicioMatch[1], 10);
    const folioFin = parseInt(folioFinMatch[1], 10);
    const code = parseInt(tipoDte) as keyof typeof DTE_TYPES;
    saveCAF(code, cafXml, folioInicio, folioFin);
    setCafStatus((prev) => ({
      ...prev,
      [tipoDte]: { siguiente: folioInicio, maximo: folioFin },
    }));
    toast.success(`CAF cargado: folios ${folioInicio} a ${folioFin}`);
  }

  function handleAddProducto() {
    if (!newProd.nombre || !newProd.precio) {
      toast.error("Ingrese nombre y precio del producto");
      return;
    }
    const prod: Producto = {
      id: crypto.randomUUID(),
      nombre: newProd.nombre,
      precioUnitario: parseInt(newProd.precio),
    };
    saveProducto(prod);
    setProductos(getProductos());
    setNewProd({ nombre: "", precio: "" });
    toast.success("Producto agregado al catálogo");
  }

  function handleDeleteProducto(id: string) {
    deleteProducto(id);
    setProductos(getProductos());
    toast.success("Producto eliminado");
  }

  function handleUploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      saveLogo(dataUrl);
      setLogoPreview(dataUrl);
      toast.success("Logo guardado");
    };
    reader.readAsDataURL(file);
  }

  function handleDeleteLogo() {
    deleteLogo();
    setLogoPreview(null);
    toast.success("Logo eliminado");
  }

  function updateEmpresa(field: keyof EmpresaConfig, value: string | number) {
    setEmpresa((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Los datos se guardan localmente en su navegador.
        </p>
      </div>

      <Tabs defaultValue="empresa">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="certificado">Certificado</TabsTrigger>
          <TabsTrigger value="folios">Folios CAF</TabsTrigger>
          <TabsTrigger value="productos">Productos</TabsTrigger>
        </TabsList>

        {/* --- EMPRESA --- */}
        <TabsContent value="empresa" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Datos del Emisor</CardTitle>
              <CardDescription>
                Pre-cargados con los datos de Snake Setups SPA. Ajuste si es necesario.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Logo de la Empresa</Label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <div className="flex items-center gap-4">
                      <img src={logoPreview} alt="Logo" className="h-16 w-16 object-contain rounded-lg border" />
                      <div className="flex gap-2">
                        <label className="cursor-pointer">
                          <Input type="file" accept="image/*" onChange={handleUploadLogo} className="hidden" />
                          <span className="text-sm text-primary hover:underline">Cambiar</span>
                        </label>
                        <button onClick={handleDeleteLogo} className="text-sm text-destructive hover:underline">Eliminar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-lg border-2 border-dashed flex items-center justify-center">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <Input type="file" accept="image/*" onChange={handleUploadLogo} className="max-w-xs" />
                        <p className="text-xs text-muted-foreground mt-1">Aparecerá en el membrete de las cotizaciones PDF</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rut">RUT Empresa</Label>
                  <Input id="rut" value={empresa.rut} onChange={(e) => updateEmpresa("rut", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="razonSocial">Razón Social</Label>
                  <Input id="razonSocial" value={empresa.razonSocial} onChange={(e) => updateEmpresa("razonSocial", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="giro">Giro</Label>
                  <Input id="giro" value={empresa.giro} onChange={(e) => updateEmpresa("giro", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actividadEconomica">Actividad Económica</Label>
                  <Input id="actividadEconomica" type="number" value={empresa.actividadEconomica || ""} onChange={(e) => updateEmpresa("actividadEconomica", parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input id="direccion" value={empresa.direccion} onChange={(e) => updateEmpresa("direccion", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comuna">Comuna</Label>
                  <Input id="comuna" value={empresa.comuna} onChange={(e) => updateEmpresa("comuna", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ciudad">Ciudad</Label>
                  <Input id="ciudad" value={empresa.ciudad} onChange={(e) => updateEmpresa("ciudad", e.target.value)} />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nroResolucion">N° Resolución SII</Label>
                  <Input id="nroResolucion" type="number" value={empresa.nroResolucion || ""} onChange={(e) => updateEmpresa("nroResolucion", parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaResolucion">Fecha Resolución</Label>
                  <Input id="fechaResolucion" type="date" value={empresa.fechaResolucion} onChange={(e) => updateEmpresa("fechaResolucion", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ambiente">Ambiente</Label>
                  <Select value={empresa.ambiente} onValueChange={(v) => { if (v) updateEmpresa("ambiente", v as "certificacion" | "produccion"); }}>
                    <SelectTrigger id="ambiente"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="certificacion"><div className="flex items-center gap-2"><Shield className="h-4 w-4" />Certificación</div></SelectItem>
                      <SelectItem value="produccion"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Producción</div></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSaveEmpresa} className="w-full sm:w-auto">Guardar Datos</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- CERTIFICADO --- */}
        <TabsContent value="certificado" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Certificado Digital</CardTitle>
              <CardDescription>Se guarda en localStorage. La contraseña se solicita al emitir cada factura.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {certLoaded ? (
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
                  <Check className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-green-800 dark:text-green-200">Certificado cargado</p>
                    <p className="text-sm text-green-600 dark:text-green-400">{certName || "cert.pfx"}</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={handleDeleteCert}><Trash2 className="mr-2 h-4 w-4" />Eliminar</Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 p-8 rounded-lg border-2 border-dashed">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <div className="text-center">
                    <p className="font-medium">Subir certificado digital</p>
                    <p className="text-sm text-muted-foreground">Archivo .pfx o .p12</p>
                  </div>
                  <Input type="file" accept=".pfx,.p12" onChange={handleUploadCert} className="max-w-xs" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- FOLIOS CAF --- */}
        <TabsContent value="folios" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Códigos de Autorización de Folios (CAF)</CardTitle>
              <CardDescription>Suba los archivos CAF del SII para cada tipo de documento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(Object.entries(DTE_TYPES) as [string, string][]).map(([code, name]) => {
                const status = cafStatus[code];
                return (
                  <div key={code} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-lg border">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{name}</p>
                        <Badge variant="secondary">Tipo {code}</Badge>
                      </div>
                      {status ? (
                        <p className="text-sm text-muted-foreground mt-1">
                          Folio siguiente: {status.siguiente} | Hasta: {status.maximo} | Disponibles: {status.maximo - status.siguiente + 1}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">Sin CAF cargado</p>
                      )}
                    </div>
                    <div className="shrink-0">
                      <Input type="file" accept=".xml" onChange={(e) => handleUploadCaf(e, code)} className="w-[200px]" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- PRODUCTOS --- */}
        <TabsContent value="productos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Catálogo de Productos</CardTitle>
              <CardDescription>
                Agregue sus productos frecuentes para seleccionarlos rápidamente al crear cotizaciones o facturas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  value={newProd.nombre}
                  onChange={(e) => setNewProd((p) => ({ ...p, nombre: e.target.value }))}
                  placeholder="Nombre del producto"
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={newProd.precio}
                  onChange={(e) => setNewProd((p) => ({ ...p, precio: e.target.value }))}
                  placeholder="Precio neto ($)"
                  className="w-[160px]"
                />
                <Button onClick={handleAddProducto}>
                  <Plus className="mr-2 h-4 w-4" />Agregar
                </Button>
              </div>

              {productos.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No hay productos en el catálogo. Agregue uno arriba.
                </p>
              ) : (
                <div className="space-y-2">
                  {productos.map((prod) => (
                    <div key={prod.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{prod.nombre}</p>
                        <p className="text-sm text-muted-foreground">
                          ${prod.precioUnitario.toLocaleString("es-CL")}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteProducto(prod.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
