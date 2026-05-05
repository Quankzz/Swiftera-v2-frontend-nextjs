"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MessageSquare,
  ArrowLeft,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  RefreshCw,
  XCircle,
  User,
  Mail,
  Phone,
  Package,
  Calendar,
  MessageSquareReply,
} from "lucide-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faCheckCircle,
  faTimesCircle,
  faList,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import {
  useMyTickets,
  useTicketDetail,
} from "@/features/tickets/hooks/useTickets";
import {
  TICKET_STATUS_LABELS,
  TICKET_STATUS_STYLES,
  type ContactTicketResponse,
  type ContactTicketStatus,
} from "@/features/tickets/types";
import { cn } from "@/lib/utils";
import { fmtBackendDatetime, fmtBackendDate } from "@/lib/formatters";

function StatusBadge({ status }: { status: ContactTicketStatus }) {
  const s = TICKET_STATUS_STYLES[status];
  const iconMap: Record<
    ContactTicketStatus,
    { icon: any; colorClass: string }
  > = {
    IN_PROGRESS: { icon: faSpinner, colorClass: 'text-amber-500' },
    RESOLVED: { icon: faCheckCircle, colorClass: 'text-green-500' },
    CLOSED: { icon: faTimesCircle, colorClass: 'text-gray-800' },
  };
  const iconInfo = iconMap[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        s.badge,
      )}
    >
      <FontAwesomeIcon
        icon={iconInfo.icon}
        className={cn('size-3.5 mr-1', iconInfo.colorClass)}
      />
      {/* hide the small dot for CLOSED status */}
      {status !== 'CLOSED' && (
        <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
      )}
      {TICKET_STATUS_LABELS[status]}
    </span>
  );
}

  const STATUS_TABS: {
    label: string;
    value: ContactTicketStatus | "ALL";
    icon?: any;
    color?: string;
    activeClass?: string;
  }[] = [
    { label: "Tất cả", value: "ALL", icon: faList, color: 'text-gray-600', activeClass: 'bg-blue-600 text-white shadow-sm' },
    { label: "Đang xử lý", value: "IN_PROGRESS", icon: faSpinner, color: 'text-amber-600', activeClass: 'bg-amber-600 text-white shadow-sm' },
    { label: "Đã giải quyết", value: "RESOLVED", icon: faCheckCircle, color: 'text-green-500', activeClass: 'bg-green-600 text-white shadow-sm' },
    { label: "Đã đóng", value: "CLOSED", icon: faTimesCircle, color: 'text-gray-700', activeClass: 'bg-gray-800 text-white shadow-sm' },
  ];

function TicketDetailView({
  ticket,
  onClose,
}: {
  ticket: ContactTicketResponse;
  onClose: () => void;
}) {
  const { data: freshTicket } = useTicketDetail(ticket.contactTicketId);
  const t = freshTicket ?? ticket;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl flex flex-col bg-white dark:bg-surface-base shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-gray-100 dark:border-white/8 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {t && <StatusBadge status={t.status} />}
              <span className="font-mono text-xs text-gray-400">
                #{t?.contactTicketId.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
              {t?.subject}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 shrink-0 rounded-lg hover:bg-gray-100 dark:hover:bg-white/8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-4 space-y-6">
            {/* Customer info */}
            <section className="space-y-3 p-4 rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Thông tin yêu cầu
              </h3>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <User size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Họ tên</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {t?.fullName ?? "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Mail size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200 break-all">
                      {t?.email ?? "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Điện thoại</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {t?.phone ?? "-"}
                    </p>
                  </div>
                </div>
                {t?.rentalOrderId && (
                  <div className="flex items-start gap-2.5">
                    <Package
                      size={14}
                      className="text-gray-400 mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-xs text-gray-400">
                        Đơn thuê liên quan
                      </p>
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-mono">
                        #{t.rentalOrderId.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2.5">
                  <Calendar
                    size={14}
                    className="text-gray-400 mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-xs text-gray-400">Ngày gửi</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {t ? fmtBackendDatetime(t.createdAt) : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Original message */}
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Nội dung yêu cầu
              </h3>
              {t?.message ? (
                <div
                  className="rich-content text-sm text-gray-700 dark:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: t.message }}
                />
              ) : (
                <p className="text-sm text-gray-400 italic">
                  Không có nội dung
                </p>
              )}

              {/* Attachment */}
              {t?.attachmentUrl && (
                <a
                  href={t.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-500 hover:underline"
                >
                  <Package size={12} />
                  Xem tệp đính kèm
                </a>
              )}
            </section>

            {/* Seller reply */}
            {t?.sellerReply ? (
              <section className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquareReply
                    size={14}
                    className="text-purple-600 dark:text-purple-400"
                  />
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                    Phản hồi từ nhân viên
                  </span>
                </div>
                <p className="text-sm text-purple-800 dark:text-purple-200 whitespace-pre-wrap leading-relaxed">
                  {t.sellerReply}
                </p>
                {t.repliedAt && (
                  <p className="mt-2 text-xs text-purple-500 dark:text-purple-400">
                    {fmtBackendDatetime(t.repliedAt)}
                  </p>
                )}
              </section>
            ) : (
              <section className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-white/8 text-center">
                <RefreshCw
                  size={16}
                  className="mx-auto text-gray-300 dark:text-gray-600 mb-2"
                />
                <p className="text-sm text-gray-400">
                  Chưa có phản hồi. Chúng tôi sẽ phản hồi trong vòng 24 giờ.
                </p>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function TicketCard({
  ticket,
  onClick,
}: {
  ticket: ContactTicketResponse;
  onClick: () => void;
}) {
  const s = TICKET_STATUS_STYLES[ticket.status];

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-5 rounded-xl border border-border/60 bg-card hover:border-blue-300/80 hover:bg-blue-50/20 dark:hover:bg-white/3 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-base font-semibold text-foreground line-clamp-1 flex-1">
          {ticket.subject}
        </h3>
        <StatusBadge status={ticket.status} />
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
        {ticket.message
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {fmtBackendDate(ticket.createdAt)}
        </span>
        {ticket.sellerReply && (
          <span className="inline-flex items-center gap-1.5 text-sm text-purple-600 dark:text-purple-400 font-medium">
            <CheckCircle2 size={13} />
            Đã phản hồi
          </span>
        )}
      </div>
    </button>
  );
}

export default function MyTicketsPage() {
  const [statusFilter, setStatusFilter] = useState<ContactTicketStatus | "ALL">(
    "ALL",
  );
  const [page, setPage] = useState(0);
  const [selectedTicket, setSelectedTicket] =
    useState<ContactTicketResponse | null>(null);

  const params = {
    page,
    size: 10,
    ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
  };
  const ticketsQuery = useMyTickets(params);
  const { data, isLoading, refetch } = ticketsQuery;

  // Ensure we trigger a refetch when the status or page changes (user interaction).
  const _firstMount = useRef(true);
  useEffect(() => {
    if (_firstMount.current) {
      _firstMount.current = false;
      return;
    }
    // refetch for the current params (the hook uses params in its query key)
    void refetch();
  }, [statusFilter, page, refetch]);

  const tickets = data?.content ?? [];
  // additionally filter client-side to make tabs immediately reflect selection
  const filteredTickets =
    statusFilter === 'ALL'
      ? tickets
      : tickets.filter((t) => t.status === statusFilter);
  const totalPages = data?.meta?.totalPages ?? 0;
  const totalElements = data?.meta?.totalElements ?? 0;

  return (
    <Layout>
      <section className="min-h-screen bg-muted/30 dark:bg-background py-10">
        <div className="mx-auto max-w-5xl px-4 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              render={<Link href="/" />}
            >
              <ArrowLeft className="size-4" />
              Trang chủ
            </Button>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <MessageSquare
                  size={22}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-foreground">
                  Yêu cầu hỗ trợ của tôi
                </h1>
                <p className="text-sm text-muted-foreground">
                  {totalElements > 0
                    ? `Bạn có ${totalElements} yêu cầu`
                    : "Chưa có yêu cầu nào"}
                </p>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => {
                    setStatusFilter(tab.value);
                    setPage(0);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-all",
                    statusFilter === tab.value ? tab.activeClass : "bg-muted text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  {tab.icon && (
                    <FontAwesomeIcon
                      icon={tab.icon}
                      className={cn('size-4', statusFilter === tab.value ? 'text-white' : tab.color)}
                    />
                  )}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Ticket list */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-6 animate-spin text-blue-500" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <MessageSquare size={24} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Chưa có yêu cầu nào
                </p>
                <p className="text-xs text-muted-foreground">
                  {statusFilter !== "ALL"
                    ? `Không có yêu cầu nào ở trạng thái "${STATUS_TABS.find((t) => t.value === statusFilter)?.label}"`
                    : "Gửi yêu cầu hỗ trợ để được giúp đỡ"}
                </p>
                <Button
                  size="sm"
                  className="mt-2 bg-blue-600 text-white hover:bg-blue-700"
                  render={<Link href="/feedback" />}
                >
                  Gửi yêu cầu mới
                </Button>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <MessageSquare size={24} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Không có yêu cầu nào
                </p>
                <p className="text-xs text-muted-foreground">
                  {`Không có yêu cầu nào ở trạng thái "${STATUS_TABS.find((t) => t.value === statusFilter)?.label}"`}
                </p>
                <Button
                  size="sm"
                  className="mt-2 bg-blue-600 text-white hover:bg-blue-700"
                  render={<Link href="/feedback" />}
                >
                  Gửi yêu cầu mới
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.contactTicketId}
                    ticket={ticket}
                    onClick={() => setSelectedTicket(ticket)}
                  />
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-4 border-t border-border/60">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      <ChevronLeft size={14} />
                      Trước
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Trang {page + 1} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages - 1, p + 1))
                      }
                      disabled={page >= totalPages - 1}
                    >
                      Sau
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Ticket detail panel */}
      {selectedTicket && (
        <TicketDetailView
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </Layout>
  );
}
