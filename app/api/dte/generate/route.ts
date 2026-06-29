import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getEmpresaConfig } from "@/lib/storage";
import { emitirDte } from "@/lib/sii/dte-service";
import { dteFormSchema } from "@/lib/validations";
import type { DteTypeCode } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = dteFormSchema.safeParse(body);

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

  try {
    const result = await emitirDte(
      userId,
      {
        tipoDte: parsed.data.tipoDte as DteTypeCode,
        receptor: parsed.data.receptor,
        items: parsed.data.items.map((item) => ({
          ...item,
          montoItem:
            item.montoItem ||
            Math.round(
              item.cantidad * item.precioUnitario * (1 - (item.descuentoPct || 0) / 100)
            ),
        })),
        referencias: parsed.data.referencias?.map((ref) => ({
          ...ref,
          tipoDocRef: ref.tipoDocRef as DteTypeCode,
        })),
        montoNeto: parsed.data.items.reduce(
          (sum, item) =>
            sum +
            Math.round(
              item.cantidad * item.precioUnitario * (1 - (item.descuentoPct || 0) / 100)
            ),
          0
        ),
        iva: Math.round(
          parsed.data.items.reduce(
            (sum, item) =>
              sum +
              Math.round(
                item.cantidad * item.precioUnitario * (1 - (item.descuentoPct || 0) / 100)
              ),
            0
          ) * 0.19
        ),
        montoTotal: 0,
      },
      empresa,
      parsed.data.certPassword
    );

    const neto = result.xml ? 0 : 0;
    void neto;

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
