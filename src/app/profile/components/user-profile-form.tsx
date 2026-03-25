'use client';

import { useCallback, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Camera, Save, Trash2, User } from 'lucide-react';

// ─── helpers ────────────────────────────────────────────────────────────────

type CropArea = { width: number; height: number; x: number; y: number };
type FileWithPreview = File & { preview?: string };

async function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = url;
  });
}

async function getCroppedBlob(
  imageSrc: string,
  croppedAreaPixels: CropArea,
): Promise<string | null> {
  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
    );
    return new Promise((resolve) =>
      canvas.toBlob(
        (b) => resolve(b ? URL.createObjectURL(b) : null),
        'image/jpeg',
      ),
    );
  } catch {
    return null;
  }
}

// ─── props ───────────────────────────────────────────────────────────────────

interface UserProfileFormProps {
  userEmail: string;
  userName: string;
  phoneNumber?: string;
  avatarUrl?: string | null;
  isVerified?: boolean;
}

// ─── component ───────────────────────────────────────────────────────────────

export function UserProfileForm({
  userEmail,
  userName,
  phoneNumber: initialPhone = '',
  avatarUrl: initialAvatarUrl = null,
  isVerified = true,
}: UserProfileFormProps) {
  const [name, setName] = useState(userName);
  const [phone, setPhone] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // avatar & crop state
  const [avatarFile, setAvatarFile] = useState<FileWithPreview | null>(null);
  const [finalAvatarUrl, setFinalAvatarUrl] = useState<string | null>(
    initialAvatarUrl ?? null,
  );
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(
    null,
  );
  const [isCropping, setIsCropping] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_: unknown, pixels: CropArea) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const withPreview = Object.assign(file, {
      preview: URL.createObjectURL(file),
    });
    setAvatarFile(withPreview);
    setIsCropping(true);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    e.target.value = '';
  };

  const handleCropConfirm = async () => {
    if (!avatarFile?.preview || !croppedAreaPixels) return;
    const url = await getCroppedBlob(avatarFile.preview, croppedAreaPixels);
    if (url) setFinalAvatarUrl(url);
    setAvatarFile(null);
    setIsCropping(false);
  };

  const handleCropCancel = () => {
    setAvatarFile(null);
    setIsCropping(false);
  };

  const handleRemoveAvatar = () => {
    setFinalAvatarUrl(null);
    setAvatarFile(null);
    setIsCropping(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    // TODO: wire up to real API (send name, phone, finalAvatarUrl)
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const avatarSrc = finalAvatarUrl;

  return (
    <div className='bg-white dark:bg-[#1a1a1f] rounded-xl border border-gray-200 dark:border-white/8 shadow-sm p-6 space-y-6'>
      {/* Header row */}
      <div className='flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-white/8'>
        <div className='h-10 w-10 rounded-full bg-theme-primary-start/10 flex items-center justify-center'>
          <User size={18} className='text-theme-primary-start' />
        </div>
        <div>
          <h2 className='text-base font-semibold text-text-main'>
            Thông tin cá nhân
          </h2>
          <p className='text-xs text-text-sub'>
            Cập nhật thông tin hiển thị của bạn
          </p>
        </div>
      </div>

      {/* ── Avatar section ── */}
      <div className='flex flex-col items-center gap-3'>
        {/* Circle + badges */}
        <div className='relative'>
          <div className='h-24 w-24 rounded-full border-2 border-gray-200 bg-gray-100 overflow-hidden flex items-center justify-center'>
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarSrc}
                alt='avatar'
                className='h-full w-full object-cover'
              />
            ) : (
              <User size={36} className='text-gray-400' />
            )}
          </div>

          {/* Camera overlay button */}
          <button
            type='button'
            onClick={() => fileRef.current?.click()}
            className='absolute bottom-0 left-0 h-7 w-7 rounded-full bg-theme-primary-start flex items-center justify-center shadow-md cursor-pointer hover:opacity-90 transition-opacity'
            title='Chọn ảnh'
          >
            <Camera size={13} className='text-white' />
          </button>

          {/* Warning badge — bottom-right */}
          {!isVerified && (
            <div
              className='absolute bottom-0 right-0 h-7 w-7 rounded-full bg-orange-50 border-2 border-white flex items-center justify-center shadow-md'
              title='Tài khoản chưa xác thực'
            >
              <AlertTriangle size={13} className='text-orange-500' />
            </div>
          )}
        </div>

        {/* Unverified text */}
        {!isVerified && (
          <p className='text-xs text-orange-500 font-medium flex items-center gap-1'>
            <AlertTriangle size={11} />
            Tài khoản chưa xác thực
          </p>
        )}

        {/* Remove avatar */}
        {avatarSrc && !isCropping && (
          <button
            type='button'
            onClick={handleRemoveAvatar}
            className='flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors'
          >
            <Trash2 size={12} />
            Xóa ảnh
          </button>
        )}
      </div>

      {/* ── Cropper overlay ── */}
      {isCropping && avatarFile?.preview && (
        <div className='rounded-xl overflow-hidden border border-gray-200'>
          <div className='relative h-64 bg-gray-900'>
            <Cropper
              image={avatarFile.preview}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape='round'
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className='flex items-center justify-between bg-gray-800 px-4 py-2 gap-4'>
            <input
              type='range'
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className='flex-1 accent-blue-400 h-1'
            />
            <div className='flex gap-2'>
              <Button
                type='button'
                size='sm'
                variant='ghost'
                onClick={handleCropCancel}
                className='text-gray-300 hover:text-white hover:bg-gray-700 h-7 text-xs'
              >
                Hủy
              </Button>
              <Button
                type='button'
                size='sm'
                onClick={handleCropConfirm}
                className='bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs'
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={handleFileChange}
      />

      {/* ── Form fields ── */}
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='space-y-1.5'>
          <label className='text-xs font-semibold text-text-sub uppercase tracking-wide'>
            Email
          </label>
          <Input
            value={userEmail}
            disabled
            className='bg-gray-100 opacity-70 cursor-not-allowed'
          />
          <p className='text-[11px] text-text-sub'>
            Email không thể thay đổi ở đây
          </p>
        </div>

        <div className='space-y-1.5'>
          <label className='text-xs font-semibold text-text-sub uppercase tracking-wide'>
            Tên hiển thị
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Nguyễn Văn A'
            className='bg-gray-50/50'
          />
        </div>

        <div className='space-y-1.5'>
          <label className='text-xs font-semibold text-text-sub uppercase tracking-wide'>
            Số điện thoại
          </label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder='0912 345 678'
            type='tel'
            className='bg-gray-50/50'
          />
        </div>

        <div className='pt-2 flex justify-end'>
          <Button
            type='submit'
            disabled={saving || !name.trim()}
            className='bg-theme-primary-start hover:opacity-90 gap-2 text-white'
          >
            {saving ? 'Đang lưu...' : saved ? 'Đã lưu!' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </div>
  );
}
