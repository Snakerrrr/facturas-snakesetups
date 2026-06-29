import type { EmpresaConfig, DteTypeCode, FolioState } from "./types";

const KEYS = {
  empresa: "snk:empresa",
  cert: "snk:cert",
  certName: "snk:cert:name",
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

export function getEmpresa(): EmpresaConfig | null {
  return get<EmpresaConfig>(KEYS.empresa);
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

export function saveCAF(tipoDte: DteTypeCode, cafXml: string, folioInicio: number, folioFin: number): void {
  set(KEYS.caf(tipoDte), cafXml);
  const existing = getFolioState(tipoDte);
  if (!existing) {
    set(KEYS.folio(tipoDte), { siguiente: folioInicio, maximo: folioFin } satisfies FolioState);
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

export function consumeFolio(tipoDte: DteTypeCode): { folio: number; remaining: number } | null {
  const state = getFolioState(tipoDte);
  if (!state || state.siguiente > state.maximo) return null;

  const folio = state.siguiente;
  set(KEYS.folio(tipoDte), { ...state, siguiente: state.siguiente + 1 });
  return { folio, remaining: state.maximo - folio };
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
