"use client";

import { useEffect, useRef, useState } from "react";
import { Truck, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const inputCls =
  "h-10 w-full rounded-xl border border-input bg-background px-3.5 text-sm placeholder:text-muted-foreground/60 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20";
const labelCls = "mb-1.5 block text-xs font-semibold text-muted-foreground";

export type AddressFormValues = {
  recipientName: string;
  phoneNumber: string;
  addressLine: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
};

const EMPTY: AddressFormValues = {
  recipientName: "",
  phoneNumber: "",
  addressLine: "",
  ward: "",
  district: "",
  city: "",
  isDefault: false,
};

export function AddressFormDialog({
  open,
  onOpenChange,
  title,
  submitLabel,
  initialValues,
  showDefaultCheckbox = false,
  isSubmitting = false,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  submitLabel: string;
  initialValues?: Partial<AddressFormValues>;
  showDefaultCheckbox?: boolean;
  isSubmitting?: boolean;
  onSubmit: (values: AddressFormValues) => void;
}) {
  const [form, setForm] = useState<AddressFormValues>(EMPTY);
  const prevOpen = useRef(false);

  useEffect(() => {
    if (open && !prevOpen.current) {
      setForm({ ...EMPTY, ...initialValues });
    }
    prevOpen.current = open;
  }, [open, initialValues]);

  const canSubmit =
    form.recipientName.trim() !== "" && form.phoneNumber.trim() !== "";

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({
      ...form,
      recipientName: form.recipientName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      addressLine: form.addressLine.trim(),
      ward: form.ward.trim(),
      district: form.district.trim(),
      city: form.city.trim(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50">
              <Truck className="size-4 text-blue-600 dark:text-blue-400" />
            </div>
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div>
            <label htmlFor="addr-recipient" className={labelCls}>
              <span className="flex items-center gap-1">
                <User className="size-3" />
                Họ và tên người nhận
                <span className="ml-0.5 text-blue-500">*</span>
              </span>
            </label>
            <input
              id="addr-recipient"
              type="text"
              placeholder="Nguyễn Văn A"
              value={form.recipientName}
              onChange={(e) =>
                setForm((f) => ({ ...f, recipientName: e.target.value }))
              }
              autoComplete="name"
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="addr-phone" className={labelCls}>
              <span className="flex items-center gap-1">
                <Phone className="size-3" />
                Số điện thoại
                <span className="ml-0.5 text-blue-500">*</span>
              </span>
            </label>
            <input
              id="addr-phone"
              type="tel"
              inputMode="tel"
              placeholder="09xx xxx xxx"
              value={form.phoneNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, phoneNumber: e.target.value }))
              }
              autoComplete="tel"
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="addr-line" className={labelCls}>
              Số nhà, tên đường
            </label>
            <input
              id="addr-line"
              type="text"
              placeholder="123 Đường Lê Lợi"
              value={form.addressLine}
              onChange={(e) =>
                setForm((f) => ({ ...f, addressLine: e.target.value }))
              }
              autoComplete="address-line1"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="addr-ward" className={labelCls}>
                Phường / Xã
              </label>
              <input
                id="addr-ward"
                type="text"
                placeholder="P. Bến Nghé"
                value={form.ward}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ward: e.target.value }))
                }
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="addr-district" className={labelCls}>
                Quận / Huyện
              </label>
              <input
                id="addr-district"
                type="text"
                placeholder="Q. 1"
                value={form.district}
                onChange={(e) =>
                  setForm((f) => ({ ...f, district: e.target.value }))
                }
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label htmlFor="addr-city" className={labelCls}>
              Tỉnh / Thành phố
            </label>
            <input
              id="addr-city"
              type="text"
              placeholder="TP. Hồ Chí Minh"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              autoComplete="address-level1"
              className={inputCls}
            />
          </div>

          {showDefaultCheckbox && (
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
              <input
                type="checkbox"
                className="size-4 rounded border-input accent-blue-600"
                checked={form.isDefault}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isDefault: e.target.checked }))
                }
              />
              Đặt làm địa chỉ mặc định
            </label>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="flex-1 rounded-xl"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            className="flex-1 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            type="button"
            disabled={!canSubmit || isSubmitting}
            onClick={handleSubmit}
          >
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
