import { NextRequest, NextResponse } from "next/server";
import { consultarEstadoDte } from "@/lib/sii/dte-service";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { trackId, certBase64, certPassword, empresa } = body;

  if (!trackId || !certBase64 || !certPassword || !empresa) {
    return NextResponse.json(
      { error: "Faltan datos requeridos" },
      { status: 400 }
    );
  }

  try {
    const result = await consultarEstadoDte({
      empresa,
      trackId,
      certBase64,
      certPassword,
    });
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
