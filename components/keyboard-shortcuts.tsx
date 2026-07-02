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
          case "k":
            if (!isInput) {
              e.preventDefault();
              toast.info(
                "Atajos: Ctrl+1 Dashboard, Ctrl+2 Cotizaciones, Ctrl+3 Facturas, Ctrl+4 Config",
                { duration: 4000 }
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
