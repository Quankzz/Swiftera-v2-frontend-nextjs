/**
 * Canonical order-status configuration — single source of truth used by both
 * the order list page and the order detail components.
 */
import { type ElementType } from 'react';
import {
  Clock,
  CheckCircle2,
  Truck,
  ShoppingBag,
  RotateCcw,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import type { OrderStatus } from '@/types/dashboard.types';

export interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
  icon: ElementType;
}

export const STATUS_CFG: Record<OrderStatus, StatusConfig> = {
  PENDING_PAYMENT: {
    label: 'Chờ thanh toán',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-700/30',
    dot: 'bg-orange-500 animate-pulse',
    icon: Clock,
  },
  PAID: {
    label: 'Chờ xác nhận',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-700/30',
    dot: 'bg-amber-500',
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    border: 'border-indigo-200 dark:border-indigo-700/30',
    dot: 'bg-indigo-500',
    icon: CheckCircle2,
  },
  DELIVERING: {
    label: 'Đang giao',
    color: 'text-info',
    bg: 'bg-info-muted',
    border: 'border-info-border',
    dot: 'bg-info animate-pulse',
    icon: Truck,
  },
  ACTIVE: {
    label: 'Đang thuê',
    color: 'text-success',
    bg: 'bg-success-muted',
    border: 'border-success-border',
    dot: 'bg-success',
    icon: ShoppingBag,
  },
  RETURNING: {
    label: 'Cần thu hồi',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-700/30',
    dot: 'bg-purple-500 animate-pulse',
    icon: RotateCcw,
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    border: 'border-teal-200 dark:border-teal-700/30',
    dot: 'bg-teal-500',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'text-slate-500 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-800/50',
    border: 'border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
    icon: XCircle,
  },
  OVERDUE: {
    label: 'Quá hạn',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    dot: 'bg-destructive animate-pulse',
    icon: AlertCircle,
  },
};

export const ALL_ORDER_STATUSES: OrderStatus[] = [
  'PENDING_PAYMENT',
  'PAID',
  'CONFIRMED',
  'DELIVERING',
  'ACTIVE',
  'RETURNING',
  'OVERDUE',
  'COMPLETED',
  'CANCELLED',
];
