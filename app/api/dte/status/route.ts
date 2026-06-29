import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getEmpresaConfig } from "@/lib/storage";
import { consultarEstadoDte } from "@/lib/sii/dte-service";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const trackId = req.nextUrl.searchParams.get("trackId");
  const certPassword = req.nextUrl.searchParams.get("certPassword");

  if (!trackId || !certPassword) {
    return NextResponse.json(
      { error: "trackId y certPassword son requeridos" },
      { status: 400 }
    );
  }

  const empresa = await getEmpresaConfig(userId);
  if (!empresa) {
    return NextResponse.json(
      { error: "Debe configurar los datos de la empresa" },
      { status: 400 }
    );
  }

  try {
    const result = await consultarEstadoDte(
      userId,
      empresa,
      trackId,
      certPassword
    );
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
