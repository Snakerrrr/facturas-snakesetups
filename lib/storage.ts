import { put, del, list } from "@vercel/blob";
import { Redis } from "@upstash/redis";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import type { EmpresaConfig, FolioState, DteTypeCode } from "./types";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ENCRYPTION_KEY = process.env.CERT_ENCRYPTION_KEY || "";

function encrypt(buffer: Buffer): { encrypted: Buffer; iv: string } {
  const iv = randomBytes(16);
  const key = Buffer.from(ENCRYPTION_KEY, "hex");
  const cipher = createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return { encrypted, iv: iv.toString("hex") };
}

function decrypt(encrypted: Buffer, ivHex: string): Buffer {
  const iv = Buffer.from(ivHex, "hex");
  const key = Buffer.from(ENCRYPTION_KEY, "hex");
  const decipher = createDecipheriv("aes-256-cbc", key, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

// --- Empresa Config ---

export async function saveEmpresaConfig(
  userId: string,
  config: EmpresaConfig
): Promise<void> {
  await redis.set(`empresa:${userId}`, JSON.stringify(config));
}

export async function getEmpresaConfig(
  userId: string
): Promise<EmpresaConfig | null> {
  const data = await redis.get<string>(`empresa:${userId}`);
  if (!data) return null;
  return typeof data === "string" ? JSON.parse(data) : (data as unknown as EmpresaConfig);
}

// --- Certificate ---

export async function saveCertificate(
  userId: string,
  fileBuffer: Buffer
): Promise<string> {
  const { encrypted, iv } = encrypt(fileBuffer);
  const blob = await put(`certs/${userId}/cert.pfx.enc`, encrypted, {
    access: "public",
    addRandomSuffix: false,
  });
  await redis.set(`cert-iv:${userId}`, iv);
  return blob.url;
}

export async function getCertificateBuffer(
  userId: string
): Promise<Buffer | null> {
  const blobs = await list({ prefix: `certs/${userId}/` });
  const certBlob = blobs.blobs.find((b) => b.pathname.includes("cert.pfx"));
  if (!certBlob) return null;

  const iv = await redis.get<string>(`cert-iv:${userId}`);
  if (!iv) return null;

  const response = await fetch(certBlob.url);
  const encrypted = Buffer.from(await response.arrayBuffer());
  return decrypt(encrypted, iv);
}

export async function deleteCertificate(userId: string): Promise<void> {
  const blobs = await list({ prefix: `certs/${userId}/` });
  for (const blob of blobs.blobs) {
    await del(blob.url);
  }
  await redis.del(`cert-iv:${userId}`);
}

// --- CAF Files ---

export async function saveCAF(
  userId: string,
  tipoDte: DteTypeCode,
  cafXml: string,
  folioInicio: number,
  folioFin: number
): Promise<void> {
  const blob = await put(
    `cafs/${userId}/${tipoDte}.xml`,
    Buffer.from(cafXml, "utf-8"),
    { access: "public", addRandomSuffix: false }
  );
  await redis.set(
    `caf-meta:${userId}:${tipoDte}`,
    JSON.stringify({ url: blob.url, folioInicio, folioFin })
  );
  const existing = await redis.get<string>(`folio:${userId}:${tipoDte}`);
  if (!existing) {
    await redis.set(
      `folio:${userId}:${tipoDte}`,
      JSON.stringify({ siguiente: folioInicio, maximo: folioFin, cafId: blob.url })
    );
  }
}

export async function getCAFXml(
  userId: string,
  tipoDte: DteTypeCode
): Promise<string | null> {
  const meta = await redis.get<string>(`caf-meta:${userId}:${tipoDte}`);
  if (!meta) return null;
  const parsed = typeof meta === "string" ? JSON.parse(meta) : meta;
  const response = await fetch((parsed as { url: string }).url);
  return await response.text();
}

// --- Folio Management ---

export async function getNextFolio(
  userId: string,
  tipoDte: DteTypeCode
): Promise<{ folio: number; remaining: number } | null> {
  const key = `folio:${userId}:${tipoDte}`;
  const raw = await redis.get<string>(key);
  if (!raw) return null;

  const state: FolioState = typeof raw === "string" ? JSON.parse(raw) : (raw as unknown as FolioState);
  if (state.siguiente > state.maximo) return null;

  const folio = state.siguiente;
  state.siguiente += 1;
  await redis.set(key, JSON.stringify(state));

  return { folio, remaining: state.maximo - state.siguiente + 1 };
}

export async function getFolioState(
  userId: string,
  tipoDte: DteTypeCode
): Promise<FolioState | null> {
  const raw = await redis.get<string>(`folio:${userId}:${tipoDte}`);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : (raw as unknown as FolioState);
}
