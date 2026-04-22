"use client";

import { useState } from "react";
import { ChevronDown, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FilterState {
  brands: string[];
  priceMin: string;
  priceMax: string;
}

export const EMPTY_FILTER: FilterState = {
  brands: [],
  priceMin: "",
  priceMax: "",
};

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface CatalogFilterProps {
  filterState: FilterState;
  onChange: (next: FilterState) => void;
  /**
   * All root categories to display as a checklist in the sidebar.
   * The active one (activeCategoryId) is pre-checked and read-only.
   */
  categoryOptions?: FilterOption[];
  /** ID of the currently selected root category (pre-checked, not changeable here) */
  activeCategoryId?: string;
  /** Callback when user clicks a different root category chip */
  onCategoryChange?: (id: string) => void;
  /**
   * Brands fetched from the API for the active category/subcategory.
   * When empty, the brand section is hidden.
   */
  brandOptions: FilterOption[];
  /** Callback to close the panel (mobile) */
  onClose?: () => void;
  className?: string;
}

function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

function formatVND(val: string) {
  const n = parseInt(val.replace(/\D/g, ""), 10);
  return isNaN(n) ? "" : n.toLocaleString("vi-VN");
}

function parseVND(val: string) {
  return val.replace(/\D/g, "");
}

// ─── FilterSection ────────────────────────────────────────────────────────────

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 dark:border-white/8 py-4 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-base font-semibold text-text-main"
      >
        {title}
        <ChevronDown
          className={cn(
            "size-5 text-text-sub transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

// ─── CheckList ────────────────────────────────────────────────────────────────

function CheckList({
  options,
  selected,
  onToggle,
}: {
  options: FilterOption[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? options : options.slice(0, 6);

  return (
    <div className="flex flex-col gap-3">
      {visible.map((opt) => (
        <label key={opt.id} className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={selected.includes(opt.id)}
            onChange={() => onToggle(opt.id)}
            className="size-5 rounded-sm border-gray-300 dark:border-white/20 accent-theme-primary-start"
          />
          <span className="flex-1 text-sm text-text-main">{opt.label}</span>
          {opt.count !== undefined && (
            <span className="text-xs text-text-sub">{opt.count}</span>
          )}
        </label>
      ))}
      {options.length > 6 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-1 text-left text-sm font-medium text-theme-primary-start hover:underline"
        >
          {showAll ? "Thu gọn" : `+${options.length - 6} thêm`}
        </button>
      )}
    </div>
  );
}

// ─── Price presets ────────────────────────────────────────────────────────────

const PRICE_PRESETS = [
  { label: "Dưới 50K", min: "", max: "50000" },
  { label: "50K – 100K", min: "50000", max: "100000" },
  { label: "100K – 200K", min: "100000", max: "200000" },
  { label: "200K – 300K", min: "200000", max: "300000" },
  { label: "300K – 500K", min: "300000", max: "500000" },
  { label: "500K – 700K", min: "500000", max: "700000" },
  { label: "700K – 1 triệu", min: "700000", max: "1000000" },
  { label: "Trên 1 triệu", min: "1000000", max: "" },
] as const;

// ─── Main component ───────────────────────────────────────────────────────────

export function CatalogFilter({
  filterState,
  onChange,
  categoryOptions = [],
  activeCategoryId,
  onCategoryChange,
  brandOptions,
  onClose,
  className,
}: CatalogFilterProps) {
  const hasActive =
    filterState.brands.length > 0 ||
    filterState.priceMin !== "" ||
    filterState.priceMax !== "";

  const set = (patch: Partial<FilterState>) =>
    onChange({ ...filterState, ...patch });

  return (
    <aside className={cn("flex flex-col", className)}>
      {/* Mobile header */}
      <div className="mb-3 flex items-center justify-between lg:hidden">
        <span className="text-base font-bold text-text-main">Bộ lọc</span>
        <div className="flex items-center gap-2">
          {hasActive && (
            <button
              type="button"
              onClick={() => onChange(EMPTY_FILTER)}
              className="flex items-center gap-1 text-sm font-medium text-theme-primary-start hover:underline"
            >
              <RotateCcw className="size-3.5" />
              Xoá tất cả
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm p-1 text-text-sub transition hover:bg-gray-100 dark:hover:bg-white/8"
            >
              <X className="size-5" />
            </button>
          )}
        </div>
      </div>

      {/* Desktop: Reset button */}
      {hasActive && (
        <div className="mb-3 hidden items-center justify-end lg:flex">
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTER)}
            className="flex items-center gap-1 text-sm font-medium text-theme-primary-start hover:underline"
          >
            <RotateCcw className="size-3.5" />
            Xoá bộ lọc
          </button>
        </div>
      )}

      {/* Active filter chips */}
      {/* {hasActive && (
        <div className='mb-3 flex flex-wrap gap-2'>
          {filterState.brands.map((b) => (
            <span
              key={b}
              className='flex items-center gap-1.5 rounded-full bg-theme-primary-start/10 px-3 py-1 text-xs font-medium text-theme-primary-start'
            >
              {b}
              <button
                type='button'
                onClick={() => set({ brands: toggle(filterState.brands, b) })}
              >
                <X className='size-3' />
              </button>
            </span>
          ))}
          {(filterState.priceMin !== '' || filterState.priceMax !== '') && (
            <span className='flex items-center gap-1.5 rounded-full bg-theme-primary-start/10 px-3 py-1 text-xs font-medium text-theme-primary-start'>
              {filterState.priceMin !== ''
                ? `${parseInt(filterState.priceMin, 10).toLocaleString('vi-VN')}₫`
                : '0₫'}
              {' – '}
              {filterState.priceMax !== ''
                ? `${parseInt(filterState.priceMax, 10).toLocaleString('vi-VN')}₫`
                : '∞'}
              <button
                type='button'
                onClick={() => set({ priceMin: '', priceMax: '' })}
              >
                <X className='size-3' />
              </button>
            </span>
          )}
        </div>
      )} */}

      {/* Filter body */}
      <div className="rounded-xl border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-4">
        {/* Danh mục - all root categories, active one is pre-checked */}
        {categoryOptions.length > 0 && (
          <FilterSection title="Danh mục">
            <div className="flex flex-col gap-3">
              {categoryOptions.map((cat) => {
                const isActive = cat.id === activeCategoryId;
                return (
                  <label
                    key={cat.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3",
                      isActive && "cursor-default",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => {
                        if (isActive) {
                          // Bỏ chọn danh mục hiện tại → trở về tất cả sản phẩm
                          onCategoryChange?.("");
                        } else {
                          onCategoryChange?.(cat.id);
                        }
                      }}
                      className="size-5 rounded-sm border-gray-300 dark:border-white/20 accent-theme-primary-start"
                    />
                    <span
                      className={cn(
                        "flex-1 text-sm",
                        isActive
                          ? "font-semibold text-theme-primary-start"
                          : "text-text-main",
                      )}
                    >
                      {cat.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </FilterSection>
        )}

        {/* Brand filter - only shown when brands are available from API */}
        {brandOptions.length > 0 && (
          <FilterSection title="Thương hiệu">
            <CheckList
              options={brandOptions}
              selected={filterState.brands}
              onToggle={(b) => set({ brands: toggle(filterState.brands, b) })}
            />
          </FilterSection>
        )}

        {/* Price filter */}
        <FilterSection title="Giá thuê / ngày">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={formatVND(filterState.priceMin)}
                  onChange={(e) => set({ priceMin: parseVND(e.target.value) })}
                  placeholder="Từ"
                  className="h-11 w-full rounded-sm border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 pl-3 pr-8 text-sm text-text-main placeholder:text-text-sub focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-sub">
                  ₫
                </span>
              </div>
              <span className="shrink-0 text-sm text-text-sub">-</span>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={formatVND(filterState.priceMax)}
                  onChange={(e) => set({ priceMax: parseVND(e.target.value) })}
                  placeholder="Đến"
                  className="h-11 w-full rounded-sm border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 pl-3 pr-8 text-sm text-text-main placeholder:text-text-sub focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-sub">
                  ₫
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {PRICE_PRESETS.map((p) => {
                const active =
                  filterState.priceMin === p.min &&
                  filterState.priceMax === p.max;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() =>
                      set(
                        active
                          ? { priceMin: "", priceMax: "" }
                          : { priceMin: p.min, priceMax: p.max },
                      )
                    }
                    className={cn(
                      "rounded-sm border px-2 py-2 text-xs font-medium transition",
                      active
                        ? "border-theme-primary-start bg-theme-primary-start/10 text-theme-primary-start"
                        : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-text-sub dark:text-text-main hover:border-gray-300 dark:hover:bg-white/10",
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </FilterSection>
      </div>
    </aside>
  );
}
