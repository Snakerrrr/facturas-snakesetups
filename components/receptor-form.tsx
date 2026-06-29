"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Receptor } from "@/lib/types";

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
  function update(field: keyof Receptor, value: string) {
    onChange({ ...receptor, [field]: value });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="rut-receptor">RUT</Label>
        <Input
          id="rut-receptor"
          value={receptor.rut}
          onChange={(e) => update("rut", e.target.value)}
          placeholder="12.345.678-9"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="razon-social-receptor">Razón Social</Label>
        <Input
          id="razon-social-receptor"
          value={receptor.razonSocial}
          onChange={(e) => update("razonSocial", e.target.value)}
          placeholder="Empresa Ejemplo SpA"
        />
      </div>
      {showGiro && (
        <div className="space-y-2">
          <Label htmlFor="giro-receptor">Giro</Label>
          <Input
            id="giro-receptor"
            value={receptor.giro || ""}
            onChange={(e) => update("giro", e.target.value)}
            placeholder="Actividad económica"
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="contacto-receptor">Contacto</Label>
        <Input
          id="contacto-receptor"
          value={receptor.contacto || ""}
          onChange={(e) => update("contacto", e.target.value)}
          placeholder="Nombre de contacto"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-receptor">Email</Label>
        <Input
          id="email-receptor"
          type="email"
          value={receptor.email || ""}
          onChange={(e) => update("email", e.target.value)}
          placeholder="contacto@ejemplo.cl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="direccion-receptor">Dirección</Label>
        <Input
          id="direccion-receptor"
          value={receptor.direccion || ""}
          onChange={(e) => update("direccion", e.target.value)}
          placeholder="Av. Ejemplo 1234"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="comuna-receptor">Comuna</Label>
        <Input
          id="comuna-receptor"
          value={receptor.comuna || ""}
          onChange={(e) => update("comuna", e.target.value)}
          placeholder="Providencia"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ciudad-receptor">Ciudad</Label>
        <Input
          id="ciudad-receptor"
          value={receptor.ciudad || ""}
          onChange={(e) => update("ciudad", e.target.value)}
          placeholder="Santiago"
        />
      </div>
    </div>
  );
}
