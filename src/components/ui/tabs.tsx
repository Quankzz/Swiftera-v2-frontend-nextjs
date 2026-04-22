"use client";

import {
  createContext,
  useContext,
  useState,
  type HTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

/* ─── Context ─────────────────────────────────────────────────────────── */
const TabsContext = createContext<{
  value: string;
  onValueChange: (v: string) => void;
}>({ value: "", onValueChange: () => {} });

/* ─── Root ────────────────────────────────────────────────────────────── */
interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

function Tabs({
  defaultValue = "",
  value: controlledValue,
  onValueChange,
  children,
  className,
  ...props
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const value = controlledValue ?? internal;
  const handleChange = (v: string) => {
    setInternal(v);
    onValueChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ value, onValueChange: handleChange }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

/* ─── List ────────────────────────────────────────────────────────────── */
function TabsList({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center rounded-lg bg-gray-100 p-1",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─── Trigger ─────────────────────────────────────────────────────────── */
interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
}

function TabsTrigger({
  value,
  children,
  className,
  ...props
}: TabsTriggerProps) {
  const ctx = useContext(TabsContext);
  const active = ctx.value === value;
  return (
    <button
      role="tab"
      type="button"
      aria-selected={active}
      data-state={active ? "active" : "inactive"}
      onClick={() => ctx.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-all outline-none",
        "text-gray-600 hover:text-gray-900",
        active && "bg-white text-gray-900 shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ─── Content ─────────────────────────────────────────────────────────── */
interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

function TabsContent({
  value,
  children,
  className,
  ...props
}: TabsContentProps) {
  const ctx = useContext(TabsContext);
  if (ctx.value !== value) return null;
  return (
    <div
      role="tabpanel"
      data-state={ctx.value === value ? "active" : "inactive"}
      className={cn("mt-2 outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
