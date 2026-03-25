import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Camera, X, SwitchCamera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CameraCapture({
  photos,
  onAdd,
  onRemove,
  label,
}: {
  photos: string[];
  onAdd: (url: string) => void;
  onRemove: (idx: number) => void;
  label: string;
}) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [errorLine, setErrorLine] = useState('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>(
    'environment',
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraOpen]);

  const startCamera = async (facing: 'environment' | 'user' = facingMode) => {
    try {
      setErrorLine('');
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing } },
        });
      } catch (e) {
        // Fallback for devices without an environment camera (like most desktop webcams)
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      streamRef.current = stream;
      setFacingMode(facing);
      setIsCameraOpen(true);
    } catch (err) {
      console.error('Camera error:', err);
      setErrorLine(
        'Không thể mở camera. Vui lòng cấp quyền truy cập camera trong trình duyệt.',
      );
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  }, []);

  const flipCamera = useCallback(async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    // Stop current stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    await startCamera(nextFacing);
  }, [facingMode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        onAdd(url);
        stopCamera();
      },
      'image/jpeg',
      0.8,
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {/* ── Horizontal row of squares ── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {/* Existing photo tiles */}
        {photos.map((url, i) => (
          <div
            key={i}
            className="relative size-20 shrink-0 rounded-xl overflow-hidden border border-border bg-muted group"
          >
            <Image
              src={url}
              alt={`Ảnh ${i + 1}`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              title="Xoá ảnh"
            >
              <X className="size-5 text-white" />
            </button>
            <span className="absolute bottom-1 left-1.5 text-[10px] font-bold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
              {i + 1}
            </span>
          </div>
        ))}

        {/* Add photo button tile */}
        {!isCameraOpen && (
          <button
            type="button"
            onClick={() => startCamera()}
            className="size-20 shrink-0 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-theme-primary-start/50 hover:bg-theme-primary-start/5 transition-all"
          >
            <Camera className="size-5 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">
              Chụp
            </span>
          </button>
        )}
      </div>

      {errorLine && (
        <p className="text-xs font-semibold text-destructive">{errorLine}</p>
      )}

      {/* Camera live view */}
      {isCameraOpen && (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/20 p-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
            {/* Flip camera button overlay */}
            <button
              type="button"
              onClick={flipCamera}
              title="Đổi camera trước/sau"
              className="absolute top-2 right-2 size-9 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <SwitchCamera className="size-4 text-white" />
            </button>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={stopCamera}
            >
              Đóng
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-1.5 px-3"
              onClick={flipCamera}
              title="Đổi camera"
            >
              <SwitchCamera className="size-4" />
            </Button>
            <Button
              type="button"
              className="flex-1 gap-2 bg-theme-primary-start hover:bg-theme-primary-start/90 text-white"
              onClick={capturePhoto}
            >
              <Camera className="size-4" /> Chụp ảnh
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
