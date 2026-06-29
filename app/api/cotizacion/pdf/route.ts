import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { getEmpresaConfig } from "@/lib/storage";
import { CotizacionPdf } from "@/lib/pdf/cotizacion-template";
import { cotizacionFormSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = cotizacionFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const empresa = await getEmpresaConfig(userId);
  if (!empresa) {
    return NextResponse.json(
      { error: "Debe configurar los datos de la empresa primero" },
      { status: 400 }
    );
  }

  const neto = parsed.data.items.reduce((sum, item) => {
    const subtotal = item.cantidad * item.precioUnitario;
    const descuento = item.descuentoPct
      ? Math.round(subtotal * (item.descuentoPct / 100))
      : 0;
    return sum + (subtotal - descuento);
  }, 0);
  const iva = Math.round(neto * 0.19);
  const total = neto + iva;

  const cotizacionData = {
    ...parsed.data,
    items: parsed.data.items.map((item) => {
      const subtotal = item.cantidad * item.precioUnitario;
      const descuento = item.descuentoPct
        ? Math.round(subtotal * (item.descuentoPct / 100))
        : 0;
      return { ...item, montoItem: subtotal - descuento };
    }),
    montoNeto: neto,
    iva,
    montoTotal: total,
  };

  const numero = Math.floor(Date.now() / 1000) % 100000;

  const pdfBuffer = await renderToBuffer(
    React.createElement(CotizacionPdf, {
      data: cotizacionData,
      empresa,
      numero,
    }) as React.ReactElement<React.ComponentProps<typeof import("@react-pdf/renderer").Document>>
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="cotizacion-${numero}.pdf"`,
    },
  });
}
