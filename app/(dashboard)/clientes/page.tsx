"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  UserPlus,
  Inbox,
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
import { RutInput } from "@/components/rut-input";
import { EmptyState } from "@/components/empty-state";
import {
  getClientes,
  saveCliente,
  deleteCliente,
} from "@/lib/client-storage";
import type { ClienteGuardado } from "@/lib/types";

const emptyCliente: Omit<ClienteGuardado, "id"> = {
  rut: "",
  razonSocial: "",
  giro: "",
  direccion: "",
  comuna: "",
  email: "",
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<ClienteGuardado[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ClienteGuardado, "id">>(emptyCliente);

  useEffect(() => {
    setClientes(getClientes());
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return clientes;
    const q = search.toLowerCase();
    return clientes.filter(
      (c) =>
        c.razonSocial.toLowerCase().includes(q) ||
        c.rut.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [clientes, search]);

  function handleSave() {
    if (!form.rut || !form.razonSocial) return;

    const cliente: ClienteGuardado = {
      ...form,
      id: editingId ?? crypto.randomUUID(),
    };
    saveCliente(cliente);
    setClientes(getClientes());
    resetForm();
  }

  function handleEdit(cliente: ClienteGuardado) {
    setEditingId(cliente.id);
    setForm({
      rut: cliente.rut,
      razonSocial: cliente.razonSocial,
      giro: cliente.giro ?? "",
      direccion: cliente.direccion ?? "",
      comuna: cliente.comuna ?? "",
      email: cliente.email ?? "",
    });
    setShowForm(true);
  }

  function handleDelete(id: string) {
    if (!window.confirm("¿Eliminar este cliente?")) return;
    deleteCliente(id);
    setClientes(getClientes());
  }

  function resetForm() {
    setForm(emptyCliente);
    setEditingId(null);
    setShowForm(false);
  }

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[var(--snake-muted)] flex items-center justify-center">
              <Users className="h-4 w-4 text-[var(--snake)]" />
            </div>
            Clientes
          </h1>
          <p className="text-sm text-muted-foreground mt-1 ml-[42px] hidden sm:block">
            Gestione su cartera de clientes.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-[var(--snake)] text-[var(--snake-foreground)] hover:bg-[var(--snake)]/90"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Agregar Cliente
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-[var(--snake)]/20 bg-[var(--snake-muted)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-[var(--snake)] flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                {editingId ? "Editar Cliente" : "Nuevo Cliente"}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={resetForm}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="rut" className="text-xs text-muted-foreground">
                  RUT
                </Label>
                <RutInput
                  id="rut"
                  value={form.rut}
                  onChange={(v) => updateField("rut", v)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="razon" className="text-xs text-muted-foreground">
                  Razón Social
                </Label>
                <Input
                  id="razon"
                  value={form.razonSocial}
                  onChange={(e) => updateField("razonSocial", e.target.value)}
                  placeholder="Nombre o razón social"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="giro" className="text-xs text-muted-foreground">
                  Giro
                </Label>
                <Input
                  id="giro"
                  value={form.giro}
                  onChange={(e) => updateField("giro", e.target.value)}
                  placeholder="Actividad comercial"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="contacto@empresa.cl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="direccion" className="text-xs text-muted-foreground">
                  Dirección
                </Label>
                <Input
                  id="direccion"
                  value={form.direccion}
                  onChange={(e) => updateField("direccion", e.target.value)}
                  placeholder="Dirección completa"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="comuna" className="text-xs text-muted-foreground">
                  Comuna
                </Label>
                <Input
                  id="comuna"
                  value={form.comuna}
                  onChange={(e) => updateField("comuna", e.target.value)}
                  placeholder="Comuna"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={resetForm}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!form.rut || !form.razonSocial}
                className="bg-[var(--snake)] text-[var(--snake-foreground)] hover:bg-[var(--snake)]/90"
              >
                <Check className="mr-1.5 h-3.5 w-3.5" />
                {editingId ? "Guardar Cambios" : "Agregar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      {clientes.length > 0 && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, RUT o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      )}

      {/* Client list */}
      {filtered.length === 0 ? (
        <Card className="border-border/50">
          <CardContent>
            <EmptyState
              icon={Inbox}
              title={clientes.length === 0 ? "Sin clientes" : "Sin resultados"}
              description={
                clientes.length === 0
                  ? "Agregue su primer cliente para tenerlo disponible al crear documentos."
                  : "No se encontraron clientes con ese término de búsqueda."
              }
              actionLabel={clientes.length === 0 ? "Agregar Cliente" : undefined}
              onAction={
                clientes.length === 0
                  ? () => {
                      resetForm();
                      setShowForm(true);
                    }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((cliente) => (
            <Card key={cliente.id} className="border-border/50 group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {cliente.razonSocial}
                    </p>
                    <p className="text-xs text-[var(--snake)] font-mono mt-0.5">
                      {cliente.rut}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleEdit(cliente)}
                      title="Editar"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleDelete(cliente.id)}
                      title="Eliminar"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2.5 space-y-1">
                  {cliente.giro && (
                    <p className="text-xs text-muted-foreground truncate">
                      {cliente.giro}
                    </p>
                  )}
                  {cliente.direccion && (
                    <p className="text-xs text-muted-foreground truncate">
                      {cliente.direccion}
                      {cliente.comuna && `, ${cliente.comuna}`}
                    </p>
                  )}
                  {cliente.email && (
                    <p className="text-xs text-muted-foreground truncate">
                      {cliente.email}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
