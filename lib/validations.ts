import { z } from "zod/v4";

export const empresaSchema = z.object({
  rut: z.string().min(1, "RUT es requerido"),
  razonSocial: z.string().min(1, "Razón social es requerida"),
  giro: z.string().min(1, "Giro es requerido"),
  actividadEconomica: z.coerce.number().int().positive("Actividad económica es requerida"),
  direccion: z.string().min(1, "Dirección es requerida"),
  comuna: z.string().min(1, "Comuna es requerida"),
  ciudad: z.string().min(1, "Ciudad es requerida"),
  nroResolucion: z.coerce.number().int().min(0),
  fechaResolucion: z.string().min(1, "Fecha resolución es requerida"),
  ambiente: z.enum(["certificacion", "produccion"]),
});

export const receptorSchema = z.object({
  rut: z.string().min(1, "RUT receptor es requerido"),
  razonSocial: z.string().min(1, "Razón social es requerida"),
  giro: z.string().optional(),
  direccion: z.string().optional(),
  comuna: z.string().optional(),
  ciudad: z.string().optional(),
  contacto: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export const itemSchema = z.object({
  nombre: z.string().min(1, "Nombre del item es requerido"),
  descripcion: z.string().optional(),
  cantidad: z.coerce.number().positive("Cantidad debe ser mayor a 0"),
  precioUnitario: z.coerce.number().positive("Precio debe ser mayor a 0"),
  descuentoPct: z.coerce.number().min(0).max(100).optional(),
  montoItem: z.coerce.number(),
});

export const referenciaSchema = z.object({
  tipoDocRef: z.coerce.number(),
  folioRef: z.coerce.number().int().positive(),
  fechaRef: z.string().min(1),
  codRef: z.coerce.number().int().min(1).max(3),
  razonRef: z.string().min(1, "Razón de referencia es requerida"),
});

export const dteFormSchema = z.object({
  tipoDte: z.coerce.number(),
  receptor: receptorSchema,
  items: z.array(itemSchema).min(1, "Debe agregar al menos un item"),
  referencias: z.array(referenciaSchema).optional(),
  certPassword: z.string().min(1, "Contraseña del certificado es requerida"),
});

export const cotizacionFormSchema = z.object({
  receptor: receptorSchema,
  items: z.array(itemSchema).min(1, "Debe agregar al menos un item"),
  observaciones: z.string().optional(),
  diasValidez: z.coerce.number().int().positive().default(30),
});
