"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const frame = requestAnimationFrame(() => {
      setVisible(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <div
      className={
        visible
          ? "animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          : "opacity-0"
      }
    >
      {children}
    </div>
  );
}
