# SnakeSetups - Facturación Electrónica Chile

Aplicación web para armar cotizaciones y generar facturas electrónicas firmadas con certificado digital del SII (Servicio de Impuestos Internos de Chile).

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS + shadcn/ui** (UI moderna)
- **Clerk** (autenticación multi-usuario)
- **@devlas/dte-sii** (generación, firma y envío de DTE al SII)
- **@react-pdf/renderer** (generación de PDF)
- **Vercel Blob** (almacenamiento de certificados y CAF)
- **Upstash Redis** (datos de empresa y tracking de folios)

## Tipos de Documentos Soportados

| Código | Tipo |
|--------|------|
| 33 | Factura Electrónica |
| 34 | Factura No Afecta o Exenta Electrónica |
| 52 | Guía de Despacho Electrónica |
| 56 | Nota de Débito Electrónica |
| 61 | Nota de Crédito Electrónica |

## Configuración

### 1. Variables de Entorno

Copia `.env.local` y configura las siguientes variables:

```bash
# Clerk - https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Upstash Redis - https://console.upstash.com
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# Clave para encriptar certificados (generar con: openssl rand -hex 32)
CERT_ENCRYPTION_KEY=...
```

### 2. Servicios Requeridos

1. **Clerk**: Crear una aplicación en [clerk.com](https://clerk.com)
2. **Upstash Redis**: Crear una base de datos en [upstash.com](https://upstash.com) o desde Vercel Marketplace
3. **Vercel Blob**: Se configura automáticamente al desplegar en Vercel

### 3. Desarrollo Local

```bash
npm install
npm run dev
```

### 4. Despliegue en Vercel

```bash
npx vercel --prod
```

O conecta el repositorio a Vercel para despliegues automáticos.

## Uso

1. **Configuración**: Ingresa los datos de tu empresa, sube tu certificado digital (.pfx/.p12) y los archivos CAF del SII
2. **Cotizaciones**: Arma cotizaciones rápidamente con cálculo automático de IVA y descarga como PDF
3. **Facturas**: Genera facturas electrónicas, fírmalas con tu certificado y envíalas directamente al SII

## Seguridad

- Los certificados digitales se encriptan con AES-256 antes de almacenarse
- La contraseña del certificado nunca se almacena; se solicita cada vez que se emite un DTE
- La comunicación con el SII usa TLS 1.2+
