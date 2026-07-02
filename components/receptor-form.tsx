"use client";

import { useEffect, useState } from "react";
import { Save, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RutInput } from "@/components/rut-input";
import { getClientes, saveCliente } from "@/lib/client-storage";
import type { Receptor, ClienteGuardado } from "@/lib/types";

interface ReceptorFormProps {
  receptor: Receptor;
  onChange: (receptor: Receptor) => void;
  showGiro?: boolean;
}

export function ReceptorForm({
  receptor,
  onChange,
  showGiro = false,
}: ReceptorFormProps) {
  const [clientes, setClientes] = useState<ClienteGuardado[]>([]);

  useEffect(() => {
    setClientes(getClientes());
  }, []);

  function update(field: keyof Receptor, value: string) {
    onChange({ ...receptor, [field]: value });
  }

  function loadCliente(clienteId: string) {
    const cliente = clientes.find((c) => c.id === clienteId);
    if (!cliente) return;
    onChange({
      rut: cliente.rut,
      razonSocial: cliente.razonSocial,
      giro: cliente.giro,
      direccion: cliente.direccion,
      comuna: cliente.comuna,
      ciudad: cliente.ciudad,
      contacto: cliente.contacto,
      email: cliente.email,
    });
  }

  function guardarCliente() {
    if (!receptor.rut || !receptor.razonSocial) {
      toast.error("Ingrese al menos RUT y Razón Social");
      return;
    }
    const existing = clientes.find((c) => c.rut === receptor.rut);
    const cliente: ClienteGuardado = {
      id: existing?.id ?? crypto.randomUUID(),
      ...receptor,
      rut: receptor.rut,
      razonSocial: receptor.razonSocial,
    };
    saveCliente(cliente);
    setClientes(getClientes());
    toast.success(`Cliente ${receptor.razonSocial} guardado`);
  }

  return (
    <div className="space-y-4">
      {clientes.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Cliente guardado</Label>
          <Select value="" onValueChange={(v) => { if (v) loadCliente(v); }}>
            <SelectTrigger className="sm:max-w-sm">
              <SelectValue placeholder="Seleccionar cliente..." />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.razonSocial} ({c.rut})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="rut-receptor" className="text-xs text-muted-foreground">RUT</Label>
          <RutInput
            id="rut-receptor"
            value={receptor.rut}
            onChange={(v) => update("rut", v)}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-1 lg:col-span-2">
          <Label htmlFor="razon-social-receptor" className="text-xs text-muted-foreground">Razón Social</Label>
          <Input id="razon-social-receptor" value={receptor.razonSocial} onChange={(e) => update("razonSocial", e.target.value)} placeholder="Empresa Ejemplo SpA" />
        </div>
        {showGiro && (
          <div className="space-y-1.5">
            <Label htmlFor="giro-receptor" className="text-xs text-muted-foreground">Giro</Label>
            <Input id="giro-receptor" value={receptor.giro || ""} onChange={(e) => update("giro", e.target.value)} placeholder="Actividad económica" />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="contacto-receptor" className="text-xs text-muted-foreground">Contacto</Label>
          <Input id="contacto-receptor" value={receptor.contacto || ""} onChange={(e) => update("contacto", e.target.value)} placeholder="Nombre de contacto" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email-receptor" className="text-xs text-muted-foreground">Email</Label>
          <Input id="email-receptor" type="email" value={receptor.email || ""} onChange={(e) => update("email", e.target.value)} placeholder="contacto@ejemplo.cl" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="direccion-receptor" className="text-xs text-muted-foreground">Dirección</Label>
          <Input id="direccion-receptor" value={receptor.direccion || ""} onChange={(e) => update("direccion", e.target.value)} placeholder="Av. Ejemplo 1234" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="comuna-receptor" className="text-xs text-muted-foreground">Comuna</Label>
          <Input id="comuna-receptor" value={receptor.comuna || ""} onChange={(e) => update("comuna", e.target.value)} placeholder="Providencia" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ciudad-receptor" className="text-xs text-muted-foreground">Ciudad</Label>
          <Input id="ciudad-receptor" value={receptor.ciudad || ""} onChange={(e) => update("ciudad", e.target.value)} placeholder="Santiago" />
        </div>
      </div>

      {receptor.rut && receptor.razonSocial && (
        <Button type="button" variant="outline" size="sm" onClick={guardarCliente} className="gap-1.5">
          {clientes.some((c) => c.rut === receptor.rut) ? (
            <><Save className="h-3.5 w-3.5" />Actualizar</>
          ) : (
            <><UserPlus className="h-3.5 w-3.5" />Guardar Cliente</>
          )}
        </Button>
      )}
    </div>
  );
}
