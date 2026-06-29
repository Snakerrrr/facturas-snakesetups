import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/cotizaciones");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-b from-background to-muted/40 p-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          SnakeSetups
        </h1>
        <p className="text-xl text-muted-foreground max-w-md">
          Cotizaciones rápidas y facturación electrónica con firma SII
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/sign-in"
          className={cn(buttonVariants({ size: "lg" }))}
        >
          Iniciar Sesión
        </Link>
        <Link
          href="/sign-up"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Crear Cuenta
        </Link>
      </div>
    </div>
  );
}
