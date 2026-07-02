"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

export function KeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement;

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "1":
            e.preventDefault();
            router.push("/dashboard");
            break;
          case "2":
            e.preventDefault();
            router.push("/cotizaciones");
            break;
          case "3":
            e.preventDefault();
            router.push("/facturas");
            break;
          case "4":
            e.preventDefault();
            router.push("/configuracion");
            break;
          case "5":
            e.preventDefault();
            router.push("/historial");
            break;
          case "6":
            e.preventDefault();
            router.push("/clientes");
            break;
          case "7":
            e.preventDefault();
            router.push("/resumen");
            break;
          case "k":
            if (!isInput) {
              e.preventDefault();
              toast.info(
                "Ctrl+1 Dashboard, Ctrl+2 Cotiz., Ctrl+3 Facturas, Ctrl+4 Config, Ctrl+5 Historial, Ctrl+6 Clientes, Ctrl+7 Resumen",
                { duration: 5000 }
              );
            }
            break;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, pathname]);

  return null;
}
