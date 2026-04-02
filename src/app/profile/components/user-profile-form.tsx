'use client';

import { useCallback, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Save, Trash2, User, CheckCircle2 } from 'lucide-react';
import { useUpdateProfileMutation } from '@/features/users/hooks/use-user-profile';
import { normalizeError } from '@/api/apiService';
import type {
  UserSecureResponse,
  UpdateProfileInput,
} from '@/features/users/types';

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

/**
 * Props bám theo BE spec UserSecureResponse.
 * Fields theo API-010: firstName, lastName, nickname, avatarUrl, biography, city, nationality
 *
 * NOTE: phoneNumber KHÔNG có trong API-010 update-profile. Chỉ hiển thị readonly.
 */
interface UserProfileFormProps {
  profile: UserSecureResponse;
}

// ─── component ───────────────────────────────────────────────────────────────

export function UserProfileForm({ profile }: UserProfileFormProps) {
  // Local form state — initialized từ profile data
  const [firstName, setFirstName] = useState(profile.firstName ?? '');
  const [lastName, setLastName] = useState(profile.lastName ?? '');
  const [nickname, setNickname] = useState(profile.nickname ?? '');
  const [biography, setBiography] = useState(profile.biography ?? '');
  const [city, setCity] = useState(profile.city ?? '');
  const [nationality, setNationality] = useState(profile.nationality ?? '');

  // avatar & crop state (local UI state — không nhét vào hook)
  const [avatarFile, setAvatarFile] = useState<FileWithPreview | null>(null);
  const [finalAvatarUrl, setFinalAvatarUrl] = useState<string | null>(
    profile.avatarUrl ?? null,
  );
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(
    null,
  );
  const [isCropping, setIsCropping] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);
  const updateProfileMutation = useUpdateProfileMutation();

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
    if (!firstName.trim() || !lastName.trim()) return;
    setErrorMsg('');

    // Mapping form values -> API payload (chỉ gửi field đúng spec API-010)
    const payload: UpdateProfileInput = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      nickname: nickname.trim() || undefined,
      avatarUrl: finalAvatarUrl,
      biography: biography.trim() || undefined,
      city: city.trim() || undefined,
      nationality: nationality.trim() || undefined,
    };

    try {
      await updateProfileMutation.mutateAsync(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      const appErr = normalizeError(error);
      setErrorMsg(appErr.message);
    }
  };

  const avatarSrc = finalAvatarUrl;
  const isSaving = updateProfileMutation.isPending;

  return (
    <div className='bg-white dark:bg-surface-card rounded-xl border border-gray-200 dark:border-white/8 shadow-sm p-6 space-y-6'>
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

      {/* Success message */}
      {saved && (
        <div className='flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 px-4 py-3 text-sm text-green-700 dark:text-green-400'>
          <CheckCircle2 size={16} /> Cập nhật hồ sơ thành công!
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <div className='rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-700 dark:text-red-400'>
          {errorMsg}
        </div>
      )}

      {/* ── Avatar section ── */}
      <div className='flex flex-col items-center gap-3'>
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
        </div>

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

      {/* ── Form fields — theo đúng BE spec API-010 ── */}
      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* Email — readonly, đổi qua tab Email (API-012) */}
        <div className='space-y-1.5'>
          <label className='text-xs font-semibold text-text-sub uppercase tracking-wide'>
            Email
          </label>
          <Input
            value={profile.email}
            disabled
            className='bg-gray-100 opacity-70 cursor-not-allowed'
          />
          <p className='text-[11px] text-text-sub'>
            Email không thể thay đổi ở đây. Dùng tab &quot;Email&quot; để đổi.
          </p>
        </div>

        {/* phoneNumber — readonly, BE spec không cho update qua API-010 */}
        {profile.phoneNumber && (
          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-text-sub uppercase tracking-wide'>
              Số điện thoại
            </label>
            <Input
              value={profile.phoneNumber}
              disabled
              className='bg-gray-100 opacity-70 cursor-not-allowed'
            />
            <p className='text-[11px] text-text-sub'>
              Số điện thoại không thể thay đổi qua API update-profile.
            </p>
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-text-sub uppercase tracking-wide'>
              Họ (Last Name)
            </label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder='Nguyễn'
              className='bg-gray-50/50'
            />
          </div>
          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-text-sub uppercase tracking-wide'>
              Tên (First Name)
            </label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder='Văn A'
              className='bg-gray-50/50'
            />
          </div>
        </div>

        <div className='space-y-1.5'>
          <label className='text-xs font-semibold text-text-sub uppercase tracking-wide'>
            Biệt danh (Nickname)
          </label>
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder='vana2026'
            className='bg-gray-50/50'
          />
        </div>

        <div className='space-y-1.5'>
          <label className='text-xs font-semibold text-text-sub uppercase tracking-wide'>
            Giới thiệu (Biography)
          </label>
          <textarea
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            placeholder='Viết vài dòng giới thiệu về bản thân...'
            rows={3}
            className='w-full rounded-md border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 px-3 py-2 text-sm text-text-main placeholder:text-text-sub/50 focus:outline-none focus:ring-2 focus:ring-primary/40'
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-text-sub uppercase tracking-wide'>
              Thành phố (City)
            </label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder='Hồ Chí Minh'
              className='bg-gray-50/50'
            />
          </div>
          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-text-sub uppercase tracking-wide'>
              Quốc tịch (Nationality)
            </label>
            <Input
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              placeholder='Vietnamese'
              className='bg-gray-50/50'
            />
          </div>
        </div>

        <div className='pt-2 flex justify-end'>
          <Button
            type='submit'
            disabled={isSaving || !firstName.trim() || !lastName.trim()}
            className='bg-theme-primary-start hover:opacity-90 gap-2 text-white'
          >
            {isSaving ? (
              'Đang lưu...'
            ) : saved ? (
              'Đã lưu!'
            ) : (
              <>
                <Save size={14} /> Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
