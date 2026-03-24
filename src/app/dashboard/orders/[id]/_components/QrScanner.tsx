import React, { useState, useCallback, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function QrScanner({
  expectedCode,
  onSuccess,
  onCancel,
}: {
  expectedCode: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [lastDetected, setLastDetected] = useState('');

  const stopAll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });
    if (code) {
      const detected = code.data.trim().toUpperCase();
      setLastDetected(detected);
      if (detected === expectedCode.trim().toUpperCase()) {
        stopAll();
        setScanning(false);
        onSuccess();
        return;
      } else {
        setError(
          `QR không khớp (${code.data}) — yêu cầu khách mở đúng mã đơn.`,
        );
      }
    }
    rafRef.current = requestAnimationFrame(scanFrame);
  }, [expectedCode, onSuccess, stopAll]);

  const startScanner = useCallback(async () => {
    setError('');
    setLastDetected('');
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
          },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      rafRef.current = requestAnimationFrame(scanFrame);
    } catch {
      setError('Không thể mở camera. Vui lòng cấp quyền truy cập camera.');
    }
  }, [scanFrame]);

  useEffect(() => {
    startScanner();
    return () => stopAll();
  }, [startScanner, stopAll]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full aspect-4/3 sm:aspect-video rounded-2xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        {/* Scan overlay */}
        {scanning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-52 h-52 sm:w-64 sm:h-64">
              {/* Corner borders */}
              <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-white rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-white rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-white rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-white rounded-br-lg" />
              {/* Scanning line */}
              <div className="absolute top-0 left-2 right-2 h-0.5 bg-green-400 opacity-80 animate-[scan-line_2s_ease-in-out_infinite]" />
            </div>
          </div>
        )}
        {/* Status badge */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full whitespace-nowrap">
          {scanning ? '🔍 Đang quét mã QR...' : '⏳ Đang khởi động camera...'}
        </div>
      </div>
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-3">
          <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-destructive">{error}</p>
            {lastDetected && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Phát hiện:{' '}
                <span className="font-mono font-bold">{lastDetected}</span> ·
                Cần:{' '}
                <span className="font-mono font-bold">
                  {expectedCode.toUpperCase()}
                </span>
              </p>
            )}
          </div>
        </div>
      )}
      <Button
        variant="outline"
        onClick={onCancel}
        className="gap-2 h-11 text-sm"
      >
        <X className="size-4" /> Đóng máy quét
      </Button>
      <p className="text-xs text-center text-muted-foreground leading-relaxed">
        Hướng camera vào mã QR trên điện thoại của khách. Hệ thống sẽ tự động
        xác nhận khi nhận diện đúng.
      </p>
    </div>
  );
}
