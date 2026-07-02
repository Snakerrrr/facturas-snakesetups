import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl sm:text-9xl font-extrabold tracking-tighter text-[var(--snake)]">
        404
      </p>
      <h1 className="mt-4 text-xl sm:text-2xl font-bold">
        Página no encontrada
      </h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        href="/dashboard"
        className={buttonVariants({
          variant: "default",
          size: "lg",
          className:
            "mt-6 bg-[var(--snake)] text-[var(--snake-foreground)] hover:bg-[var(--snake)]/90 shadow-[0_0_20px_var(--snake-muted)]",
        })}
      >
        Volver al Dashboard
      </Link>
    </div>
  );
}
