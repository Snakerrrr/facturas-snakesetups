import type {
  EmpresaConfig,
  DteTypeCode,
  FolioState,
  Producto,
  ClienteGuardado,
} from "./types";

const DEFAULT_EMPRESA: EmpresaConfig = {
  rut: "78.293.834-7",
  razonSocial: "SNAKE SETUPS SPA",
  giro: "Venta y Armados de componentes de computadora",
  actividadEconomica: 474100,
  direccion: "LAS SALITRERAS 7792",
  comuna: "RENCA",
  ciudad: "Santiago",
  nroResolucion: 99,
  fechaResolucion: "2014-08-01",
  ambiente: "certificacion",
};

const KEYS = {
  empresa: "snk:empresa",
  cert: "snk:cert",
  certName: "snk:cert:name",
  productos: "snk:productos",
  clientes: "snk:clientes",
  caf: (tipo: DteTypeCode) => `snk:caf:${tipo}`,
  folio: (tipo: DteTypeCode) => `snk:folio:${tipo}`,
} as const;

function get<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function set(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function remove(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

// --- Empresa ---

export function saveEmpresa(config: EmpresaConfig): void {
  set(KEYS.empresa, config);
}

export function getEmpresa(): EmpresaConfig {
  return get<EmpresaConfig>(KEYS.empresa) ?? { ...DEFAULT_EMPRESA };
}

export function isEmpresaSaved(): boolean {
  return get<EmpresaConfig>(KEYS.empresa) !== null;
}

// --- Certificado (base64) ---

export function saveCertificate(base64: string, fileName: string): void {
  set(KEYS.cert, base64);
  set(KEYS.certName, fileName);
}

export function getCertificateBase64(): string | null {
  return get<string>(KEYS.cert);
}

export function getCertificateName(): string | null {
  return get<string>(KEYS.certName);
}

export function deleteCertificate(): void {
  remove(KEYS.cert);
  remove(KEYS.certName);
}

export function hasCertificate(): boolean {
  return getCertificateBase64() !== null;
}

// --- CAF ---

export function saveCAF(
  tipoDte: DteTypeCode,
  cafXml: string,
  folioInicio: number,
  folioFin: number
): void {
  set(KEYS.caf(tipoDte), cafXml);
  const existing = getFolioState(tipoDte);
  if (!existing) {
    set(KEYS.folio(tipoDte), {
      siguiente: folioInicio,
      maximo: folioFin,
    } satisfies FolioState);
  }
}

export function getCAFXml(tipoDte: DteTypeCode): string | null {
  return get<string>(KEYS.caf(tipoDte));
}

export function hasCAF(tipoDte: DteTypeCode): boolean {
  return getCAFXml(tipoDte) !== null;
}

// --- Folios ---

export function getFolioState(tipoDte: DteTypeCode): FolioState | null {
  return get<FolioState>(KEYS.folio(tipoDte));
}

export function consumeFolio(
  tipoDte: DteTypeCode
): { folio: number; remaining: number } | null {
  const state = getFolioState(tipoDte);
  if (!state || state.siguiente > state.maximo) return null;

  const folio = state.siguiente;
  set(KEYS.folio(tipoDte), { ...state, siguiente: state.siguiente + 1 });
  return { folio, remaining: state.maximo - folio };
}

// --- Productos (catálogo) ---

export function getProductos(): Producto[] {
  return get<Producto[]>(KEYS.productos) ?? [];
}

export function saveProducto(producto: Producto): void {
  const list = getProductos();
  const idx = list.findIndex((p) => p.id === producto.id);
  if (idx >= 0) {
    list[idx] = producto;
  } else {
    list.push(producto);
  }
  set(KEYS.productos, list);
}

export function deleteProducto(id: string): void {
  const list = getProductos().filter((p) => p.id !== id);
  set(KEYS.productos, list);
}

// --- Clientes guardados ---

export function getClientes(): ClienteGuardado[] {
  return get<ClienteGuardado[]>(KEYS.clientes) ?? [];
}

export function saveCliente(cliente: ClienteGuardado): void {
  const list = getClientes();
  const idx = list.findIndex((c) => c.id === cliente.id);
  if (idx >= 0) {
    list[idx] = cliente;
  } else {
    list.push(cliente);
  }
  set(KEYS.clientes, list);
}

export function deleteCliente(id: string): void {
  const list = getClientes().filter((c) => c.id !== id);
  set(KEYS.clientes, list);
}

// --- Utils ---

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
