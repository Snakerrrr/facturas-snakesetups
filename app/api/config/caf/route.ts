import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { saveCAF, getFolioState } from "@/lib/storage";
import type { DteTypeCode } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("caf") as File | null;
  const tipoDte = formData.get("tipoDte") as string | null;

  if (!file || !tipoDte) {
    return NextResponse.json(
      { error: "Archivo CAF y tipo de DTE son requeridos" },
      { status: 400 }
    );
  }

  const cafXml = await file.text();

  const folioInicioMatch = cafXml.match(/<D>(\d+)<\/D>/);
  const folioFinMatch = cafXml.match(/<H>(\d+)<\/H>/);

  if (!folioInicioMatch || !folioFinMatch) {
    return NextResponse.json(
      { error: "No se pudieron extraer los rangos de folios del CAF" },
      { status: 400 }
    );
  }

  const folioInicio = parseInt(folioInicioMatch[1], 10);
  const folioFin = parseInt(folioFinMatch[1], 10);

  await saveCAF(
    userId,
    parseInt(tipoDte) as DteTypeCode,
    cafXml,
    folioInicio,
    folioFin
  );

  return NextResponse.json({
    ok: true,
    folioInicio,
    folioFin,
    disponibles: folioFin - folioInicio + 1,
  });
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const tipoDte = req.nextUrl.searchParams.get("tipoDte");
  if (!tipoDte) {
    return NextResponse.json(
      { error: "tipoDte es requerido" },
      { status: 400 }
    );
  }

  const state = await getFolioState(userId, parseInt(tipoDte) as DteTypeCode);
  return NextResponse.json(state);
}
