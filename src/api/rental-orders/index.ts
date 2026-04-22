/**
 * Rental Orders API - re-export từ rentalOrderApi.ts
 * (module 12: API-074 → API-081)
 *
 * Import từ đây hoặc trực tiếp từ rentalOrderApi.ts đều được.
 */

export * from "@/api/rentalOrderApi";

import type { RentalOrderStatus } from "@/types/dashboard";

export const RENTAL_ORDER_STATUSES: {
  value: RentalOrderStatus;
  label: string;
}[] = [
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "DELIVERING", label: "Đang giao hàng" },
  { value: "ACTIVE", label: "Đang thuê" },
  { value: "RETURNING", label: "Đang thu hồi" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];
