"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/dashboard/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserResponse } from "@/features/users/types";
import { useUsersQuery } from "@/features/users/hooks/use-user-management";
import { useRolesListQuery } from "@/features/roles/hooks/use-roles";
import { Pencil, Trash2, Shield, Search, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

type UsersTableProps = {
  onEdit?: (user: UserResponse) => void;
  onDelete?: (user: UserResponse) => void;
};

/** Helper: build display name from firstName + lastName */
function displayName(user: UserResponse): string {
  return (
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
  );
}

function AvatarCell({ user }: { user: UserResponse }) {
  const name = displayName(user);
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/8 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200 dark:border-white/8">
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={name}
            width={32}
            height={32}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <span className="text-xs font-bold text-theme-primary-start">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-text-main leading-none truncate">
          {name}
        </p>
      </div>
    </div>
  );
}

// ── Filter Select ──────────────────────────────────────────────────────────
function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-9 appearance-none rounded-lg border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20 focus:border-theme-primary-start transition cursor-pointer",
          value
            ? "text-text-main border-theme-primary-start/40 bg-theme-primary-start/5 dark:bg-theme-primary-start/10"
            : "text-text-sub",
        )}
        style={{ minWidth: 130 }}
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-sub">
        {value ? (
          <button
            type="button"
            className="pointer-events-auto flex items-center"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
          >
            <X size={12} />
          </button>
        ) : (
          <ChevronDown size={13} />
        )}
      </span>
    </div>
  );
}

export function UsersTable({ onEdit, onDelete }: UsersTableProps) {
  const [page, setPage] = useState(0); // 0-based cho DataTable UI; gửi page+1 lên BE
  const [size] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(""); // role name (string)
  const [statusFilter, setStatusFilter] = useState(""); // 'verified' | 'unverified' | ''

  const handleRoleChange = (v: string) => {
    setRoleFilter(v);
    setPage(0);
  };
  const handleStatusChange = (v: string) => {
    setStatusFilter(v);
    setPage(0);
  };

  // Fetch all roles for filter dropdown
  const { data: rolesData } = useRolesListQuery({ page: 1, size: 100 });
  const roleOptions = useMemo(
    () =>
      (rolesData?.content ?? []).map((r) => ({
        value: r.name,
        label: r.name,
      })),
    [rolesData],
  );

  // Debounce search 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Build SpringFilter DSL
  const filter = useMemo(() => {
    const parts: string[] = [];

    const term = debouncedSearch.trim();
    if (term) {
      parts.push(
        `(firstName~~'*${term}*' or lastName~~'*${term}*' or email~~'*${term}*')`,
      );
    }

    if (statusFilter === "verified") parts.push(`isVerified:true`);
    if (statusFilter === "unverified") parts.push(`isVerified:false`);

    // Role filter - Spring DSL on roles.name (nested)
    if (roleFilter) {
      parts.push(`roles.name:'${roleFilter}'`);
    }

    return parts.length > 0 ? parts.join(" and ") : undefined;
  }, [debouncedSearch, statusFilter, roleFilter]);

  const { data, isLoading, isError } = useUsersQuery({
    page: page + 1, // BE expects 1-based
    size,
    ...(filter ? { filter } : {}),
  });

  const total = data?.meta?.totalElements ?? 0;
  const users = data?.content ?? [];
  const totalPages =
    data?.meta?.totalPages ?? Math.max(1, Math.ceil(total / size));

  const columns = useMemo<ColumnDef<UserResponse>[]>(
    () => [
      {
        id: "displayName",
        header: "Người dùng",
        accessorFn: (row) => displayName(row),
        cell: ({ row }) => <AvatarCell user={row.original} />,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) => (
          <span className="text-text-sub text-sm">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: "phoneNumber",
        header: "Số điện thoại",
        enableSorting: false,
        cell: ({ getValue }) => {
          const val = getValue() as string | null;
          return val ? (
            <span className="text-text-sub text-sm">{val}</span>
          ) : (
            <span className="italic text-text-sub opacity-40 text-sm">
              Trống
            </span>
          );
        },
      },
      {
        accessorKey: "isVerified",
        header: "Trạng thái",
        cell: ({ getValue }) =>
          getValue() ? (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 text-xs"
            >
              Đã xác minh
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-orange-50 text-orange-600 border-orange-200 text-xs"
            >
              Chưa xác minh
            </Badge>
          ),
      },
      {
        id: "roles",
        header: "Vai trò",
        enableSorting: false,
        cell: ({ row }) => {
          // List endpoint trả roles[] (RoleSummary), detail trả rolesSecured[]
          const roles = row.original.roles ?? row.original.rolesSecured ?? [];
          if (roles.length === 0)
            return (
              <span className="italic text-text-sub opacity-40 text-sm">
                Chưa có
              </span>
            );

          // Priority order - highest first
          const PRIORITY: Record<string, number> = {
            admin: 0,
            "quản trị": 0,
            manager: 1,
            "quản lý": 1,
            user: 2,
            "người dùng": 2,
            guest: 3,
            khách: 3,
          };
          const rank = (name: string) => PRIORITY[name.toLowerCase()] ?? 99;

          const sorted = [...roles].sort((a, b) => rank(a.name) - rank(b.name));
          const top = sorted[0];
          const rest = sorted.length - 1;

          return (
            <div className="flex items-center gap-1 flex-nowrap">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-300 font-medium whitespace-nowrap">
                <Shield size={10} className="shrink-0" />
                {top.name}
              </span>
              {rest > 0 && (
                <span
                  title={sorted
                    .slice(1)
                    .map((r) => r.name)
                    .join(", ")}
                  className="inline-flex items-center rounded-full bg-gray-100 dark:bg-white/8 border border-gray-200 dark:border-white/8 px-2 py-0.5 text-xs text-gray-500 font-medium whitespace-nowrap cursor-default shrink-0"
                >
                  +{rest}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right pr-1">Thao tác</div>,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-start gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-text-sub hover:text-theme-primary-start bg-olive-100"
              onClick={() => onEdit?.(row.original)}
              title="Chỉnh sửa"
            >
              <Pencil size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-theme-primary-start hover:text-theme-primary-end hover:bg-red-50"
              onClick={() => onDelete?.(row.original)}
              title="Xóa"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete],
  );

  return (
    <DataTable
      columns={columns}
      data={users}
      totalLabel="người dùng"
      isLoading={isLoading}
      isError={isError}
      errorMessage="Không thể tải dữ liệu người dùng. Vui lòng thử lại sau."
      emptyMessage="Không tìm thấy người dùng nào"
      manualPagination
      pageIndex={page}
      pageCount={totalPages}
      onPageChange={(p) => setPage(p)}
      pageSize={size}
      totalRows={total}
      toolbarLeft={
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-sub pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên, email..."
            className="h-9 w-52 rounded-lg border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card pl-8 pr-3 text-sm text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20 focus:border-theme-primary-start transition"
          />
        </div>
      }
      toolbarRight={
        <div className="flex items-center gap-2">
          <FilterSelect
            label="Vai trò"
            value={roleFilter}
            onChange={handleRoleChange}
            options={roleOptions}
          />
          <FilterSelect
            label="Trạng thái"
            value={statusFilter}
            onChange={handleStatusChange}
            options={[
              { value: "verified", label: "Đã xác minh" },
              { value: "unverified", label: "Chưa xác minh" },
            ]}
          />
        </div>
      }
    />
  );
}
