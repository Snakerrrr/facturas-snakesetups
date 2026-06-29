import { NextRequest, NextResponse } from "next/server";
import { emitirDte } from "@/lib/sii/dte-service";
import type { DteTypeCode } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    tipoDte,
    receptor,
    items,
    referencias,
    folio,
    certBase64,
    certPassword,
    cafXml,
    empresa,
  } = body;

  if (!certBase64 || !certPassword || !cafXml || !empresa || !folio) {
    return NextResponse.json(
      {
        error:
          "Faltan datos requeridos: certificado, contraseña, CAF, empresa o folio",
      },
      { status: 400 }
    );
  }

  const neto = items.reduce(
    (sum: number, item: { cantidad: number; precioUnitario: number; descuentoPct?: number }) =>
      sum +
      Math.round(
        item.cantidad *
          item.precioUnitario *
          (1 - (item.descuentoPct || 0) / 100)
      ),
    0
  );
  const isExenta = tipoDte === 34;
  const iva = isExenta ? 0 : Math.round(neto * 0.19);
  const total = neto + iva;

  try {
    const result = await emitirDte({
      data: {
        tipoDte: tipoDte as DteTypeCode,
        receptor,
        items: items.map(
          (item: {
            nombre: string;
            cantidad: number;
            precioUnitario: number;
            descuentoPct?: number;
            descripcion?: string;
            montoItem?: number;
          }) => ({
            ...item,
            montoItem:
              item.montoItem ||
              Math.round(
                item.cantidad *
                  item.precioUnitario *
                  (1 - (item.descuentoPct || 0) / 100)
              ),
          })
        ),
        referencias: referencias?.map(
          (ref: { tipoDocRef: number; folioRef: number; fechaRef: string; codRef: number; razonRef: string }) => ({
            ...ref,
            tipoDocRef: ref.tipoDocRef as DteTypeCode,
          })
        ),
        montoNeto: neto,
        iva,
        montoTotal: total,
      },
      empresa,
      folio,
      certBase64,
      certPassword,
      cafXml,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
