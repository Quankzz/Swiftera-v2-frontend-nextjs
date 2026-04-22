"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  FileText,
  Download,
  X,
  Loader2,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  GripHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  generateContractPdf,
  type ContractPdfInput,
} from "@/lib/generate-contract-pdf";

const ZOOM_STEP = 0.15;
const ZOOM_MIN = 0.4;
const ZOOM_MAX = 4;
const WHEEL_SENSITIVITY = 0.002;

interface PdfViewerDialogProps {
  input: ContractPdfInput;
}

export function PdfViewerDialog({ input }: PdfViewerDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [numPages, setNumPages] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const bytes = await generateContractPdf(input);
      const blob = new Blob([bytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });
      setBlobUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setLoading(false);
    }
  }, [input]);

  const handleOpen = async () => {
    setOpen(true);
    setZoom(1);
    if (!blobUrl) await generate();
  };

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
      setNumPages(0);
    }
  };

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `Hop-dong-${input.orderCode}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleOpenTab = () => {
    if (blobUrl) window.open(blobUrl, "_blank");
  };

  const clampZoom = (z: number) =>
    Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +z.toFixed(2)));
  const zoomIn = () => setZoom((z) => clampZoom(z + ZOOM_STEP));
  const zoomOut = () => setZoom((z) => clampZoom(z - ZOOM_STEP));
  const zoomReset = () => setZoom(1);
  const zoomPercent = Math.round(zoom * 100);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom((z) => clampZoom(z - e.deltaY * WHEEL_SENSITIVITY));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [open]);

  const onMouseDown = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
    };
    el.style.cursor = "grabbing";
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const el = containerRef.current;
    if (!el) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    el.scrollLeft = dragStart.current.scrollLeft - dx;
    el.scrollTop = dragStart.current.scrollTop - dy;
  };

  const onMouseUp = () => {
    isDragging.current = false;
    const el = containerRef.current;
    if (el) el.style.cursor = "grab";
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleOpen}
        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 gap-2 rounded-xl text-white hover:opacity-90"
      >
        <FileText className="size-4" />
        Xem hợp đồng PDF
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="flex h-[96dvh] w-[96vw] max-w-[96vw] gap-0 overflow-hidden rounded-2xl p-0 sm:h-[95dvh] sm:w-[92vw] sm:max-w-7xl">
          <DialogTitle className="sr-only">
            Hợp đồng {input.orderCode}
          </DialogTitle>

          {/* ---- PDF canvas area ---- */}
          <div
            ref={containerRef}
            className="relative flex-1 overflow-auto bg-zinc-200 dark:bg-zinc-900"
            style={{ cursor: "grab" }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {loading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-zinc-200/80 dark:bg-zinc-900/80">
                <Loader2 className="size-10 animate-spin text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-medium text-muted-foreground">
                  Đang tạo hợp đồng PDF...
                </p>
              </div>
            )}

            {blobUrl && (
              <PdfCanvasRenderer
                url={blobUrl}
                zoom={zoom}
                onNumPages={setNumPages}
              />
            )}

            {!loading && !blobUrl && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                <FileText className="size-14 opacity-30" />
                <p className="text-sm">Không thể tạo PDF</p>
                <Button variant="outline" size="sm" onClick={generate}>
                  Thử lại
                </Button>
              </div>
            )}

            {/* Zoom hint overlay */}
            {blobUrl && !loading && (
              <div className="pointer-events-none fixed bottom-6 left-1/2 z-20 -translate-x-1/2">
                <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-medium text-white/80 backdrop-blur-sm">
                  <GripHorizontal className="size-3.5" />
                  Kéo chuột để di chuyển · Ctrl + cuộn để zoom
                </div>
              </div>
            )}
          </div>

          {/* ---- Right sidebar toolbar ---- */}
          <div className="flex w-12 shrink-0 flex-col items-center gap-1 border-l border-border bg-card pt-14 pb-3 sm:w-14 sm:gap-1.5 sm:pt-16 sm:pb-4">
            <ToolBtn
              icon={<ZoomIn className="size-4" />}
              label="Phóng to"
              onClick={zoomIn}
              disabled={zoom >= ZOOM_MAX}
            />
            <button
              type="button"
              onClick={zoomReset}
              className="mb-0.5 text-[10px] font-bold tabular-nums text-muted-foreground transition-colors hover:text-foreground sm:text-xs"
              title="Đặt lại zoom"
            >
              {zoomPercent}%
            </button>
            <ToolBtn
              icon={<ZoomOut className="size-4" />}
              label="Thu nhỏ"
              onClick={zoomOut}
              disabled={zoom <= ZOOM_MIN}
            />
            <ToolBtn
              icon={<RotateCcw className="size-3.5" />}
              label="Đặt lại zoom"
              onClick={zoomReset}
            />

            <Sep />

            {numPages > 0 && (
              <p className="text-[10px] text-muted-foreground sm:text-[11px]">
                {numPages} trang
              </p>
            )}

            <Sep />

            <ToolBtn
              icon={<Download className="size-4" />}
              label="Tải xuống PDF"
              onClick={handleDownload}
              disabled={!blobUrl}
            />
            <ToolBtn
              icon={<ExternalLink className="size-4" />}
              label="Mở tab mới"
              onClick={handleOpenTab}
              disabled={!blobUrl}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

function PdfCanvasRenderer({
  url,
  zoom,
  onNumPages,
}: {
  url: string;
  zoom: number;
  onNumPages: (n: number) => void;
}) {
  const [pages, setPages] = useState(0);

  const onDocLoad = ({ numPages: n }: { numPages: number }) => {
    setPages(n);
    onNumPages(n);
  };

  return (
    <div
      className="flex flex-col items-center gap-4 px-4 py-6"
      style={{ minWidth: "fit-content" }}
    >
      <Document
        file={url}
        onLoadSuccess={onDocLoad}
        loading={null}
        error={
          <p className="py-10 text-center text-sm text-destructive">
            Lỗi hiển thị PDF
          </p>
        }
      >
        {Array.from({ length: pages }, (_, i) => (
          <Page
            key={`page-${i}`}
            pageNumber={i + 1}
            scale={zoom}
            className="mb-4 shadow-2xl last:mb-0"
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        ))}
      </Document>
    </div>
  );
}

function ToolBtn({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-9 shrink-0 rounded-lg sm:size-10"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {icon}
    </Button>
  );
}

function Sep() {
  return <div className="my-1 h-px w-6 bg-border sm:w-8" />;
}
