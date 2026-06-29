import type {
  DteFormData,
  EmpresaConfig,
  DteResult,
} from "../types";
import type { DteDocument } from "./types";
import { formatDate } from "../utils";

function buildDteDocument(
  data: DteFormData,
  empresa: EmpresaConfig,
  folio: number
): DteDocument {
  const isExenta = data.tipoDte === 34;

  const doc: DteDocument = {
    Encabezado: {
      IdDoc: {
        TipoDTE: data.tipoDte,
        Folio: folio,
        FchEmis: formatDate(new Date()),
        FmaPago: 1,
      },
      Emisor: {
        RUTEmisor: empresa.rut,
        RznSoc: empresa.razonSocial,
        GiroEmis: empresa.giro,
        Acteco: empresa.actividadEconomica,
        DirOrigen: empresa.direccion,
        CmnaOrigen: empresa.comuna,
        CiudadOrigen: empresa.ciudad,
      },
      Receptor: {
        RUTRecep: data.receptor.rut,
        RznSocRecep: data.receptor.razonSocial,
        GiroRecep: data.receptor.giro,
        DirRecep: data.receptor.direccion,
        CmnaRecep: data.receptor.comuna,
        CiudadRecep: data.receptor.ciudad,
        Contacto: data.receptor.contacto,
      },
      Totales: isExenta
        ? { MntExe: data.montoTotal, MntTotal: data.montoTotal }
        : {
            MntNeto: data.montoNeto,
            TasaIVA: 19,
            IVA: data.iva,
            MntTotal: data.montoTotal,
          },
    },
    Detalle: data.items.map((item, idx) => ({
      NroLinDet: idx + 1,
      NmbItem: item.nombre,
      DscItem: item.descripcion,
      QtyItem: item.cantidad,
      PrcItem: item.precioUnitario,
      MontoItem: item.montoItem,
      DescuentoPct: item.descuentoPct,
      DescuentoMonto: item.descuentoPct
        ? Math.round(
            item.cantidad * item.precioUnitario * (item.descuentoPct / 100)
          )
        : undefined,
    })),
  };

  if (data.referencias && data.referencias.length > 0) {
    doc.Referencia = data.referencias.map((ref, idx) => ({
      NroLinRef: idx + 1,
      TpoDocRef: ref.tipoDocRef,
      FolioRef: ref.folioRef,
      FchRef: ref.fechaRef,
      CodRef: ref.codRef,
      RazonRef: ref.razonRef,
    }));
  }

  return doc;
}

export interface EmitirDteInput {
  data: DteFormData;
  empresa: EmpresaConfig;
  folio: number;
  certBase64: string;
  certPassword: string;
  cafXml: string;
}

export async function emitirDte(input: EmitirDteInput): Promise<DteResult> {
  const { data, empresa, folio, certBase64, certPassword, cafXml } = input;

  const certBuffer = Buffer.from(certBase64, "base64");
  const dteDoc = buildDteDocument(data, empresa, folio);

  try {
    const { Certificado, CAF, DTE, EnvioDTE, EnviadorSII } = require("@devlas/dte-sii");

    const cert = new Certificado(certBuffer, certPassword);
    const caf = new CAF(cafXml);

    const dte = new DTE(dteDoc);
    dte.generarXML().timbrar(caf).firmar(cert);

    const envio = new EnvioDTE({
      RutEmisor: empresa.rut,
      RutEnvia: empresa.rut,
      RutReceptor: data.receptor.rut,
      FchResol: empresa.fechaResolucion,
      NroResol: empresa.nroResolucion,
    });
    envio.agregar(dte).firmar(cert);

    const enviador = new EnviadorSII(cert, {
      ambiente:
        empresa.ambiente === "produccion" ? "produccion" : "certificacion",
    });

    const resultado = await enviador.enviarDteSoap(envio.toXML());

    return {
      trackId: resultado.trackId || resultado.TRACKID || String(resultado),
      folio,
      tipoDte: data.tipoDte,
      estado: "Enviado",
      xml: envio.toXML(),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al emitir DTE: ${message}`);
  }
}

export interface ConsultarEstadoInput {
  empresa: EmpresaConfig;
  trackId: string;
  certBase64: string;
  certPassword: string;
}

export async function consultarEstadoDte(
  input: ConsultarEstadoInput
): Promise<{ estado: string; glosa: string }> {
  const { empresa, trackId, certBase64, certPassword } = input;

  const certBuffer = Buffer.from(certBase64, "base64");

  try {
    const { Certificado, EnviadorSII } = require("@devlas/dte-sii");

    const cert = new Certificado(certBuffer, certPassword);
    const enviador = new EnviadorSII(cert, {
      ambiente:
        empresa.ambiente === "produccion" ? "produccion" : "certificacion",
    });

    const resultado = await enviador.consultarEstadoEnvio(
      empresa.rut,
      trackId
    );

    return {
      estado: resultado.estado || resultado.ESTADO || "Desconocido",
      glosa: resultado.glosa || resultado.GLOSA || "",
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al consultar estado: ${message}`);
  }
}
