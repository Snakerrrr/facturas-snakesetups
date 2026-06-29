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
      toast.error("Ingrese al menos RUT y Razón Social para guardar");
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
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-2">
            <Label>Cargar cliente guardado</Label>
            <Select value="" onValueChange={(v) => { if (v) loadCliente(v); }}>
              <SelectTrigger>
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
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rut-receptor">RUT</Label>
          <Input id="rut-receptor" value={receptor.rut} onChange={(e) => update("rut", e.target.value)} placeholder="12.345.678-9" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="razon-social-receptor">Razón Social</Label>
          <Input id="razon-social-receptor" value={receptor.razonSocial} onChange={(e) => update("razonSocial", e.target.value)} placeholder="Empresa Ejemplo SpA" />
        </div>
        {showGiro && (
          <div className="space-y-2">
            <Label htmlFor="giro-receptor">Giro</Label>
            <Input id="giro-receptor" value={receptor.giro || ""} onChange={(e) => update("giro", e.target.value)} placeholder="Actividad económica" />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="contacto-receptor">Contacto</Label>
          <Input id="contacto-receptor" value={receptor.contacto || ""} onChange={(e) => update("contacto", e.target.value)} placeholder="Nombre de contacto" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email-receptor">Email</Label>
          <Input id="email-receptor" type="email" value={receptor.email || ""} onChange={(e) => update("email", e.target.value)} placeholder="contacto@ejemplo.cl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="direccion-receptor">Dirección</Label>
          <Input id="direccion-receptor" value={receptor.direccion || ""} onChange={(e) => update("direccion", e.target.value)} placeholder="Av. Ejemplo 1234" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="comuna-receptor">Comuna</Label>
          <Input id="comuna-receptor" value={receptor.comuna || ""} onChange={(e) => update("comuna", e.target.value)} placeholder="Providencia" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ciudad-receptor">Ciudad</Label>
          <Input id="ciudad-receptor" value={receptor.ciudad || ""} onChange={(e) => update("ciudad", e.target.value)} placeholder="Santiago" />
        </div>
      </div>

      {receptor.rut && receptor.razonSocial && (
        <Button type="button" variant="outline" size="sm" onClick={guardarCliente}>
          {clientes.some((c) => c.rut === receptor.rut) ? (
            <><Save className="mr-2 h-4 w-4" />Actualizar Cliente</>
          ) : (
            <><UserPlus className="mr-2 h-4 w-4" />Guardar Cliente</>
          )}
        </Button>
      )}
    </div>
  );
}
