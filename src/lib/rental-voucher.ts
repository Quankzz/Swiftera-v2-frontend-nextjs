export type RentalVoucherKind = "fixed" | "percent";

export interface RentalVoucher {
  id: string;
  code: string;
  title: string;
  description: string;
  kind: RentalVoucherKind;
  /** VND nếu kind=fixed, % nếu kind=percent */
  value: number;
  /** Tổng tiền thuê tối thiểu để áp dụng (VND) */
  minRental?: number;
}

export const defaultRentalVouchers: RentalVoucher[] = [
  {
    id: "v1",
    code: "SWIFTERA50K",
    title: "Giảm 50.000₫ tiền thuê",
    description: "Áp dụng cho đơn thuê từ 200.000₫",
    kind: "fixed",
    value: 50000,
    minRental: 200000,
  },
  {
    id: "v2",
    code: "THUE10",
    title: "Giảm 10% tiền thuê",
    description: "Tối đa áp dụng trên tổng tiền thuê (không áp dụng tiền cọc)",
    kind: "percent",
    value: 10,
  },
  {
    id: "v3",
    code: "WEEKEND",
    title: "Giảm 100.000₫ cuối tuần",
    description: "Ưu đãi cuối tuần - đơn từ 500.000₫",
    kind: "fixed",
    value: 100000,
    minRental: 500000,
  },
];

export function computeVoucherDiscount(
  totalRental: number,
  voucher: RentalVoucher,
): number {
  if (voucher.minRental != null && totalRental < voucher.minRental) return 0;
  if (voucher.kind === "fixed") {
    return Math.min(voucher.value, totalRental);
  }
  return Math.floor((totalRental * voucher.value) / 100);
}
