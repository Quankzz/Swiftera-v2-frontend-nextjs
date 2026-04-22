"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioGroupContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(
  null,
);

function RadioGroup({
  className,
  value = "",
  onValueChange,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  const [internalValue, setInternalValue] = React.useState(value);

  const currentValue = value ?? internalValue;
  const handleChange = (v: string) => {
    setInternalValue(v);
    onValueChange?.(v);
  };

  return (
    <RadioGroupContext.Provider
      value={{ value: currentValue, onValueChange: handleChange }}
    >
      <div
        data-slot="radio-group"
        role="radiogroup"
        className={cn("grid gap-2", className)}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

function RadioGroupItem({
  className,
  value,
  id,
  ...props
}: React.ComponentProps<"button"> & { value: string }) {
  const ctx = React.useContext(RadioGroupContext);
  if (!ctx) throw new Error("RadioGroupItem must be used within <RadioGroup>");

  const isChecked = ctx.value === value;

  return (
    <button
      type="button"
      role="radio"
      id={id}
      aria-checked={isChecked}
      data-state={isChecked ? "checked" : "unchecked"}
      onClick={() => ctx.onValueChange(value)}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {isChecked && (
        <span className="flex items-center justify-center">
          <span className="h-2.5 w-2.5 rounded-full bg-current" />
        </span>
      )}
    </button>
  );
}

export { RadioGroup, RadioGroupItem };
