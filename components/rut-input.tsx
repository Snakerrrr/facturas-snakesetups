"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { cn, validarRut, formatRut } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

interface RutInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  className?: string;
}

export function RutInput({
  value,
  onChange,
  id,
  placeholder = "12.345.678-9",
  className,
}: RutInputProps) {
  const [touched, setTouched] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const cleaned = raw.replace(/[^0-9kK]/g, "");
      if (cleaned.length <= 9) {
        onChange(cleaned.length >= 2 ? formatRut(cleaned) : cleaned);
      }
    },
    [onChange]
  );

  const isValid = value.length >= 3 && validarRut(value);
  const showStatus = touched && value.length >= 2;

  return (
    <div className="relative">
      <Input
        id={id}
        value={value}
        onChange={handleChange}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        className={cn(
          showStatus && isValid && "border-[var(--snake)]/50 focus:border-[var(--snake)]",
          showStatus && !isValid && "border-destructive/50 focus:border-destructive",
          "pr-8",
          className
        )}
      />
      {showStatus && (
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
          {isValid ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-[var(--snake)]" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-destructive" />
          )}
        </span>
      )}
    </div>
  );
}
