"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Loader2 } from "lucide-react";

interface DashboardRoleGuardProps {
  /** Roles được phép vào (e.g. ['ADMIN'] hoặc ['STAFF']) */
  allowedRoles: string[];
  children: React.ReactNode;
}

/**
 * Bảo vệ trang dashboard theo role.
 * - Nếu chưa đăng nhập → redirect /auth/login
 * - Nếu không có role phù hợp → hiển thị 403
 */
export function DashboardRoleGuard({
  allowedRoles,
  children,
}: DashboardRoleGuardProps) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  // Chờ hydrate từ store (session restore async)
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setHydrated(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  // Nếu store chưa kịp hydrate → chờ 1 tick
  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-surface-base">
        <Loader2 className="size-8 animate-spin text-theme-primary-start" />
      </div>
    );
  }

  // Chưa đăng nhập
  if (!isAuthenticated || !user) {
    router.replace("/auth/login");
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-surface-base">
        <Loader2 className="size-8 animate-spin text-theme-primary-start" />
      </div>
    );
  }

  const userRoles = user.rolesSecured?.map((r) => r.name) ?? [];
  const hasAccess = allowedRoles.some((role) => userRoles.includes(role));

  if (!hasAccess) {
    router.replace("/403");
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-surface-base">
        <Loader2 className="size-8 animate-spin text-theme-primary-start" />
      </div>
    );
  }

  return <>{children}</>;
}
