"use client";

/**
 * PolicyPdfPreview
 * ─────────────────────────────────────────────────────────────────────────────
 * - Mobile  (< 640px) : simple single-page image viewer, prev/next buttons
 * - Desktop (≥ 640px) : two-page HTMLFlipBook, CSS-scaled to fit container
 */

import { useEffect, useRef, useState, useCallback } from "react";
import HTMLFlipBook from "react-pageflip";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────

interface PolicyPdfPreviewProps {
  file?: File | null;
  pdfUrl?: string | null;
  className?: string;
}

const PDF_WORKER_SRC = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

// Flipbook requires forwardRef children
import { forwardRef } from "react";

const PageImage = forwardRef<
  HTMLDivElement,
  { src: string; pageNumber: number }
>(({ src, pageNumber }, ref) => (
  <div
    ref={ref}
    className="relative overflow-hidden bg-white select-none"
    style={{ width: "100%", height: "100%" }}
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={src}
      alt={`Trang ${pageNumber}`}
      className="w-full h-full object-contain"
      draggable={false}
    />
    <span className="absolute bottom-2 right-3 text-[10px] text-gray-400 font-mono select-none">
      {pageNumber}
    </span>
  </div>
));
PageImage.displayName = "PageImage";

// ─────────────────────────────────────────────────────────────────────────────

const MOBILE_BREAKPOINT = 640;
const BOOK_W = 480;
const BOOK_H = 600;

// ─────────────────────────────────────────────────────────────────────────────

export function PolicyPdfPreview({
  file,
  pdfUrl,
  className,
}: PolicyPdfPreviewProps) {
  const [pages, setPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [containerW, setContainerW] = useState(0); // 0 = mobile-first until measured
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flipBookRef = useRef<any>(null);

  // Measure container - ref is ALWAYS mounted so this fires correctly
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setContainerW(w);
    });
    ro.observe(el);
    if (el.clientWidth) setContainerW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Load PDF → render pages as images
  const loadPdf = useCallback(async (src: string | ArrayBuffer) => {
    setIsLoading(true);
    setError(null);
    setPages([]);
    setCurrentPage(0);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
      const pdf = await pdfjsLib.getDocument(
        typeof src === "string"
          ? { url: src, withCredentials: false }
          : { data: src },
      ).promise;
      const dataUrls: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.8 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        dataUrls.push(canvas.toDataURL("image/jpeg", 0.88));
      }
      setPages(dataUrls);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isNetwork =
        msg.includes("Failed to fetch") ||
        msg.includes("NetworkError") ||
        msg.includes("ERR_NAME_NOT_RESOLVED");
      setError(
        isNetwork
          ? "Không thể tải file PDF - URL không hợp lệ hoặc không truy cập được."
          : `Không thể đọc file PDF: ${msg}`,
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) loadPdf(e.target.result as ArrayBuffer);
      };
      reader.readAsArrayBuffer(file);
    } else if (pdfUrl) {
      loadPdf(pdfUrl);
    }
  }, [file, pdfUrl, loadPdf]);

  const totalPages = pages.length;
  const isMobile = containerW < MOBILE_BREAKPOINT;

  // Desktop flipbook scale
  const scale = containerW > 0 ? Math.min(1, containerW / (BOOK_W * 2)) : 1;
  const scaledH = Math.round(BOOK_H * scale);

  // ── Early return only for "no source" case ────────────────────────────────
  if (!file && !pdfUrl) return null;

  // containerRef is on the outermost wrapper so ResizeObserver fires immediately
  // and correctly measures width even during loading/error states.
  return (
    <div
      ref={containerRef}
      className={cn("flex w-full flex-col items-center gap-4", className)}
    >
      {isLoading ? (
        <div className="flex w-full flex-col items-center justify-center gap-3 py-16 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/4">
          <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
          <p className="text-sm text-muted-foreground">Đang tải PDF...</p>
        </div>
      ) : error ? (
        <div className="flex w-full flex-col items-center justify-center gap-3 py-10 rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-900/10">
          <AlertTriangle className="w-7 h-7 text-red-500" />
          <p className="text-sm text-red-600 dark:text-red-400 text-center px-4">
            {error}
          </p>
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-white/10 text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Thử mở trực tiếp
            </a>
          )}
        </div>
      ) : pages.length > 0 ? (
        <>
          {/* Page indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="w-4 h-4" />
            <span>
              Trang{" "}
              <span className="font-semibold text-foreground">
                {currentPage + 1}
              </span>{" "}
              / {totalPages}
            </span>
          </div>

          {isMobile ? (
            /* ── Mobile: plain image, full width, readable ─────────────────── */
            <div className="w-full rounded-lg overflow-hidden border border-gray-100 dark:border-white/10 bg-white shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pages[currentPage]}
                alt={`Trang ${currentPage + 1}`}
                className="w-full h-auto block"
                draggable={false}
              />
            </div>
          ) : (
            /* ── Desktop: two-page flipbook ─────────────────────────────────── */
            <div
              style={{
                width: "100%",
                height: scaledH,
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "top center",
                  width: BOOK_W * 2,
                  height: BOOK_H,
                  flexShrink: 0,
                }}
              >
                <HTMLFlipBook
                  ref={flipBookRef}
                  width={BOOK_W}
                  height={BOOK_H}
                  size="fixed"
                  minWidth={BOOK_W}
                  maxWidth={BOOK_W}
                  minHeight={BOOK_H}
                  maxHeight={BOOK_H}
                  drawShadow
                  flippingTime={600}
                  usePortrait={false}
                  startZIndex={0}
                  autoSize={false}
                  maxShadowOpacity={0.4}
                  showCover={false}
                  mobileScrollSupport
                  onFlip={(e: { data: number }) => setCurrentPage(e.data)}
                  className="shadow-2xl rounded-sm"
                  style={{}}
                  startPage={0}
                  clickEventForward
                  useMouseEvents
                  swipeDistance={30}
                  showPageCorners
                  disableFlipByClick={false}
                >
                  {pages.map((src, idx) => (
                    <PageImage key={idx} src={src} pageNumber={idx + 1} />
                  ))}
                </HTMLFlipBook>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (isMobile) setCurrentPage((p) => Math.max(0, p - 1));
                else flipBookRef.current?.pageFlip()?.flipPrev("top");
              }}
              disabled={currentPage === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Trước
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                const pageIdx =
                  totalPages <= 7 ? i : Math.round((i / 6) * (totalPages - 1));
                const isActive = Math.abs(currentPage - pageIdx) < 1;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (isMobile) setCurrentPage(pageIdx);
                      else flipBookRef.current?.pageFlip()?.flip(pageIdx);
                    }}
                    className={cn(
                      "rounded-full transition-all",
                      isActive
                        ? "w-2.5 h-2.5 bg-blue-500"
                        : "w-1.5 h-1.5 bg-gray-300 dark:bg-white/20 hover:bg-gray-400",
                    )}
                  />
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                if (isMobile)
                  setCurrentPage((p) => Math.min(totalPages - 1, p + 1));
                else flipBookRef.current?.pageFlip()?.flipNext("top");
              }}
              disabled={currentPage >= totalPages - 1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Sau
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
