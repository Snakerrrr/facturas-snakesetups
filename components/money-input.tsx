"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MoneyInputProps {
  value: number;
  onChange: (value: number) => void;
  id?: string;
  placeholder?: string;
  className?: string;
  min?: number;
}

function formatDisplay(n: number): string {
  if (!n) return "";
  return n.toLocaleString("es-CL");
}

export function MoneyInput({
  value,
  onChange,
  id,
  placeholder = "0",
  className,
  min = 0,
}: MoneyInputProps) {
  const [focused, setFocused] = useState(false);
  const [raw, setRaw] = useState(String(value || ""));

  const handleFocus = useCallback(() => {
    setFocused(true);
    setRaw(value ? String(value) : "");
  }, [value]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    const parsed = parseInt(raw.replace(/\D/g, "")) || 0;
    onChange(Math.max(parsed, min));
  }, [raw, onChange, min]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRaw(e.target.value);
    },
    []
  );

  return (
    <div className="relative">
      {!focused && value > 0 && (
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
          $
        </span>
      )}
      <Input
        id={id}
        type={focused ? "number" : "text"}
        value={focused ? raw : formatDisplay(value)}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        min={min}
        className={cn(
          !focused && value > 0 && "pl-6",
          className
        )}
      />
    </div>
  );
}
