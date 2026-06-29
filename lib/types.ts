export const DTE_TYPES = {
  33: "Factura Electrónica",
  34: "Factura No Afecta o Exenta Electrónica",
  52: "Guía de Despacho Electrónica",
  56: "Nota de Débito Electrónica",
  61: "Nota de Crédito Electrónica",
} as const;

export type DteTypeCode = keyof typeof DTE_TYPES;

export interface EmpresaConfig {
  rut: string;
  razonSocial: string;
  giro: string;
  actividadEconomica: number;
  direccion: string;
  comuna: string;
  ciudad: string;
  nroResolucion: number;
  fechaResolucion: string;
  ambiente: "certificacion" | "produccion";
}

export interface ItemDetalle {
  nombre: string;
  descripcion?: string;
  cantidad: number;
  precioUnitario: number;
  descuentoPct?: number;
  montoItem: number;
}

export interface Receptor {
  rut: string;
  razonSocial: string;
  giro?: string;
  direccion?: string;
  comuna?: string;
  ciudad?: string;
  contacto?: string;
  email?: string;
}

export interface Referencia {
  tipoDocRef: DteTypeCode;
  folioRef: number;
  fechaRef: string;
  codRef: number;
  razonRef: string;
}

export interface DteFormData {
  tipoDte: DteTypeCode;
  receptor: Receptor;
  items: ItemDetalle[];
  referencias?: Referencia[];
  montoNeto: number;
  iva: number;
  montoTotal: number;
}

export interface CotizacionFormData {
  receptor: Receptor;
  items: ItemDetalle[];
  observaciones?: string;
  diasValidez: number;
  montoNeto: number;
  iva: number;
  montoTotal: number;
}

export interface FolioState {
  siguiente: number;
  maximo: number;
}

export interface DteResult {
  trackId: string;
  folio: number;
  tipoDte: DteTypeCode;
  estado: string;
  xml?: string;
}
