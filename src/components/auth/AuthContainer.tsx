"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { TogglePanel } from "./TogglePanel";

type AuthContainerProps = {
  initialMode?: "signin" | "signup";
};

export function AuthContainer({ initialMode = "signin" }: AuthContainerProps) {
  const [isActive, setIsActive] = useState(initialMode === "signup");

  const switchToSignUp = () => {
    setIsActive(true);
    window.history.replaceState(null, "", "/auth/register");
  };

  const switchToSignIn = () => {
    setIsActive(false);
    window.history.replaceState(null, "", "/auth/login");
  };

  return (
    <div className="relative min-h-[480px] w-[768px] max-w-full overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-[0_5px_15px_rgba(0,0,0,0.35)] max-md:w-full max-md:max-w-sm max-md:min-h-0 max-md:rounded-2xl dark:border-white/10 dark:bg-zinc-900/90 dark:shadow-[0_12px_45px_rgba(0,0,0,0.6)]">
      {/* Desktop: slide layout */}
      <div
        className={cn(
          "absolute top-0 left-0 z-1 h-full w-1/2 opacity-0 transition-all duration-600 ease-in-out max-md:hidden",
          isActive && "z-5 translate-x-full opacity-100 animate-auth-move",
        )}
      >
        <SignUpForm />
      </div>

      <div
        className={cn(
          "absolute top-0 left-0 z-2 h-full w-1/2 transition-all duration-600 ease-in-out max-md:hidden",
          isActive && "translate-x-full",
        )}
      >
        <SignInForm />
      </div>

      <div className="max-md:hidden">
        <TogglePanel
          isActive={isActive}
          onSignIn={switchToSignIn}
          onSignUp={switchToSignUp}
        />
      </div>

      {/* Mobile: stacked layout */}
      <div className="hidden max-md:block">
        {/* Toggle tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={switchToSignIn}
            className={cn(
              "flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors",
              !isActive
                ? "border-b-2 border-[var(--theme-primary-start,#0ea5e9)] text-[var(--theme-primary-start,#0ea5e9)] dark:border-[var(--theme-accent-start,#38bdf8)] dark:text-[var(--theme-accent-start,#38bdf8)]"
                : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300",
            )}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={switchToSignUp}
            className={cn(
              "flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors",
              isActive
                ? "border-b-2 border-[var(--theme-primary-start,#0ea5e9)] text-[var(--theme-primary-start,#0ea5e9)] dark:border-[var(--theme-accent-start,#38bdf8)] dark:text-[var(--theme-accent-start,#38bdf8)]"
                : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300",
            )}
          >
            Đăng ký
          </button>
        </div>
        {isActive ? <SignUpForm /> : <SignInForm />}
      </div>
    </div>
  );
}
