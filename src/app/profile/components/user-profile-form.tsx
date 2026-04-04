'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Loader2,
  Trash2,
  User,
} from 'lucide-react';
import {
  userApi,
  type UserSecure,
  type UpdateProfileRequest,
} from '@/api/userProfileApi';
import { storageApi } from '@/api/storageApi';
import { getApiErrorMessage, getApiSuccessMessage } from '../utils';

type CropArea = { width: number; height: number; x: number; y: number };

/** Blob của ảnh đã crop + preview URL để hiển thị tạm */
type AvatarBlob = Blob & { preview?: string };

async function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = url;
  });
}

/** Crop ảnh, trả về Blob JPEG để upload lên server */
async function getCroppedImageBlob(
  imageSrc: string,
  croppedAreaPixels: CropArea,
  quality = 0.88,
): Promise<Blob | null> {
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
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        quality,
      );
    });
  } catch {
    return null;
  }
}

/** Trích `filePath` từ Azure Blob URL để gọi API delete, ví dụ:
 *  https://<account>.blob.core.windows.net/<container>/avatars/12345.jpg
 *  → "avatars/12345.jpg" */
function extractBlobPathFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split('/').filter(Boolean);
    // Loại bỏ container name (segment đầu tiên)
    if (segments.length >= 2) {
      return segments.slice(1).join('/');
    }
    return null;
  } catch {
    return null;
  }
}

interface UserProfileFormProps {
  profile: UserSecure;
  onUpdated: (next: UserSecure) => void;
  /** Hiển thị badge cảnh báo chưa xác thực (UI cũ) — mặc định ẩn */
  isVerified?: boolean;
}

export function UserProfileForm({
  profile,
  onUpdated,
  isVerified = true,
}: UserProfileFormProps) {
  const [firstName, setFirstName] = useState(profile.firstName ?? '');
  const [lastName, setLastName] = useState(profile.lastName ?? '');
  const [nickname, setNickname] = useState(profile.nickname ?? '');
  const [biography, setBiography] = useState(profile.biography ?? '');
  const [city, setCity] = useState(profile.city ?? '');
  const [nationality, setNationality] = useState(profile.nationality ?? '');

  const [finalAvatarUrl, setFinalAvatarUrl] = useState<string | null>(
    profile.avatarUrl ?? null,
  );
  /** Blob đã crop, dùng preview URL để hiển thị tạm thời thay vì finalAvatarUrl */
  const [avatarBlob, setAvatarBlob] = useState<AvatarBlob | null>(null);
  /** Preview URL cho ảnh blob (cần revoke khi cleanup) */
  const avatarBlobUrlRef = useRef<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(
    null,
  );
  const [isCropping, setIsCropping] = useState(false);

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [avatarBroken, setAvatarBroken] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFirstName(profile.firstName ?? '');
    setLastName(profile.lastName ?? '');
    setNickname(profile.nickname ?? '');
    setBiography(profile.biography ?? '');
    setCity(profile.city ?? '');
    setNationality(profile.nationality ?? '');
    setFinalAvatarUrl(profile.avatarUrl ?? null);
  }, [profile]);

  useEffect(() => {
    setAvatarBroken(false);
  }, [finalAvatarUrl]);

  const onCropComplete = useCallback((_: unknown, pixels: CropArea) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const withPreview = Object.assign(file, {
      preview: URL.createObjectURL(file),
    });
    setAvatarBlob(withPreview as AvatarBlob);
    setIsCropping(true);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    e.target.value = '';
  };

  const handleCropConfirm = async () => {
    if (!avatarBlob?.preview || !croppedAreaPixels) return;
    const blob = await getCroppedImageBlob(
      avatarBlob.preview,
      croppedAreaPixels,
    );
    if (!blob) {
      setError('Không thể xử lý ảnh. Vui lòng thử lại.');
      return;
    }
    if (avatarBlobUrlRef.current) {
      URL.revokeObjectURL(avatarBlobUrlRef.current);
    }
    avatarBlobUrlRef.current = URL.createObjectURL(blob);
    setAvatarBlob(Object.assign(blob, { preview: avatarBlobUrlRef.current }));
    setIsCropping(false);
  };

  const handleCropCancel = () => {
    setAvatarBlob(null);
    setIsCropping(false);
  };

  const handleRemoveAvatar = () => {
    if (avatarBlobUrlRef.current) {
      URL.revokeObjectURL(avatarBlobUrlRef.current);
      avatarBlobUrlRef.current = null;
    }
    setAvatarBlob(null);
    setIsCropping(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('Vui lòng nhập họ và tên');
      return;
    }

    const normalizeText = (value: string | null | undefined): string | null => {
      if (typeof value !== 'string') return null;
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    };

    const payload: UpdateProfileRequest = {};
    const firstNameNext = firstName.trim();
    const lastNameNext = lastName.trim();

    if (firstNameNext !== profile.firstName) {
      payload.firstName = firstNameNext;
    }
    if (lastNameNext !== profile.lastName) {
      payload.lastName = lastNameNext;
    }

    const applyNullableDiff = (
      key: keyof Pick<
        UpdateProfileRequest,
        'nickname' | 'avatarUrl' | 'biography' | 'city' | 'nationality'
      >,
      nextRaw: string | null | undefined,
      prevRaw: string | null | undefined,
    ) => {
      const next = normalizeText(nextRaw);
      const prev = normalizeText(prevRaw);
      if (next === prev) return;
      payload[key] = next;
    };

    applyNullableDiff('nickname', nickname, profile.nickname);
    applyNullableDiff('biography', biography, profile.biography);
    applyNullableDiff('city', city, profile.city);
    applyNullableDiff('nationality', nationality, profile.nationality);

    // avatarUrl sẽ xử lý riêng: upload blob trước (nếu có)
    const oldAvatarUrl = profile.avatarUrl;
    let newAvatarUrl = oldAvatarUrl;

    if (avatarBlob) {
      setUploadingAvatar(true);
      setError('');
      try {
        const ext = 'jpg';
        const fileName = `${Date.now()}-avatar.${ext}`;
        const file = new File([avatarBlob], fileName, {
          type: 'image/jpeg',
        });
        const res = await storageApi.uploadSingleFile({
          file,
          folderName: 'avatars',
        });
        const uploadedUrl = res.data.data?.fileUrl ?? null;
        if (!uploadedUrl) {
          throw new Error('Upload avatar thất bại');
        }
        newAvatarUrl = uploadedUrl;
        applyNullableDiff('avatarUrl', newAvatarUrl, oldAvatarUrl);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Không thể tải ảnh lên'));
        setUploadingAvatar(false);
        return;
      } finally {
        setUploadingAvatar(false);
      }
    } else if (
      finalAvatarUrl === null &&
      oldAvatarUrl !== null
    ) {
      applyNullableDiff('avatarUrl', null, oldAvatarUrl);
    }

    if (Object.keys(payload).length === 0) {
      setError('Bạn chưa thay đổi thông tin nào');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      const res = await userApi.updateProfile(payload);
      const msg = getApiSuccessMessage(res.data, 'Đã cập nhật hồ sơ.');
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(''), 5000);
      onUpdated({ ...profile, ...res.data.data });

      // Xóa avatar cũ sau khi update thành công (chỉ khi thực sự đổi sang url mới)
      if (newAvatarUrl !== oldAvatarUrl && oldAvatarUrl) {
        try {
          const filePath = extractBlobPathFromUrl(oldAvatarUrl);
          if (filePath) {
            await storageApi.deleteSingleFile({ filePath });
          }
        } catch {
          // ignore delete error
        }
      }

      // Cleanup blob state
      if (avatarBlob && avatarBlobUrlRef.current) {
        URL.revokeObjectURL(avatarBlobUrlRef.current);
        avatarBlobUrlRef.current = null;
      }
      setAvatarBlob(null);
      setFinalAvatarUrl(res.data.data.avatarUrl ?? profile.avatarUrl ?? null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể lưu hồ sơ'));
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = finalAvatarUrl && !avatarBroken ? finalAvatarUrl : null;

  return (
    <div className='bg-white dark:bg-surface-card rounded-xl border border-gray-200 dark:border-white/8 shadow-sm p-6 space-y-6'>
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

      {/* Avatar */}
      <div className='flex flex-col items-center gap-3'>
        <div className='relative'>
          <div className='h-24 w-24 rounded-full border-2 border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 overflow-hidden flex items-center justify-center'>
            {avatarBlob?.preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarBlob.preview}
                alt='avatar'
                className='h-full w-full object-cover'
              />
            ) : avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarSrc}
                alt='avatar'
                className='h-full w-full object-cover'
                onError={() => setAvatarBroken(true)}
              />
            ) : (
              <User size={36} className='text-gray-400' />
            )}
          </div>

          <button
            type='button'
            onClick={() => fileRef.current?.click()}
            className='absolute bottom-0 left-0 h-7 w-7 rounded-full bg-theme-primary-start flex items-center justify-center shadow-md cursor-pointer hover:opacity-90 transition-opacity'
            title='Chọn ảnh'
            disabled={uploadingAvatar || saving}
          >
            <Camera size={13} className='text-white' />
          </button>

          {!isVerified && (
            <div
              className='absolute bottom-0 right-0 h-7 w-7 rounded-full bg-orange-50 border-2 border-white dark:border-surface-card flex items-center justify-center shadow-md'
              title='Tài khoản chưa xác thực'
            >
              <AlertTriangle size={13} className='text-orange-500' />
            </div>
          )}
        </div>

        {!isVerified && (
          <p className='text-xs text-orange-500 font-medium flex items-center gap-1'>
            <AlertTriangle size={11} />
            Tài khoản chưa xác thực
          </p>
        )}

        {(avatarSrc || avatarBlob) && !isCropping && (
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

      {isCropping && avatarBlob?.preview && (
        <div className='rounded-xl overflow-hidden border border-gray-200 dark:border-white/10'>
          <div className='relative h-64 bg-gray-900'>
            <Cropper
              image={avatarBlob.preview}
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
                disabled={uploadingAvatar || saving}
                className='bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs'
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={handleFileChange}
      />

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-text-sub uppercase tracking-wide'>
              Họ
            </label>
            <Input
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setError('');
              }}
              placeholder='Nguyễn'
              className='bg-gray-50/50 dark:bg-white/5'
            />
          </div>
          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-text-sub uppercase tracking-wide'>
              Tên
            </label>
            <Input
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setError('');
              }}
              placeholder='Văn A'
              className='bg-gray-50/50 dark:bg-white/5'
            />
          </div>
        </div>

        {/* <div className='space-y-1.5'>
          <label className='text-xs font-semibold text-text-sub uppercase tracking-wide'>
            Số điện thoại
          </label>
          <Input
            value={profile.phoneNumber ?? ''}
            disabled
            placeholder='—'
            className='bg-gray-100 dark:bg-white/10 opacity-70 cursor-not-allowed'
          />
        </div> */}

        <div className='space-y-1.5'>
          <label className='text-xs font-semibold text-text-sub uppercase tracking-wide'>
            Biệt danh
          </label>
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder='vana2026'
            className='bg-gray-50/50 dark:bg-white/5'
          />
        </div>

        <div className='space-y-1.5'>
          <label className='text-xs font-semibold text-text-sub uppercase tracking-wide'>
            Giới thiệu
          </label>
          <Textarea
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            placeholder='Vài dòng về bạn...'
            rows={4}
            className='bg-gray-50/50 dark:bg-white/5 resize-y min-h-[100px]'
          />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-text-sub uppercase tracking-wide'>
              Thành phố
            </label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder='Ho Chi Minh'
              className='bg-gray-50/50 dark:bg-white/5'
            />
          </div>
          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-text-sub uppercase tracking-wide'>
              Quốc tịch
            </label>
            <Input
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              placeholder='Vietnamese'
              className='bg-gray-50/50 dark:bg-white/5'
            />
          </div>
        </div>

        {/* {profile.rolesSecured.length > 0 && (
          <div className='space-y-2'>
            <span className='text-xs font-semibold text-text-sub uppercase tracking-wide'>
              Vai trò
            </span>
            <div className='flex flex-wrap gap-2'>
              {profile.rolesSecured.map((r) => (
                <span
                  key={r.roleId}
                  className='inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium'
                >
                  {r.name}
                </span>
              ))}
            </div>
          </div>
        )} */}

        {successMessage && (
          <div className='flex items-start gap-2 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 px-4 py-3 text-sm text-green-700 dark:text-green-400'>
            <CheckCircle2 size={16} className='shrink-0 mt-0.5' />
            <span>{successMessage}</span>
          </div>
        )}

        {error && <p className='text-xs text-red-500'>{error}</p>}

        <div className='pt-2 flex justify-end'>
          <Button
            type='submit'
            disabled={
              saving ||
              uploadingAvatar ||
              !firstName.trim() ||
              !lastName.trim()
            }
            className='bg-theme-primary-start hover:opacity-90 gap-2 text-white'
          >
            {(saving || uploadingAvatar) && (
              <Loader2 size={14} className='animate-spin' />
            )}
            {uploadingAvatar
              ? 'Đang tải ảnh...'
              : saving
                ? 'Đang lưu...'
                : successMessage
                  ? 'Đã lưu!'
                  : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </div>
  );
}