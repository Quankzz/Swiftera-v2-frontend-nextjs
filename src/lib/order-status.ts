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
  PENDING: {
    label: 'Chờ xử lý',
    color: 'text-foreground',
    bg: 'bg-secondary',
    border: 'border-border',
    dot: 'bg-muted-foreground',
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'text-theme-primary-start',
    bg: 'bg-theme-primary-start/10',
    border: 'border-theme-primary-start/25',
    dot: 'bg-theme-primary-start',
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
    label: 'Đang trả',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/25',
    dot: 'bg-destructive animate-pulse',
    icon: RotateCcw,
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    border: 'border-border',
    dot: 'bg-muted-foreground',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    dot: 'bg-destructive',
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
  'PENDING',
  'CONFIRMED',
  'DELIVERING',
  'ACTIVE',
  'RETURNING',
  'OVERDUE',
  'COMPLETED',
  'CANCELLED',
];
