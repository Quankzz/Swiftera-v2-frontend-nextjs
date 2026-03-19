'use client';

import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import NextImage from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUserQuery,
} from '@/hooks/api/use-users';
import { CreateUserInput, UpdateUserInput, User } from '@/types/dashboard';
import Cropper from 'react-easy-crop';
import {
  Camera,
  User as UserIcon,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Trash2,
} from 'lucide-react';

type CropArea = { width: number; height: number; x: number; y: number };
type FileWithPreview = File & { preview?: string };

async function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error: Event) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

async function getCroppedBlob(
  imageSrc: string,
  croppedAreaPixels: CropArea,
): Promise<string | null> {
  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
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
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(null);
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        },
        'image/jpeg',
        0.9,
      );
    });
  } catch {
    return null;
  }
}

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialUser?: User | null;
}

export function UserFormDialog({
  open,
  onClose,
  initialUser,
}: UserFormDialogProps) {
  const isEdit = !!initialUser;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const buildState = (user?: User | null) => ({
    email: user?.email || '',
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    isVerified: user?.isVerified ?? false,
  });

  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  const { data: userDetail, isFetching: isDetailLoading } = useUserQuery(
    initialUser?.userId,
  );

  const [formState, setFormState] = useState(buildState(initialUser));
  const [avatarFile, setAvatarFile] = useState<FileWithPreview | null>(null);
  const [finalAvatarUrl, setFinalAvatarUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(
    null,
  );
  const [isCropping, setIsCropping] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (!isEdit) {
      startTransition(() => {
        setFormState(buildState(null));
        setAvatarFile(null);
        setFinalAvatarUrl(null);
        setIsCropping(false);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      });
      return;
    }
    if (userDetail) {
      startTransition(() => {
        setFormState(buildState(userDetail));
        setFinalAvatarUrl(userDetail.avatarUrl || null);
        setAvatarFile(null);
        setIsCropping(false);
      });
    }
  }, [open, isEdit, userDetail, initialUser?.userId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Revoke old preview to prevent memory leaks
    if (avatarFile?.preview) URL.revokeObjectURL(avatarFile.preview);
    const withPreview = Object.assign(file, {
      preview: URL.createObjectURL(file),
    }) as FileWithPreview;
    setAvatarFile(withPreview);
    setFinalAvatarUrl(null);
    setIsCropping(true);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleCropConfirm = useCallback(async () => {
    if (!avatarFile?.preview || !croppedAreaPixels) return;
    const result = await getCroppedBlob(avatarFile.preview, croppedAreaPixels);
    if (result) {
      setFinalAvatarUrl(result);
      setIsCropping(false);
    }
  }, [avatarFile, croppedAreaPixels]);

  const handleCropCancel = () => {
    setAvatarFile(null);
    setIsCropping(false);
    setFinalAvatarUrl(
      isEdit && userDetail ? userDetail.avatarUrl || null : null,
    );
  };

  const handleSubmit = async () => {
    if (!formState.fullName.trim() || !formState.email.trim()) return;

    const payload: CreateUserInput | UpdateUserInput = {
      email: formState.email.trim(),
      fullName: formState.fullName.trim(),
      phoneNumber: formState.phoneNumber ? formState.phoneNumber.trim() : null,
      avatarUrl: finalAvatarUrl,
      isVerified: formState.isVerified,
    };

    if (isEdit && initialUser) {
      await updateMutation.mutateAsync({ userId: initialUser.userId, payload });
    } else {
      await createMutation.mutateAsync(payload as CreateUserInput);
    }
    onClose();
    setAvatarFile(null);
    setFinalAvatarUrl(null);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const avatarInitial = formState.fullName
    ? formState.fullName.charAt(0).toUpperCase()
    : '?';

  return (
    <Dialog
      key={initialUser?.userId ?? 'new-user'}
      open={open}
      onOpenChange={(val) => !val && onClose()}
    >
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='text-text-main flex items-center gap-2'>
            <UserIcon size={18} className='text-theme-primary-start' />
            {isEdit ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật thông tin người dùng trong hệ thống.'
              : 'Điền đầy đủ thông tin để tạo người dùng mới.'}
          </DialogDescription>
        </DialogHeader>

        {isEdit && isDetailLoading && (
          <div className='flex items-center gap-2 text-sm text-text-sub py-2'>
            <div className='h-4 w-4 rounded-full border-2 border-theme-primary-start border-t-transparent animate-spin' />
            Đang tải thông tin chi tiết...
          </div>
        )}

        <div className='space-y-5 py-1 max-h-[70vh] overflow-y-auto pr-1'>
          {/* Avatar section */}
          <div className='flex items-start gap-5'>
            {/* Avatar preview */}
            <div className='flex flex-col items-center gap-2 shrink-0'>
              <div className='relative w-20 h-20 rounded-full border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center group'>
                {finalAvatarUrl ? (
                  <NextImage
                    src={finalAvatarUrl}
                    alt='avatar'
                    fill
                    className='object-cover'
                    unoptimized
                  />
                ) : (
                  <span className='text-2xl font-bold text-theme-primary-start/40'>
                    {avatarInitial}
                  </span>
                )}
                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  className='absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-full'
                >
                  <Camera size={18} className='text-white' />
                </button>
              </div>
              <div className='flex flex-col items-center gap-1'>
                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  className='text-xs text-theme-primary-start hover:underline'
                >
                  Chọn ảnh
                </button>
                {finalAvatarUrl && (
                  <button
                    type='button'
                    onClick={() => {
                      setFinalAvatarUrl(null);
                      setAvatarFile(null);
                    }}
                    className='text-xs text-text-sub hover:text-red-500 flex items-center gap-0.5'
                  >
                    <Trash2 size={10} /> Xóa ảnh
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleFileChange}
              />
            </div>

            {/* Fields: name + email */}
            <div className='flex-1 space-y-3 min-w-0'>
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-text-sub uppercase tracking-wide flex items-center gap-1'>
                  <UserIcon size={11} /> Họ tên *
                </label>
                <Input
                  value={formState.fullName}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, fullName: e.target.value }))
                  }
                  placeholder='Nguyễn Văn A'
                  className='bg-gray-50/50'
                />
              </div>
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-text-sub uppercase tracking-wide flex items-center gap-1'>
                  <Mail size={11} /> Email *
                </label>
                <Input
                  type='email'
                  value={formState.email}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, email: e.target.value }))
                  }
                  placeholder='email@domain.com'
                  disabled={isEdit}
                  className={
                    isEdit ? 'opacity-60 bg-gray-100' : 'bg-gray-50/50'
                  }
                />
                {isEdit && (
                  <p className='text-[11px] text-text-sub'>
                    Email không thể thay đổi sau khi tạo
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Cropper */}
          {isCropping && avatarFile?.preview && (
            <div className='rounded-xl border border-dashed border-theme-primary-start/40 overflow-hidden bg-gray-900 shrink-0'>
              <div className='relative w-full h-64'>
                <Cropper
                  image={avatarFile.preview}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape='round'
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, croppedPixels) =>
                    setCroppedAreaPixels(croppedPixels as CropArea)
                  }
                />
              </div>
              <div className='flex items-center gap-3 px-4 py-2.5 bg-gray-800'>
                <span className='text-xs text-gray-400 shrink-0'>
                  Thu phóng
                </span>
                <input
                  type='range'
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className='flex-1 accent-theme-primary-start'
                />
                <div className='flex items-center gap-2 shrink-0'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={handleCropCancel}
                    className='h-7 text-xs border-gray-600 text-gray-300 hover:bg-gray-700'
                  >
                    <XCircle size={13} className='mr-1' /> Hủy
                  </Button>
                  <Button
                    size='sm'
                    onClick={handleCropConfirm}
                    className='h-7 text-xs bg-theme-primary-start hover:opacity-90'
                  >
                    <CheckCircle2 size={13} className='mr-1' /> Dùng ảnh này
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Phone + Verified */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-text-sub uppercase tracking-wide flex items-center gap-1'>
                <Phone size={11} /> Số điện thoại
              </label>
              <Input
                value={formState.phoneNumber}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, phoneNumber: e.target.value }))
                }
                placeholder='0123 456 789'
                className='bg-gray-50/50'
              />
            </div>
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-text-sub uppercase tracking-wide'>
                Trạng thái tài khoản
              </label>
              <button
                type='button'
                onClick={() =>
                  setFormState((s) => ({ ...s, isVerified: !s.isVerified }))
                }
                className={`w-full flex items-center justify-between rounded-md border px-3 py-2 transition-colors ${
                  formState.isVerified
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : 'border-orange-200 bg-orange-50/60 text-orange-600'
                }`}
              >
                <span className='text-sm font-medium'>
                  {formState.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                </span>
                <span
                  className={`h-4 w-4 rounded-full flex items-center justify-center ${
                    formState.isVerified ? 'bg-green-500' : 'bg-orange-400'
                  }`}
                >
                  {formState.isVerified ? (
                    <CheckCircle2 size={12} className='text-white' />
                  ) : (
                    <XCircle size={12} className='text-white' />
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className='pt-2'>
          <Button
            variant='ghost'
            onClick={onClose}
            className='text-text-sub'
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            className='bg-theme-primary-start hover:opacity-90 min-w-28'
            disabled={
              isSubmitting ||
              !formState.fullName.trim() ||
              !formState.email.trim()
            }
          >
            {isSubmitting
              ? 'Đang lưu...'
              : isEdit
                ? 'Lưu thay đổi'
                : 'Tạo người dùng'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface UserDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
}

export function UserDeleteDialog({
  open,
  onClose,
  user,
}: UserDeleteDialogProps) {
  const deleteMutation = useDeleteUserMutation();
  const handleDelete = async () => {
    if (!user) return;
    await deleteMutation.mutateAsync(user.userId);
    onClose();
  };

  const isSubmitting = deleteMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-text-main'>Xóa người dùng</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa người dùng{' '}
            <span className='font-semibold text-text-main'>
              {user?.fullName}
            </span>
            ? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className='flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3 border border-gray-200'>
            <div className='h-9 w-9 rounded-full bg-theme-primary-start/10 flex items-center justify-center shrink-0'>
              <span className='text-sm font-bold text-theme-primary-start'>
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className='text-sm font-medium text-text-main'>
                {user.fullName}
              </p>
              <p className='text-xs text-text-sub'>{user.email}</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant='ghost'
            onClick={onClose}
            className='text-text-sub'
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isSubmitting}
            className='bg-theme-primary-start hover:bg-theme-primary-end text-white'
          >
            {isSubmitting ? 'Đang xóa...' : 'Xóa người dùng'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
