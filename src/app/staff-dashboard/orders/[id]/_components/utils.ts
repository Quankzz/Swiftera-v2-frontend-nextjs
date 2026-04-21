/**
 * Re-exports shared formatters and status config for order detail components.
 * Import from here to keep internal imports relative and stable.
 */
export { fmt, fmtDate, fmtDatetime, fmtPhone } from '@/lib/formatters';
export { STATUS_CFG } from '@/lib/order-status';
