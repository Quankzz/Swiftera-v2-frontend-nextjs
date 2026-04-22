/**
 * Customer voucher hooks - dùng cho phía khách hàng (cart, checkout, product detail)
 * Module 11: VOUCHERS (API-070)
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getVouchersList,
  validateVoucher,
  type VoucherValidateResponse,
} from "../api/voucher.service";
import type { VoucherResponse } from "../types";

/* ─── Normalized response ──────────────────────────────────────────────────── */

export interface CustomerVouchersData {
  items: VoucherResponse[];
  totalItems: number;
  totalPages: number;
}

/* ─── Queries ─────────────────────────────────────────────────────────────── */

/**
 * Lấy danh sách voucher đang active cho phía khách hàng
 * Filter: isActive:true - chỉ lấy voucher còn hiệu lực
 */
export function useCustomerVouchersQuery() {
  return useQuery({
    queryKey: ["vouchers", "customer"],
    queryFn: async () => {
      const res = await getVouchersList({ size: 50, filter: "isActive:true" });
      return {
        items: res.content ?? [],
        totalItems: res.meta?.totalElements ?? 0,
        totalPages: res.meta?.totalPages ?? 1,
      } satisfies CustomerVouchersData;
    },
    staleTime: 30_000,
    retry: false,
  });
}

/**
 * Validate voucher theo mã - gọi API-070 mỗi khi user nhập mã.
 * Truyền productId khi validate per-line voucher (ITEM_VOUCHER / PRODUCT_DISCOUNT).
 */
export function useValidateVoucherMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      code: string;
      rentalDurationDays: number;
      rentalSubtotalAmount: number;
      productId?: string;
    }) => validateVoucher(params),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["vouchers", "customer"] });
    },
  });
}

/* ─── Voucher apply state hook ─────────────────────────────────────────────── */

/**
 * Hook quản lý trạng thái apply voucher từ danh sách
 * Dùng trong cart page / voucher picker dialog
 */
export function useVoucherApply() {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState("");
  const [inputError, setInputError] = useState("");

  const validate = useValidateVoucherMutation();

  async function applyByCode(
    code: string,
    rentalDurationDays: number,
    rentalSubtotalAmount: number,
    onSuccess: (result: VoucherValidateResponse) => void,
    onError: (msg: string) => void,
    /** productId để check scope ITEM_VOUCHER / PRODUCT_DISCOUNT */
    productId?: string,
  ) {
    setInputError("");
    try {
      const result = await validate.mutateAsync({
        code: code.trim().toUpperCase(),
        rentalDurationDays,
        rentalSubtotalAmount,
        ...(productId ? { productId } : {}),
      });
      if (result.valid) {
        setSelectedCode(code.trim().toUpperCase());
        onSuccess(result);
      } else {
        setInputError("Voucher không hợp lệ hoặc chưa đủ điều kiện.");
        onError("Voucher không hợp lệ hoặc chưa đủ điều kiện.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Mã voucher không đúng.";
      setInputError(msg);
      onError(msg);
    }
  }

  function clearVoucher() {
    setSelectedCode(null);
    setInputCode("");
    setInputError("");
    validate.reset();
  }

  return {
    selectedCode,
    inputCode,
    setInputCode,
    inputError,
    isValidating: validate.isPending,
    applyByCode,
    clearVoucher,
  };
}
