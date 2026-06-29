"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DTE_TYPES, type Referencia, type DteTypeCode } from "@/lib/types";

interface ReferenciasFormProps {
  referencias: Referencia[];
  onChange: (refs: Referencia[]) => void;
}

const COD_REF_OPTIONS = [
  { value: "1", label: "1 - Anula documento de referencia" },
  { value: "2", label: "2 - Corrige texto del documento de referencia" },
  { value: "3", label: "3 - Corrige monto del documento de referencia" },
];

const emptyRef: Referencia = {
  tipoDocRef: 33 as DteTypeCode,
  folioRef: 0,
  fechaRef: "",
  codRef: 1,
  razonRef: "",
};

export function ReferenciasForm({
  referencias,
  onChange,
}: ReferenciasFormProps) {
  function addRef() {
    onChange([...referencias, { ...emptyRef }]);
  }

  function removeRef(index: number) {
    onChange(referencias.filter((_, i) => i !== index));
  }

  function updateRef(index: number, field: keyof Referencia, value: string | number) {
    const updated = referencias.map((ref, i) =>
      i === index ? { ...ref, [field]: value } : ref
    );
    onChange(updated);
  }

  return (
    <div className="space-y-4">
      {referencias.map((ref, index) => (
        <div
          key={index}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-lg border relative"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 text-destructive"
            onClick={() => removeRef(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <div className="space-y-2">
            <Label>Tipo Doc. Referencia</Label>
            <Select
              value={String(ref.tipoDocRef)}
              onValueChange={(v) => {
                if (v) updateRef(index, "tipoDocRef", parseInt(v));
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(DTE_TYPES) as [string, string][]).map(
                  ([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {code} - {name}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Folio Referencia</Label>
            <Input
              type="number"
              value={ref.folioRef || ""}
              onChange={(e) =>
                updateRef(index, "folioRef", parseInt(e.target.value) || 0)
              }
              min={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Fecha Referencia</Label>
            <Input
              type="date"
              value={ref.fechaRef}
              onChange={(e) => updateRef(index, "fechaRef", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Código Referencia</Label>
            <Select
              value={String(ref.codRef)}
              onValueChange={(v) => {
                if (v) updateRef(index, "codRef", parseInt(v));
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COD_REF_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Razón de Referencia</Label>
            <Input
              value={ref.razonRef}
              onChange={(e) => updateRef(index, "razonRef", e.target.value)}
              placeholder="Motivo de la nota de crédito/débito"
            />
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addRef}>
        <Plus className="mr-2 h-4 w-4" />
        Agregar Referencia
      </Button>
    </div>
  );
}
