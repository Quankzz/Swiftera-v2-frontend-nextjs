"use client";

import React from "react";
import Image from "next/image";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Banknote,
  Package,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Clock,
  BadgeCheck,
  Building2,
  Hash,
  Receipt,
  CalendarDays,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RentalOrderResponse } from "@/types/api.types";
import { fmt, fmtDate, fmtDatetime, fmtPhone } from "./utils";

// ─── Helper ─────────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
  highlight,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
  highlight?: "green" | "orange" | "blue" | "red" | "amber";
  onClick?: () => void;
}) {
  const highlightColors = {
    green: "text-emerald-600 dark:text-emerald-400",
    orange: "text-orange-600 dark:text-orange-400",
    blue: "text-blue-600 dark:text-blue-400",
    red: "text-red-600 dark:text-red-400",
    amber: "text-amber-600 dark:text-amber-400",
  };
  return (
    <div
      className={cn(
        "flex items-start gap-3 py-2.5 px-3 rounded-xl hover:bg-muted/40 transition-colors",
        onClick && "cursor-pointer",
      )}
      onClick={onClick}
    >
      <div className="size-8 sm:size-9 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5 leading-none">
          {label}
        </p>
        <p
          className={cn(
            "text-[12px] sm:text-[13px] font-semibold text-foreground leading-snug",
            mono && "font-mono",
            highlight && highlightColors[highlight],
          )}
        >
          {value || "—"}
        </p>
      </div>
      {onClick && (
        <ChevronRight className="size-4 text-muted-foreground/50 shrink-0 mt-1.5" />
      )}
    </div>
  );
}

function SectionCard({
  children,
  className,
  noPad,
}: {
  children: React.ReactNode;
  className?: string;
  noPad?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card overflow-hidden",
        className,
      )}
    >
      {noPad ? children : <div className="p-3 sm:p-4">{children}</div>}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  iconColor,
  title,
  badge,
  badgeClass,
  action,
}: {
  icon: React.ElementType;
  iconColor?: string;
  title: string;
  badge?: string | number;
  badgeClass?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border bg-muted/30 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className={cn("size-4", iconColor ?? "text-foreground")} />
        <h3 className="text-[12px] sm:text-[13px] font-bold text-foreground">
          {title}
        </h3>
        {badge != null && (
          <span
            className={cn(
              "text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-lg border",
              badgeClass ?? "bg-muted text-muted-foreground border-border",
            )}
          >
            {badge}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── Order Meta Card ────────────────────────────────────────────────────────

interface OrderMetaCardProps {
  order: RentalOrderResponse;
}

export function OrderMetaCard({ order }: OrderMetaCardProps) {
  const orderCode = order.rentalOrderId;

  const statusCfg = STATUS_CFG_SMALL[order.status];

  return (
    <SectionCard className="overflow-hidden shadow-sm">
      <SectionHeader
        icon={Receipt}
        iconColor="text-blue-500"
        title="Thông tin đơn hàng"
      />
      <div className="space-y-1">
        {/* Order code */}
        <div className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted/40 transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="size-8 sm:size-9 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
              <Hash className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                Mã đơn
              </p>
            </div>
          </div>
          <span className="text-[11px] sm:text-[12px] font-bold font-mono text-foreground text-right truncate ml-2">
            {orderCode}
          </span>
        </div>

        {/* Status badge */}
        <div className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted/40 transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={cn(
                "size-8 sm:size-9 rounded-lg flex items-center justify-center shrink-0",
                statusCfg.bgClass,
              )}
            >
              <statusCfg.icon className={cn("size-4", statusCfg.colorClass)} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                Trạng thái
              </p>
            </div>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-1 rounded-lg border ml-2",
              statusCfg.bgClass,
              statusCfg.colorClass,
              statusCfg.borderClass,
            )}
          >
            <span className={cn("size-1.5 rounded-full", statusCfg.dot)} />
            {statusCfg.label}
          </span>
        </div>

        {/* Placed at */}
        <div className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted/40 transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="size-8 sm:size-9 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
              <CalendarDays className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                Ngày đặt
              </p>
            </div>
          </div>
          <span className="text-[11px] sm:text-[12px] font-semibold text-foreground text-right ml-2">
            {fmtDatetime(order.placedAt)}
          </span>
        </div>

        {/* Hub */}
        {order.hubName && (
          <div className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-muted/40 transition-colors">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="size-8 sm:size-9 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                <Building2 className="size-4 text-emerald-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                  Hub xử lý
                </p>
              </div>
            </div>
            <span className="text-[11px] sm:text-[12px] font-semibold text-foreground text-right max-w-[120px] sm:max-w-[160px] truncate ml-2">
              {order.hubName}
            </span>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
// ─── Customer Info ─────────────────────────────────────────────────────────────

interface CustomerInfoProps {
  order: RentalOrderResponse;
  mode: "delivery" | "pickup";
}

export function CustomerInfo({ order, mode }: CustomerInfoProps) {
  const isPickup = mode === "pickup";
  const address = order.userAddress
    ? [
        order.userAddress.addressLine,
        order.userAddress.ward,
        order.userAddress.district,
        order.userAddress.city,
      ]
        .filter(Boolean)
        .join(", ")
    : (order.hubAddressLine ?? "");

  const recipientName =
    order.userAddress?.recipientName ?? order.hubName ?? "—";
  const phone = order.userAddress?.phoneNumber;

  return (
    <SectionCard className="overflow-hidden shadow-sm">
      <SectionHeader
        icon={isPickup ? RotateCcw : Truck}
        iconColor={isPickup ? "text-orange-500" : "text-blue-500"}
        title={isPickup ? "Thông tin thu hồi" : "Thông tin giao hàng"}
      />
      <div className="p-3 sm:p-4 space-y-1">
        <InfoRow
          icon={User}
          label={isPickup ? "Người thuê" : "Người nhận"}
          value={recipientName}
        />
        <InfoRow
          icon={Phone}
          label="Điện thoại"
          value={fmtPhone(phone) ?? "—"}
          mono
          highlight={phone ? "blue" : undefined}
        />
        <InfoRow
          icon={MapPin}
          label={isPickup ? "Địa chỉ thu hồi" : "Địa chỉ giao hàng"}
          value={address || "—"}
        />
      </div>
    </SectionCard>
  );
}

// ─── Rental Summary ──────────────────────────────────────────────────────────

interface RentalSummaryProps {
  order: RentalOrderResponse;
  showPickupDate?: boolean;
}

export function RentalSummary({ order, showPickupDate }: RentalSummaryProps) {
  const deposit = order.depositHoldAmount ?? 0;
  const penalty = order.penaltyChargeAmount ?? 0;
  const total = order.rentalFeeAmount + deposit;

  const isPickupMode = showPickupDate === true;

  return (
    <SectionCard className="overflow-hidden shadow-sm">
      <SectionHeader
        icon={Calendar}
        iconColor="text-violet-500"
        title="Thông tin thuê"
      />
      <div className="p-3 sm:p-4 space-y-4">
        {/* Date row */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/30 p-2.5 sm:p-3">
            <p className="text-[9px] sm:text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1 leading-none">
              {isPickupMode ? "Ngày bắt đầu thuê" : "Ngày giao hàng"}
            </p>
            <p className="text-[13px] sm:text-[14px] font-black text-blue-600 dark:text-blue-400">
              {fmtDate(
                isPickupMode
                  ? (order.actualDeliveryAt ?? order.expectedDeliveryDate)
                  : (order.actualDeliveryAt ?? order.expectedDeliveryDate),
              )}
            </p>
            {isPickupMode && order.actualDeliveryAt && (
              <p className="text-[9px] sm:text-[10px] text-blue-400 mt-1">
                Đã giao thực tế
              </p>
            )}
            {!isPickupMode && order.actualDeliveryAt && (
              <p className="text-[9px] sm:text-[10px] text-blue-400 mt-1">
                Đã giao thực tế
              </p>
            )}
          </div>
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30 p-2.5 sm:p-3">
            <p className="text-[9px] sm:text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1 leading-none">
              {isPickupMode ? "Ngày trả thực tế" : "Ngày kết thúc dự kiến"}
            </p>
            <p className="text-[13px] sm:text-[14px] font-black text-amber-600 dark:text-amber-400">
              {fmtDate(
                isPickupMode
                  ? order.status === "PICKED_UP" || order.status === "COMPLETED"
                    ? order.actualRentalEndAt
                    : order.expectedRentalEndDate
                  : order.expectedRentalEndDate,
              )}
            </p>
            {isPickupMode && order.actualRentalEndAt && (
              <p className="text-[9px] sm:text-[10px] text-amber-400 mt-1">
                Đã trả thực tế
              </p>
            )}
            {!isPickupMode && (
              <p className="text-[9px] sm:text-[10px] text-amber-400 mt-1">
                Dự kiến
              </p>
            )}
          </div>
        </div>

        {/* Financial breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-muted/30 transition-colors">
            <span className="text-[12px] sm:text-[13px] text-muted-foreground flex items-center gap-2">
              <Package className="size-4" /> Phí thuê
            </span>
            <span className="text-[13px] sm:text-[14px] font-bold text-foreground">
              {fmt(order.rentalFeeAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-muted/30 transition-colors">
            <span className="text-[12px] sm:text-[13px] text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="size-4" /> Tiền đặt cọc
            </span>
            <span className="text-[13px] sm:text-[14px] font-bold text-blue-600 dark:text-blue-400">
              {fmt(deposit)}
            </span>
          </div>
          {penalty > 0 && (
            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200/40 dark:border-orange-800/20">
              <span className="text-[12px] sm:text-[13px] text-orange-600 dark:text-orange-400 flex items-center gap-2 font-semibold">
                <ShieldAlert className="size-4" /> Phí phạt
              </span>
              <span className="text-[13px] sm:text-[14px] font-bold text-orange-600 dark:text-orange-400">
                +{fmt(penalty)}
              </span>
            </div>
          )}
          {/* Total */}
          <div className="flex items-center justify-between py-2.5 sm:py-3 px-3 rounded-xl bg-muted/50 border border-border mt-1">
            <span className="text-[12px] sm:text-[13px] font-bold text-foreground uppercase tracking-wide">
              Tổng cộng
            </span>
            <span className="text-[15px] sm:text-[16px] font-black text-emerald-600 dark:text-emerald-400">
              {fmt(total)}
            </span>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Order Items List ─────────────────────────────────────────────────────────

interface OrderItemsListProps {
  order: RentalOrderResponse;
  mode: "confirm" | "delivered" | "pickup" | "returned";
  linePenalties?: Record<string, number>;
  compact?: boolean;
}

export function OrderItemsList({
  order,
  mode,
  linePenalties,
  compact = false,
}: OrderItemsListProps) {
  const totalPenalty = Object.values(linePenalties ?? {}).reduce(
    (s, v) => s + v,
    0,
  );
  const hasPenalty = totalPenalty > 0;
  const items = order.rentalOrderLines;

  const statusLabel =
    mode === "confirm"
      ? "Danh sách thiết bị"
      : mode === "delivered"
        ? "Thiết bị đã bàn giao"
        : mode === "pickup"
          ? "Thiết bị cần thu hồi"
          : "Thiết bị đã thu hồi";

  const badgeClass =
    mode === "confirm"
      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800"
      : mode === "delivered"
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
        : mode === "pickup"
          ? "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200 dark:border-orange-800"
          : hasPenalty
            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800"
            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";

  return (
    <SectionCard noPad className="flex flex-col min-h-78 shadow-sm">
      {/* Header */}
      <SectionHeader
        icon={Package}
        iconColor="text-violet-500"
        title={statusLabel}
        badge={`${items.length} thiết bị`}
        badgeClass={badgeClass}
      />

      {/* Items - scroll when more than 2 items */}
      <div
        className={cn(
          "flex-1 overflow-y-auto custom-scrollbar max-h-78",
          compact ? " space-y-2" : "p-2 sm:p-3 space-y-2.5",
        )}
      >
        {items.map((line) => {
          const penalty = linePenalties?.[line.rentalOrderLineId] ?? 0;
          const photoUrl = line.photos?.[0]?.photoUrl;
          const hasLinePenalty = penalty > 0;

          const cardClass =
            mode === "delivered" || mode === "returned"
              ? hasLinePenalty
                ? "border-orange-300/50 bg-orange-50/50 dark:bg-orange-950/10"
                : "border-emerald-300/30 bg-emerald-50/30 dark:bg-emerald-950/5"
              : "border-border hover:border-blue-400/50 hover:shadow-sm";

          return (
            <div
              key={line.rentalOrderLineId}
              className={cn(
                "rounded-xl border p-3 sm:p-4 flex items-start gap-3 bg-card transition-all",
                cardClass,
              )}
            >
              {/* Product image */}
              <div
                className={cn(
                  "relative shrink-0 rounded-xl overflow-hidden bg-muted border border-border flex items-center justify-center",
                  compact ? "size-14" : "size-16 sm:size-20",
                )}
              >
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt={line.productNameSnapshot}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Package
                    className={cn(
                      "text-muted-foreground/30",
                      compact ? "size-5" : "size-6 sm:size-7",
                    )}
                  />
                )}
                {mode === "delivered" && !hasLinePenalty && (
                  <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="size-5 text-emerald-600 drop-shadow-sm" />
                  </div>
                )}
                {mode === "returned" && hasLinePenalty && (
                  <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                    <ShieldAlert className="size-5 text-orange-600 drop-shadow-sm" />
                  </div>
                )}
              </div>

              {/* Product info */}
              <div className="min-w-0 flex-1 space-y-1.5">
                <p
                  className={cn(
                    "text-[13px] sm:text-[14px] font-bold text-foreground leading-snug line-clamp-2",
                    compact ? "" : "",
                  )}
                >
                  {line.productNameSnapshot}
                </p>

                {/* Serial */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {line.inventorySerialNumber || "—"}
                  </span>
                  {line.colorNameSnapshot && (
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground flex items-center gap-1">
                      {line.colorNameSnapshot}
                      {line.colorCodeSnapshot && (
                        <span
                          className="inline-block w-3 h-3 rounded-full border border-border/50 align-middle"
                          style={{
                            backgroundColor: line.colorCodeSnapshot ?? "#ccc",
                          }}
                        />
                      )}
                    </span>
                  )}
                </div>

                {/* Deposit */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] sm:text-[12px] font-semibold text-blue-600 dark:text-blue-400">
                    Cọc: {fmt(line.depositAmountSnapshot)}
                  </span>
                  {hasLinePenalty && (
                    <span className="text-[11px] sm:text-[12px] font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                      <ShieldAlert className="size-3" />
                      Phạt: {fmt(penalty)}
                    </span>
                  )}
                </div>
              </div>

              {/* Status indicator */}
              {mode === "delivered" && !hasLinePenalty && (
                <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-1" />
              )}
              {mode === "returned" && !hasLinePenalty && (
                <BadgeCheck className="size-5 text-emerald-500 shrink-0 mt-1" />
              )}
              {mode === "returned" && hasLinePenalty && (
                <ShieldAlert className="size-5 text-orange-500 shrink-0 mt-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Footer penalty summary */}
      {mode === "returned" && hasPenalty && (
        <div className="px-4 py-3 border-t border-orange-200/40 dark:border-orange-800/30 bg-orange-50/40 dark:bg-orange-950/10 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[12px] sm:text-[13px] font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-1.5">
              <ShieldAlert className="size-3.5" />
              Tổng phí phạt
            </span>
            <span className="text-[14px] sm:text-[15px] font-black text-orange-600 dark:text-orange-400">
              {fmt(totalPenalty)}
            </span>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ─── Overdue Alert ────────────────────────────────────────────────────────────

interface OverdueAlertProps {
  overdueDays?: number;
  expectedDate: string | null;
  type: "delivery" | "pickup";
}

export function OverdueAlert({
  overdueDays = 0,
  expectedDate,
  type,
}: OverdueAlertProps) {
  const isDelivery = type === "delivery";
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 dark:bg-destructive/10 p-4 flex items-center gap-3">
      <div className="size-12 rounded-2xl bg-destructive/15 flex items-center justify-center shrink-0">
        <AlertTriangle className="size-5 text-destructive" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-black text-destructive">
          {isDelivery ? "Trễ giao" : "Quá hạn thu hồi"}{" "}
          {overdueDays > 0 && `+${overdueDays} ngày`}
        </p>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          {isDelivery ? "Ngày giao dự kiến" : "Ngày kết thúc dự kiến"}:{" "}
          <span className="font-bold text-foreground">
            {fmtDate(expectedDate)}
          </span>
        </p>
      </div>
      {overdueDays > 0 && (
        <div className="px-3 py-2 rounded-xl bg-destructive/15 border border-destructive/25 shrink-0 text-center">
          <span className="text-[18px] font-black text-destructive leading-none">
            +{overdueDays}d
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Financial Settlement ──────────────────────────────────────────────────────

interface FinancialSettlementProps {
  order: RentalOrderResponse;
  penaltyOverride?: number;
}

export function FinancialSettlement({
  order,
  penaltyOverride,
}: FinancialSettlementProps) {
  const penalty = penaltyOverride ?? order.penaltyChargeAmount ?? 0;
  const deposit = order.depositHoldAmount ?? 0;
  const depositAfterPenalty = Math.max(0, deposit - penalty);
  const excessCharge = penalty > deposit ? penalty - deposit : 0;
  const isExcess = excessCharge > 0;

  const scenario: "no_damage" | "partial_refund" | "excess_charge" =
    penalty === 0 ? "no_damage" : isExcess ? "excess_charge" : "partial_refund";

  const scenarioBg = {
    no_damage:
      "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/30",
    partial_refund:
      "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/30",
    excess_charge:
      "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800/30",
  }[scenario];

  const scenarioText = {
    no_damage: "text-emerald-700 dark:text-emerald-300",
    partial_refund: "text-amber-700 dark:text-amber-300",
    excess_charge: "text-red-700 dark:text-red-300",
  }[scenario];

  const scenarioAmountColor = {
    no_damage: "text-emerald-600 dark:text-emerald-400",
    partial_refund: "text-amber-600 dark:text-amber-400",
    excess_charge: "text-red-600 dark:text-red-400",
  }[scenario];

  const scenarioLabel =
    scenario === "no_damage"
      ? "Không có phí phạt"
      : scenario === "partial_refund"
        ? "Trừ phí hư hỏng"
        : "Thu thêm từ khách";

  return (
    <SectionCard className="overflow-hidden shadow-sm">
      <SectionHeader
        icon={Banknote}
        iconColor="text-emerald-500"
        title="Quyết toán tài chính"
      />
      <div className="p-3 sm:p-4 space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/30 p-2.5 sm:p-3">
            <p className="text-[9px] sm:text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1 leading-none">
              Phí thuê
            </p>
            <p className="text-[14px] sm:text-[16px] font-black text-blue-600 dark:text-blue-400">
              {fmt(order.rentalFeeAmount)}
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30 p-2.5 sm:p-3">
            <p className="text-[9px] sm:text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1 leading-none">
              Tiền đặt cọc
            </p>
            <p className="text-[14px] sm:text-[16px] font-black text-emerald-600 dark:text-emerald-400">
              {fmt(deposit)}
            </p>
          </div>
        </div>

        {/* Penalty row */}
        {penalty > 0 && (
          <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200/40 dark:border-orange-800/20">
            <span className="text-[12px] sm:text-[13px] text-orange-600 dark:text-orange-400 flex items-center gap-2 font-semibold">
              <ShieldAlert className="size-4" /> Phí phạt tổng
            </span>
            <span className="text-[14px] sm:text-[15px] font-black text-orange-600 dark:text-orange-400">
              −{fmt(penalty)}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-border/50" />

        {/* Result */}
        <div
          className={cn(
            "rounded-2xl border px-3 sm:px-4 py-3 sm:py-3.5",
            scenarioBg,
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={cn(
                "text-[10px] sm:text-[11px] font-bold uppercase tracking-wide",
                scenarioText,
              )}
            >
              {scenarioLabel}
            </span>
            {scenario !== "no_damage" && (
              <span
                className={cn(
                  "text-[16px] sm:text-[18px] font-black tabular-nums",
                  scenarioAmountColor,
                )}
              >
                {isExcess ? fmt(excessCharge) : fmt(depositAfterPenalty)}
              </span>
            )}
          </div>
          {scenario === "no_damage" && (
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={cn("size-4 shrink-0", scenarioAmountColor)}
              />
              <span
                className={cn(
                  "text-[11px] sm:text-[12px] font-semibold leading-relaxed",
                  scenarioText,
                )}
              >
                Hoàn toàn bộ tiền cọc {fmt(deposit)} cho khách
              </span>
            </div>
          )}
          {scenario === "partial_refund" && (
            <p
              className={cn(
                "text-[11px] sm:text-[12px] leading-relaxed",
                scenarioText,
              )}
            >
              Cọc {fmt(deposit)} − Phạt {fmt(penalty)} ={" "}
              <strong>Hoàn {fmt(depositAfterPenalty)}</strong>
            </p>
          )}
          {scenario === "excess_charge" && (
            <p
              className={cn(
                "text-[11px] sm:text-[12px] leading-relaxed",
                scenarioText,
              )}
            >
              Phạt {fmt(penalty)} − Cọc {fmt(deposit)} ={" "}
              <strong>Thu thêm {fmt(excessCharge)}</strong>
            </p>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Tiny status config for OrderMetaCard ─────────────────────────────────────

// Inline mini STATUS_CFG to avoid circular import
const STATUS_CFG_SMALL: Record<
  string,
  {
    icon: React.ElementType;
    label: string;
    colorClass: string;
    bgClass: string;
    borderClass: string;
    dot: string;
  }
> = {
  PAID: {
    icon: Clock,
    label: "Chờ xác nhận",
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-50 dark:bg-amber-950/30",
    borderClass: "border-amber-200 dark:border-amber-800/30",
    dot: "bg-amber-500",
  },
  PREPARING: {
    icon: Package,
    label: "Đang chuẩn bị",
    colorClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-50 dark:bg-blue-950/30",
    borderClass: "border-blue-200 dark:border-blue-800/30",
    dot: "bg-blue-500 animate-pulse",
  },
  DELIVERING: {
    icon: Truck,
    label: "Đang giao",
    colorClass: "text-cyan-600 dark:text-cyan-400",
    bgClass: "bg-cyan-50 dark:bg-cyan-950/30",
    borderClass: "border-cyan-200 dark:border-cyan-800/30",
    dot: "bg-cyan-500 animate-pulse",
  },
  DELIVERED: {
    icon: CheckCircle2,
    label: "Đã giao",
    colorClass: "text-teal-600 dark:text-teal-400",
    bgClass: "bg-teal-50 dark:bg-teal-950/30",
    borderClass: "border-teal-200 dark:border-teal-800/30",
    dot: "bg-teal-500",
  },
  PENDING_PICKUP: {
    icon: RotateCcw,
    label: "Chờ thu hồi",
    colorClass: "text-orange-600 dark:text-orange-400",
    bgClass: "bg-orange-50 dark:bg-orange-950/30",
    borderClass: "border-orange-200 dark:border-orange-800/30",
    dot: "bg-orange-500 animate-pulse",
  },
  PICKING_UP: {
    icon: RotateCcw,
    label: "Đang thu hồi",
    colorClass: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-50 dark:bg-purple-950/30",
    borderClass: "border-purple-200 dark:border-purple-800/30",
    dot: "bg-purple-500 animate-pulse",
  },
  PICKED_UP: {
    icon: Package,
    label: "Đã thu hồi",
    colorClass: "text-indigo-600 dark:text-indigo-400",
    bgClass: "bg-indigo-50 dark:bg-indigo-950/30",
    borderClass: "border-indigo-200 dark:border-indigo-800/30",
    dot: "bg-indigo-500",
  },
  RETURNING: {
    icon: RotateCcw,
    label: "Đang trả hàng",
    colorClass: "text-violet-600 dark:text-violet-400",
    bgClass: "bg-violet-50 dark:bg-violet-950/30",
    borderClass: "border-violet-200 dark:border-violet-800/30",
    dot: "bg-violet-500 animate-pulse",
  },
  COMPLETED: {
    icon: CheckCircle2,
    label: "Hoàn tất",
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
    borderClass: "border-emerald-200 dark:border-emerald-800/30",
    dot: "bg-emerald-500",
  },
  CANCELLED: {
    icon: AlertTriangle,
    label: "Đã hủy",
    colorClass: "text-red-600 dark:text-red-400",
    bgClass: "bg-red-50 dark:bg-red-950/30",
    borderClass: "border-red-200 dark:border-red-800/30",
    dot: "bg-red-500",
  },
};
