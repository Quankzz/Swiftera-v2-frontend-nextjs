'use client';

/**
 * PolicyPdfPreview
 * ─────────────────────────────────────────────────────────────────────────────
 * Hiển thị PDF theo kiểu sách lật trang (react-pageflip).
 *
 * Nhận vào:
 *  - `file`   : File object (khi người dùng upload lần đầu, chưa có URL)
 *  - `pdfUrl` : URL chuỗi đến file PDF đã lưu trên storage
 *
 * Flow render:
 *  1. Load PDF bằng pdfjs-dist → lấy danh sách pages.
 *  2. Render mỗi page lên <canvas> → convert sang data URL.
 *  3. Feed danh sách ảnh vào HTMLFlipBook (react-pageflip).
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────

interface PolicyPdfPreviewProps {
  file?: File | null;
  pdfUrl?: string | null;
  className?: string;
}

// ─── Single page image forwarded to HTMLFlipBook ────────────────────────────
// react-pageflip yêu cầu child dùng React.forwardRef
import { forwardRef } from 'react';

const PageImage = forwardRef<
  HTMLDivElement,
  { src: string; pageNumber: number }
>(({ src, pageNumber }, ref) => (
  <div
    ref={ref}
    className='relative overflow-hidden bg-white shadow-md select-none'
    style={{ width: '100%', height: '100%' }}
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={src}
      alt={`Trang ${pageNumber}`}
      className='w-full h-full object-contain'
      draggable={false}
    />
    <span className='absolute bottom-2 right-3 text-[10px] text-gray-400 font-mono select-none'>
      {pageNumber}
    </span>
  </div>
));
PageImage.displayName = 'PageImage';

// ─────────────────────────────────────────────────────────────────────────────

export function PolicyPdfPreview({
  file,
  pdfUrl,
  className,
}: PolicyPdfPreviewProps) {
  const [pages, setPages] = useState<string[]>([]); // data URLs
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flipBookRef = useRef<any>(null);

  // ── Load PDF → render pages ────────────────────────────────────────────────
  const loadPdf = useCallback(async (src: string | ArrayBuffer) => {
    setIsLoading(true);
    setError(null);
    setPages([]);
    setCurrentPage(0);

    try {
      // Dynamic import để tránh SSR issues
      const pdfjsLib = await import('pdfjs-dist');

      // pdfjs-dist v5: worker src dùng .min.js (không phải .mjs)
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const loadingTask = pdfjsLib.getDocument(
        typeof src === 'string'
          ? { url: src, withCredentials: false }
          : { data: src },
      );
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      const dataUrls: string[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;

        dataUrls.push(canvas.toDataURL('image/jpeg', 0.85));
      }

      setPages(dataUrls);
    } catch (err) {
      console.error('[PolicyPdfPreview] load error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      const isNetwork =
        msg.includes('Failed to fetch') ||
        msg.includes('NetworkError') ||
        msg.includes('ERR_NAME_NOT_RESOLVED');
      setError(
        isNetwork
          ? 'Không thể tải file PDF - URL không hợp lệ hoặc không truy cập được.'
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
        if (e.target?.result) {
          loadPdf(e.target.result as ArrayBuffer);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (pdfUrl) {
      loadPdf(pdfUrl);
    }
  }, [file, pdfUrl, loadPdf]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const totalPages = pages.length;

  const goPrev = () => flipBookRef.current?.pageFlip()?.flipPrev('top');
  const goNext = () => flipBookRef.current?.pageFlip()?.flipNext('top');

  // ── States ──────────────────────────────────────────────────────────────────
  if (!file && !pdfUrl) return null;

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3 py-16 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/4',
          className,
        )}
      >
        <Loader2 className='w-7 h-7 animate-spin text-theme-primary-start' />
        <p className='text-sm text-text-sub'>Đang tải PDF...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-900/10',
          className,
        )}
      >
        <AlertTriangle className='w-7 h-7 text-red-500' />
        <p className='text-sm text-red-600 dark:text-red-400 text-center px-4'>
          {error}
        </p>
        {pdfUrl && (
          <a
            href={pdfUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-white/10 text-text-sub hover:bg-gray-100 dark:hover:bg-white/10 transition-colors'
          >
            <ExternalLink className='w-3.5 h-3.5' />
            Thử mở trực tiếp
          </a>
        )}
      </div>
    );
  }

  if (pages.length === 0) return null;

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Header */}
      <div className='flex items-center gap-2 text-sm text-text-sub'>
        <BookOpen className='w-4 h-4' />
        <span>
          Trang{' '}
          <span className='font-semibold text-text-main'>
            {currentPage + 1}
          </span>{' '}
          / {totalPages}
        </span>
      </div>

      {/* Flip book */}
      <div className='relative'>
        <HTMLFlipBook
          ref={flipBookRef}
          width={480}
          height={540}
          size='fixed'
          minWidth={200}
          maxWidth={600}
          minHeight={300}
          maxHeight={800}
          drawShadow
          flippingTime={600}
          usePortrait={false}
          startZIndex={0}
          autoSize={false}
          maxShadowOpacity={0.4}
          showCover={false}
          mobileScrollSupport
          onFlip={(e: { data: number }) => setCurrentPage(e.data)}
          className='shadow-2xl rounded-sm'
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

      {/* Navigation */}
      <div className='flex items-center gap-3'>
        <button
          type='button'
          onClick={goPrev}
          disabled={currentPage === 0}
          className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
        >
          <ChevronLeft className='w-4 h-4' />
          Trước
        </button>

        {/* Page dots - tối đa 7 chấm */}
        <div className='flex items-center gap-1'>
          {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
            const pageIdx =
              totalPages <= 7 ? i : Math.round((i / 6) * (totalPages - 1));
            const isActive = Math.abs(currentPage - pageIdx) < 1;
            return (
              <button
                key={i}
                type='button'
                onClick={() => {
                  flipBookRef.current?.pageFlip()?.flip(pageIdx);
                }}
                className={cn(
                  'rounded-full transition-all',
                  isActive
                    ? 'w-2.5 h-2.5 bg-theme-primary-start'
                    : 'w-1.5 h-1.5 bg-gray-300 dark:bg-white/20 hover:bg-gray-400',
                )}
              />
            );
          })}
        </div>

        <button
          type='button'
          onClick={goNext}
          disabled={currentPage >= totalPages - 1}
          className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
        >
          Sau
          <ChevronRight className='w-4 h-4' />
        </button>
      </div>
    </div>
  );
}
