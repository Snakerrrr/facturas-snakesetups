export interface DteEncabezado {
  IdDoc: {
    TipoDTE: number;
    Folio: number;
    FchEmis: string;
    FmaPago?: number;
  };
  Emisor: {
    RUTEmisor: string;
    RznSoc: string;
    GiroEmis: string;
    Acteco: number;
    DirOrigen: string;
    CmnaOrigen: string;
    CiudadOrigen: string;
  };
  Receptor: {
    RUTRecep: string;
    RznSocRecep: string;
    GiroRecep?: string;
    DirRecep?: string;
    CmnaRecep?: string;
    CiudadRecep?: string;
    Contacto?: string;
  };
  Totales: {
    MntNeto?: number;
    TasaIVA?: number;
    IVA?: number;
    MntTotal: number;
    MntExe?: number;
  };
}

export interface DteDetalle {
  NroLinDet: number;
  NmbItem: string;
  DscItem?: string;
  QtyItem: number;
  PrcItem: number;
  MontoItem: number;
  DescuentoPct?: number;
  DescuentoMonto?: number;
}

export interface DteReferencia {
  NroLinRef: number;
  TpoDocRef: number;
  FolioRef: number;
  FchRef: string;
  CodRef: number;
  RazonRef: string;
}

export interface DteDocument {
  Encabezado: DteEncabezado;
  Detalle: DteDetalle[];
  Referencia?: DteReferencia[];
}

export interface SiiResponse {
  trackId: string;
  estado: string;
  glosa?: string;
}
