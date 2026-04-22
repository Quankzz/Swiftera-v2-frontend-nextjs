import { useMemo } from "react";
import { cn } from "@/lib/utils";

type PasswordStrengthProps = {
  password: string;
};

type StrengthLevel = {
  label: string;
  color: string;
  bg: string;
};

const STRENGTH_LEVELS: StrengthLevel[] = [
  { label: "Rất yếu", color: "text-red-500", bg: "bg-red-500" },
  { label: "Yếu", color: "text-orange-500", bg: "bg-orange-500" },
  { label: "Trung bình", color: "text-yellow-500", bg: "bg-yellow-500" },
  { label: "Mạnh", color: "text-emerald-500", bg: "bg-emerald-500" },
  { label: "Rất mạnh", color: "text-green-500", bg: "bg-green-500" },
];

function evaluateStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const index = Math.min(Math.max(score - 1, 0), STRENGTH_LEVELS.length - 1);
  return { score, level: STRENGTH_LEVELS[index] };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { score, level } = useMemo(
    () => evaluateStrength(password),
    [password],
  );

  if (!password) return null;

  return (
    <div className="mt-1 w-full space-y-1.5">
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i < score ? level.bg : "bg-zinc-200 dark:bg-zinc-700",
            )}
          />
        ))}
      </div>
      <p className={cn("text-[11px] font-medium", level.color)}>
        {level.label}
      </p>
    </div>
  );
}
