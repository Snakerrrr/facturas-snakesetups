import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { saveCertificate, deleteCertificate } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("certificate") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: "No se proporcionó un archivo" },
      { status: 400 }
    );
  }

  const allowedTypes = [
    "application/x-pkcs12",
    "application/octet-stream",
  ];
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pfx|p12)$/i)) {
    return NextResponse.json(
      { error: "El archivo debe ser .pfx o .p12" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await saveCertificate(userId, buffer);

  return NextResponse.json({ ok: true, url });
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  await deleteCertificate(userId);
  return NextResponse.json({ ok: true });
}
