'use client';

/**
 * TicketDetailModal - Right slide-over panel for admin ticket detail
 *
 * Shows:
 *  - Customer info & ticket metadata
 *  - Original message (rendered HTML via prose)
 *  - Existing seller reply (if any)
 *  - Reply form (textarea → useReplyTicket)
 *  - Close ticket button (useCloseTicket)
 */

import { useRef, useState } from 'react';
import {
  X,
  Loader2,
  Send,
  CheckCircle2,
  MessageSquareReply,
  XCircle,
  User,
  Mail,
  Phone,
  Package,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import {
  useReplyTicket,
  useCloseTicket,
  useTicketDetail,
} from '../hooks/useTickets';
import { TICKET_STATUS_LABELS, TICKET_STATUS_STYLES } from '../types';
import type { ContactTicketResponse, ContactTicketStatus } from '../types';
import { cn } from '@/lib/utils';
import { fmtBackendDatetime } from '@/lib/formatters';

// ─────────────────────────────────────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ContactTicketStatus }) {
  const s = TICKET_STATUS_STYLES[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        s.badge,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
      {TICKET_STATUS_LABELS[status]}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Info row
// ─────────────────────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className='flex items-start gap-2.5'>
      <Icon size={14} className='text-gray-400 mt-0.5 shrink-0' />
      <div className='min-w-0'>
        <p className='text-xs text-gray-400'>{label}</p>
        <p className='text-sm text-gray-800 dark:text-gray-200 break-all'>
          {value}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

interface TicketDetailModalProps {
  ticket: ContactTicketResponse | null;
  onClose: () => void;
}

export function TicketDetailModal({ ticket, onClose }: TicketDetailModalProps) {
  const [replyText, setReplyText] = useState(() => '');
  const replyRef = useRef<HTMLTextAreaElement>(null);
  const prevIdRef = useRef<string | undefined>(undefined);

  // Fetch fresh ticket data (to get latest status/reply)
  const { data: freshTicket } = useTicketDetail(
    ticket?.contactTicketId ?? null,
  );
  const t = freshTicket ?? ticket;

  const { mutate: reply, isPending: replying } = useReplyTicket();
  const { mutate: close, isPending: closing } = useCloseTicket();

  // Reset reply text when the selected ticket changes (during render - avoids useEffect setState)
  const currentId = ticket?.contactTicketId;
  if (currentId !== prevIdRef.current) {
    prevIdRef.current = currentId;
    // Only reset if needed (avoid triggering unnecessary re-renders)
    if (replyText !== '') {
      // Schedule state reset outside the render cycle
      setTimeout(() => setReplyText(''), 0);
    }
  }

  const handleReply = () => {
    if (!t || !replyText.trim()) return;
    reply(
      { id: t.contactTicketId, body: { sellerReply: replyText.trim() } },
      { onSuccess: () => setReplyText('') },
    );
  };

  const handleClose = () => {
    if (!t) return;
    close(t.contactTicketId, { onSuccess: () => onClose() });
  };

  const isClosed = t?.status === 'CLOSED';
  const isOpen = !isClosed;

  if (!ticket) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 z-40 bg-black/30 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Panel */}
      <div className='fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl flex flex-col bg-white dark:bg-surface-base shadow-2xl overflow-hidden'>
        {/* ── Header ────────────────────────────────────── */}
        <div className='flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-gray-100 dark:border-white/8 shrink-0'>
          <div className='min-w-0'>
            <div className='flex items-center gap-2 mb-1'>
              {t && <StatusBadge status={t.status} />}
              <span className='font-mono text-xs text-gray-400'>
                #{t?.contactTicketId.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <h2 className='text-base font-semibold text-gray-900 dark:text-white line-clamp-2'>
              {t?.subject}
            </h2>
          </div>
          <button
            onClick={onClose}
            className='p-1.5 shrink-0 rounded-lg hover:bg-gray-100 dark:hover:bg-white/8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors'
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable body ───────────────────────────── */}
        <div className='flex-1 overflow-y-auto'>
          <div className='px-5 py-4 space-y-6'>
            {/* ── Customer info ───────────────────────── */}
            <section className='space-y-3 p-4 rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/8'>
              <h3 className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>
                Thông tin khách hàng
              </h3>
              <div className='space-y-2.5'>
                <InfoRow icon={User} label='Họ tên' value={t?.fullName} />
                <InfoRow icon={Mail} label='Email' value={t?.email} />
                <InfoRow icon={Phone} label='Điện thoại' value={t?.phone} />
                <InfoRow
                  icon={Package}
                  label='Đơn thuê liên quan'
                  value={t?.rentalOrderId}
                />
                <InfoRow
                  icon={Calendar}
                  label='Ngày gửi'
                  value={t ? fmtBackendDatetime(t.createdAt) : undefined}
                />
              </div>
            </section>

            {/* ── Original message ─────────────────────── */}
            <section>
              <h3 className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3'>
                Nội dung yêu cầu
              </h3>
              {t?.message ? (
                <div
                  className='rich-content text-sm text-gray-700 dark:text-gray-300'
                  dangerouslySetInnerHTML={{ __html: t.message }}
                />
              ) : (
                <p className='text-sm text-gray-400 italic'>
                  Không có nội dung
                </p>
              )}

              {/* Attachment */}
              {t?.attachmentUrl && (
                <a
                  href={t.attachmentUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='mt-3 inline-flex items-center gap-1.5 text-xs text-theme-primary-start hover:underline'
                >
                  <Package size={12} />
                  Xem tệp đính kèm
                </a>
              )}
            </section>

            {/* ── Existing reply ───────────────────────── */}
            {t?.sellerReply && (
              <section className='p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'>
                <div className='flex items-center gap-2 mb-2'>
                  <MessageSquareReply
                    size={14}
                    className='text-purple-600 dark:text-purple-400'
                  />
                  <span className='text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide'>
                    Phản hồi từ nhân viên
                  </span>
                </div>
                <p className='text-sm text-purple-800 dark:text-purple-200 whitespace-pre-wrap leading-relaxed'>
                  {t.sellerReply}
                </p>
                {t.repliedAt && (
                  <p className='mt-2 text-xs text-purple-500 dark:text-purple-400'>
                    {fmtBackendDatetime(t.repliedAt)}
                  </p>
                )}
              </section>
            )}
          </div>
        </div>

        {/* ── Footer: actions ───────────────────────────── */}
        <div className='shrink-0 border-t border-gray-100 dark:border-white/8 px-5 py-4 space-y-3 bg-white dark:bg-surface-base'>
          {/* Status update - always visible */}
          <div className='space-y-2'>
            <label className='text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5'>
              <RefreshCw size={12} />
              Trạng thái hiện tại
            </label>
            <div className='flex flex-wrap items-center gap-2'>
              {(
                ['IN_PROGRESS', 'RESOLVED', 'CLOSED'] as ContactTicketStatus[]
              ).map((s) => {
                const style = TICKET_STATUS_STYLES[s];
                const isActive = t?.status === s;
                return (
                  <span
                    key={s}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                      isActive
                        ? `${style.badge} border-current ring-2 ring-offset-1 ring-current/30`
                        : `${style.badge} border-transparent opacity-40`,
                    )}
                  >
                    <span
                      className={cn('w-1.5 h-1.5 rounded-full', style.dot)}
                    />
                    {TICKET_STATUS_LABELS[s]}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Reply + Close ticket - only when not closed */}
          {isOpen && (
            <>
              {/* Reply */}
              <div className='space-y-2 pt-1 border-t border-gray-100 dark:border-white/8'>
                <label className='text-xs font-medium text-gray-500 dark:text-gray-400'>
                  Phản hồi khách hàng
                </label>
                <textarea
                  ref={replyRef}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  placeholder='Nhập nội dung phản hồi…'
                  className='w-full resize-none rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-theme-primary-start/30'
                />
                <button
                  onClick={handleReply}
                  disabled={replying || !replyText.trim()}
                  className='flex items-center gap-2 px-4 py-2 bg-theme-primary-start hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all'
                >
                  {replying ? (
                    <Loader2 size={14} className='animate-spin' />
                  ) : (
                    <Send size={14} />
                  )}
                  Gửi phản hồi
                </button>
              </div>

              {/* Close ticket */}
              <div className='pt-1 border-t border-gray-100 dark:border-white/8'>
                <button
                  onClick={handleClose}
                  disabled={closing}
                  className='flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 text-sm font-medium rounded-lg transition-colors'
                >
                  {closing ? (
                    <Loader2 size={14} className='animate-spin' />
                  ) : (
                    <XCircle size={14} />
                  )}
                  Đóng ticket
                </button>
              </div>
            </>
          )}

          {/* Closed info */}
          {isClosed && (
            <div className='pt-1 border-t border-gray-100 dark:border-white/8 flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm'>
              <CheckCircle2 size={15} className='text-gray-400' />
              <span>
                Ticket đã đóng
                {t?.closedAt ? ` · ${fmtBackendDatetime(t.closedAt)}` : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
