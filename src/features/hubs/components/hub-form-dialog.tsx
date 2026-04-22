"use client";

import { useState, useEffect, startTransition } from "react";
import { X, Loader2, MapPin, AlertCircle, Map } from "lucide-react";
import dynamic from "next/dynamic";
import type { PickedLocation } from "@/components/map/LocationPickerModal";
const LocationPickerModal = dynamic(
  () =>
    import("@/components/map/LocationPickerModal").then(
      (m) => m.LocationPickerModal,
    ),
  { ssr: false },
);
import { toast } from "sonner";
import type { HubResponse } from "@/features/hubs/types";
import {
  useCreateHubMutation,
  useUpdateHubMutation,
  useHubQuery,
} from "@/features/hubs/hooks/use-hub-management";
import { normalizeError } from "@/api/apiService";

// ─────────────────────────────────────────────────────────────────────────────
// Form State
// ─────────────────────────────────────────────────────────────────────────────

interface FormState {
  code: string;
  name: string;
  addressLine: string;
  ward: string;
  district: string;
  city: string;
  latitude: string; // string để bind input number
  longitude: string;
  phone: string;
  isActive: boolean;
}

function initForm(hub: HubResponse | null): FormState {
  if (!hub) {
    return {
      code: "",
      name: "",
      addressLine: "",
      ward: "",
      district: "",
      city: "",
      latitude: "",
      longitude: "",
      phone: "",
      isActive: true,
    };
  }
  return {
    code: hub.code,
    name: hub.name,
    addressLine: hub.addressLine ?? "",
    ward: hub.ward ?? "",
    district: hub.district ?? "",
    city: hub.city ?? "",
    latitude: hub.latitude != null ? String(hub.latitude) : "",
    longitude: hub.longitude != null ? String(hub.longitude) : "",
    phone: hub.phone ?? "",
    isActive: hub.isActive,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface HubFormDialogProps {
  /** null → create mode; hub → edit mode */
  target: HubResponse | null;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function HubFormDialog({ target, onClose }: HubFormDialogProps) {
  const isEdit = target !== null;
  const hubId = target?.hubId;

  // Fetch fresh data khi edit để tránh stale data
  const { data: freshHub, isFetching: isFetchingHub } = useHubQuery(
    isEdit ? hubId : undefined,
  );

  const [form, setForm] = useState<FormState>(() => initForm(target));

  // Sync form khi fresh data load xong
  useEffect(() => {
    if (freshHub) {
      startTransition(() => {
        setForm(initForm(freshHub));
      });
    }
  }, [freshHub]);

  const createMutation = useCreateHubMutation();
  const updateMutation = useUpdateHubMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (isEdit && hubId) {
        // PATCH - chỉ gửi các field có thể update (code không trong PATCH body)
        await updateMutation.mutateAsync({
          hubId,
          payload: {
            name: form.name,
            addressLine: form.addressLine || null,
            ward: form.ward || null,
            district: form.district || null,
            city: form.city || null,
            latitude: form.latitude !== "" ? parseFloat(form.latitude) : null,
            longitude:
              form.longitude !== "" ? parseFloat(form.longitude) : null,
            phone: form.phone || null,
            isActive: form.isActive,
          },
        });
        toast.success(`Đã cập nhật hub "${form.name}" thành công`);
      } else {
        // POST - gửi code + name (required) + optional fields
        await createMutation.mutateAsync({
          code: form.code,
          name: form.name,
          addressLine: form.addressLine || null,
          ward: form.ward || null,
          district: form.district || null,
          city: form.city || null,
          latitude: form.latitude !== "" ? parseFloat(form.latitude) : null,
          longitude: form.longitude !== "" ? parseFloat(form.longitude) : null,
          phone: form.phone || null,
        });
        toast.success(`Đã tạo hub "${form.name}" thành công`);
      }
      onClose();
    } catch (err) {
      const appErr = normalizeError(err);
      toast.error(appErr.message);
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-xl bg-white dark:bg-surface-card shadow-2xl max-h-[90vh] flex flex-col">
        {/* Loading overlay khi đang fetch fresh data */}
        {isFetchingHub && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 dark:bg-surface-card/60 rounded-xl">
            <Loader2 className="size-6 animate-spin text-theme-primary-start" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/8 px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-theme-primary-start/10">
              <MapPin size={18} className="text-theme-primary-start" />
            </div>
            <h2 className="text-base font-semibold text-text-main">
              {isEdit ? "Chỉnh sửa hub" : "Tạo hub mới"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-md text-text-sub transition hover:bg-gray-100 dark:hover:bg-white/8 hover:text-text-main"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form
          id="hub-form"
          onSubmit={handleSubmit}
          className="overflow-y-auto flex-1 px-6 py-5 space-y-5"
        >
          {/* Required fields */}
          <div className="rounded-lg border border-gray-100 dark:border-white/8 p-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-sub">
              Thông tin bắt buộc
            </p>

            {/* Code - chỉ required khi tạo mới, không sửa được khi edit */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-main">
                Mã hub <span className="text-red-500">*</span>
              </label>
              {isEdit ? (
                <div className="flex items-center gap-2 rounded-md border border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-white/4 px-3 py-2">
                  <span className="font-mono text-sm text-text-sub">
                    {form.code}
                  </span>
                  <span className="ml-auto text-xs text-text-sub italic">
                    (không thể thay đổi)
                  </span>
                </div>
              ) : (
                <input
                  type="text"
                  required
                  placeholder="VD: HCM-01"
                  value={form.code}
                  onChange={(e) => set("code", e.target.value.toUpperCase())}
                  className="w-full rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 py-2 text-sm text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-theme-primary-start/30"
                />
              )}
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-main">
                Tên hub <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Hub Hồ Chí Minh - Quận 1"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="w-full rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 py-2 text-sm text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-theme-primary-start/30"
              />
            </div>
          </div>

          {/* Address fields */}
          <div className="rounded-lg border border-gray-100 dark:border-white/8 p-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-sub">
              Địa chỉ (tùy chọn)
            </p>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-main">
                Số nhà / Đường
              </label>
              <input
                type="text"
                placeholder="VD: 123 Lê Lợi"
                value={form.addressLine}
                onChange={(e) => set("addressLine", e.target.value)}
                className="w-full rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 py-2 text-sm text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-theme-primary-start/30"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-main">
                  Phường / Xã
                </label>
                <input
                  type="text"
                  placeholder="VD: Phường Bến Nghé"
                  value={form.ward}
                  onChange={(e) => set("ward", e.target.value)}
                  className="w-full rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 py-2 text-sm text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-theme-primary-start/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-main">
                  Quận / Huyện
                </label>
                <input
                  type="text"
                  placeholder="VD: Quận 1"
                  value={form.district}
                  onChange={(e) => set("district", e.target.value)}
                  className="w-full rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 py-2 text-sm text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-theme-primary-start/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-main">
                  Thành phố / Tỉnh
                </label>
                <input
                  type="text"
                  placeholder="VD: Hồ Chí Minh"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  className="w-full rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 py-2 text-sm text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-theme-primary-start/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-main">
                Vị trí trên bản đồ
              </label>

              {/* Hiển thị tọa độ đã chọn */}
              {form.latitude && form.longitude ? (
                <div className="flex items-center gap-2 rounded-md border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 px-3 py-2">
                  <MapPin
                    size={14}
                    className="text-green-600 dark:text-green-400 shrink-0"
                  />
                  <span className="text-sm font-mono text-text-main flex-1">
                    {parseFloat(form.latitude).toFixed(6)},{" "}
                    {parseFloat(form.longitude).toFixed(6)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      set("latitude", "");
                      set("longitude", "");
                    }}
                    className="flex size-5 items-center justify-center rounded text-text-sub hover:text-red-500 transition"
                    title="Xóa vị trí"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-text-sub italic">Chưa chọn vị trí</p>
              )}

              <button
                type="button"
                onClick={() => setLocationPickerOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 py-1.5 text-sm font-medium text-text-main transition hover:bg-gray-50 dark:hover:bg-white/5 hover:border-theme-primary-start/40"
              >
                <Map size={14} className="text-theme-primary-start" />
                {form.latitude && form.longitude
                  ? "Đổi vị trí"
                  : "Chọn trên bản đồ"}
              </button>
            </div>
          </div>

          {/* Contact + Status */}
          <div className="rounded-lg border border-gray-100 dark:border-white/8 p-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-sub">
              Liên hệ &amp; Trạng thái
            </p>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-main">
                Số điện thoại
              </label>
              <input
                type="tel"
                placeholder="VD: 02812345678"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="w-full rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 py-2 text-sm text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-theme-primary-start/30"
              />
            </div>

            {/* isActive - chỉ hiện khi edit */}
            {isEdit && (
              <div className="flex items-center gap-3">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={form.isActive}
                    onChange={(e) => set("isActive", e.target.checked)}
                  />
                  <div className="peer h-5 w-9 rounded-full bg-gray-200 dark:bg-white/10 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-4" />
                </label>
                <span className="text-sm text-text-main">
                  {form.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                </span>
              </div>
            )}
          </div>

          {/* Note về lỗi */}
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>
              Các lỗi nghiệp vụ (mã hub đã tồn tại, v.v.) sẽ được hiển thị theo
              thông báo từ hệ thống.
            </span>
          </div>
        </form>

        {/* Location picker modal - render outside form để không conflict với form submit */}
        {locationPickerOpen && (
          <LocationPickerModal
            initialLat={form.latitude ? parseFloat(form.latitude) : undefined}
            initialLng={form.longitude ? parseFloat(form.longitude) : undefined}
            onConfirm={(loc: PickedLocation) => {
              set("latitude", String(loc.lat));
              set("longitude", String(loc.lng));
              setLocationPickerOpen(false);
            }}
            onClose={() => setLocationPickerOpen(false)}
          />
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 dark:border-white/8 px-6 py-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 dark:border-white/8 px-4 py-2 text-sm font-medium text-text-main transition hover:bg-gray-50 dark:hover:bg-white/5"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="hub-form"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-theme-primary-start px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Lưu thay đổi" : "Tạo hub"}
          </button>
        </div>
      </div>
    </div>
  );
}
