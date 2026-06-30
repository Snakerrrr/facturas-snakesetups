import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { CotizacionPdf } from "@/lib/pdf/cotizacion-template";
import type { EmpresaConfig } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { receptor, items, observaciones, diasValidez, empresa, logoDataUrl } = body;

  if (!empresa || !empresa.rut) {
    return NextResponse.json(
      { error: "Debe configurar los datos de la empresa primero" },
      { status: 400 }
    );
  }

  const neto = items.reduce(
    (
      sum: number,
      item: { cantidad: number; precioUnitario: number; descuentoPct?: number }
    ) => {
      const subtotal = item.cantidad * item.precioUnitario;
      const descuento = item.descuentoPct
        ? Math.round(subtotal * (item.descuentoPct / 100))
        : 0;
      return sum + (subtotal - descuento);
    },
    0
  );
  const iva = Math.round(neto * 0.19);
  const total = neto + iva;

  const cotizacionData = {
    receptor,
    items: items.map(
      (item: {
        nombre: string;
        cantidad: number;
        precioUnitario: number;
        descuentoPct?: number;
      }) => {
        const subtotal = item.cantidad * item.precioUnitario;
        const descuento = item.descuentoPct
          ? Math.round(subtotal * (item.descuentoPct / 100))
          : 0;
        return { ...item, montoItem: subtotal - descuento };
      }
    ),
    observaciones: observaciones || "",
    diasValidez: diasValidez || 30,
    montoNeto: neto,
    iva,
    montoTotal: total,
  };

  const numero = Math.floor(Date.now() / 1000) % 100000;

  const pdfBuffer = await renderToBuffer(
    React.createElement(CotizacionPdf, {
      data: cotizacionData,
      empresa: empresa as EmpresaConfig,
      numero,
      logoDataUrl: logoDataUrl || undefined,
    }) as React.ReactElement<
      React.ComponentProps<typeof import("@react-pdf/renderer").Document>
    >
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="cotizacion-${numero}.pdf"`,
    },
  });
}
