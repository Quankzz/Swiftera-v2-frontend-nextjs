'use client';

import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import NextImage from 'next/image';
import { toast } from 'sonner';
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
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUserQuery,
  useRemoveUserRolesMutation,
} from '@/features/users/hooks/use-user-management';
import { useRolesListQuery } from '@/features/roles/hooks/use-roles';
import type { RoleResponse } from '@/features/roles/types';
import type { UserResponse, UpdateUserInput } from '@/features/users/types';
import {
  useUploadFileMutation,
  useDeleteFileMutation,
} from '@/features/files/hooks/use-files';
import { normalizeError } from '@/api/apiService';
import { isAzureBlobUrl, extractBlobPathFromUrl } from '@/lib/blob-utils';
import {
  Camera,
  User as UserIcon,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Trash2,
  Shield,
  ChevronDown,
  X,
  Loader2,
} from 'lucide-react';

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialUser?: UserResponse | null;
}

export function UserFormDialog({
  open,
  onClose,
  initialUser,
}: UserFormDialogProps) {
  const isEdit = !!initialUser;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const buildState = (user?: UserResponse | null) => ({
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
    nickname: user?.nickname || '',
    isVerified: user?.isVerified ?? false,
  });

  const updateMutation = useUpdateUserMutation();
  const removeRolesMutation = useRemoveUserRolesMutation();
  const uploadMutation = useUploadFileMutation();
  const deleteMutation = useDeleteFileMutation();
  const { data: userDetail, isFetching: isDetailLoading } = useUserQuery(
    initialUser?.userId,
  );
  const { data: rolesData } = useRolesListQuery({ size: 100 });
  const allRoles: RoleResponse[] = rolesData?.content ?? [];

  const [formState, setFormState] = useState(buildState(initialUser));
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [finalAvatarUrl, setFinalAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (!isEdit) {
      startTransition(() => {
        setFormState(buildState(null));
        setSelectedRoleIds([]);
        setAvatarFile(null);
        setFinalAvatarUrl(null);
      });
      return;
    }
    if (userDetail) {
      startTransition(() => {
        setFormState(buildState(userDetail));
        setSelectedRoleIds([
          ...new Set(userDetail.rolesSecured?.map((r) => r.roleId) ?? []),
        ]);
        setFinalAvatarUrl(userDetail.avatarUrl || null);
        setAvatarFile(null);
      });
    }
  }, [open, isEdit, userDetail, initialUser?.userId]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = '';
      // Show local preview immediately
      const previewUrl = URL.createObjectURL(file);
      setFinalAvatarUrl(previewUrl);
      setAvatarFile(file);
    },
    [],
  );

  const handleSubmit = async () => {
    if (!formState.firstName.trim() || !formState.email.trim()) return;

    try {
      if (isEdit && initialUser && userDetail) {
        // Chỉ gửi các trường thực sự thay đổi so với dữ liệu BE
        const payload: UpdateUserInput = {};

        const trimmed = {
          firstName: formState.firstName.trim(),
          lastName: formState.lastName.trim(),
          email: formState.email.trim(),
          phoneNumber: formState.phoneNumber
            ? formState.phoneNumber.trim()
            : undefined,
          nickname: formState.nickname ? formState.nickname.trim() : undefined,
          isVerified: formState.isVerified,
        };

        if (trimmed.firstName !== (userDetail.firstName ?? ''))
          payload.firstName = trimmed.firstName;
        if (trimmed.lastName !== (userDetail.lastName ?? ''))
          payload.lastName = trimmed.lastName;
        if (trimmed.email !== (userDetail.email ?? ''))
          payload.email = trimmed.email;
        if ((trimmed.phoneNumber ?? '') !== (userDetail.phoneNumber ?? ''))
          payload.phoneNumber = trimmed.phoneNumber;
        if ((trimmed.nickname ?? '') !== (userDetail.nickname ?? ''))
          payload.nickname = trimmed.nickname;
        if (trimmed.isVerified !== (userDetail.isVerified ?? false))
          payload.isVerified = trimmed.isVerified;

        // Roles: tính diff thêm/xóa
        const prevRoleSet = new Set(
          userDetail.rolesSecured?.map((r) => r.roleId) ?? [],
        );
        const nextRoleSet = new Set(selectedRoleIds);

        const addedRoleIds = selectedRoleIds.filter(
          (id) => !prevRoleSet.has(id),
        );
        const removedRoleIds = [...prevRoleSet].filter(
          (id) => !nextRoleSet.has(id),
        );

        // Thêm role mới qua PATCH (API-016)
        if (addedRoleIds.length > 0) payload.roleIds = addedRoleIds;

        // Xóa role cũ qua DELETE /users/{userId}/roles (API-018) - gọi song song sau update
        // Avatar: nếu user chọn ảnh mới → upload → lấy URL
        if (avatarFile) {
          const oldAvatarUrl = userDetail.avatarUrl;
          const uploadResult = await uploadMutation.mutateAsync({
            file: avatarFile,
            folder: 'avatars',
          });
          payload.avatarUrl = uploadResult.fileUrl;

          // Delete old avatar from Azure Blob after successful upload
          if (oldAvatarUrl && isAzureBlobUrl(oldAvatarUrl)) {
            const oldPath = extractBlobPathFromUrl(oldAvatarUrl);
            if (oldPath) {
              deleteMutation
                .mutateAsync(oldPath)
                .catch(() => toast.error('Không thể xóa ảnh đại diện cũ.'));
            }
          }
        }

        // Nếu không có gì thay đổi (kể cả roles) → đóng dialog luôn
        const hasRoleChanges =
          addedRoleIds.length > 0 || removedRoleIds.length > 0;
        if (Object.keys(payload).length === 0 && !hasRoleChanges) {
          onClose();
          return;
        }

        // Gọi PATCH update (nếu có field thay đổi hoặc role thêm mới)
        if (Object.keys(payload).length > 0) {
          await updateMutation.mutateAsync({
            userId: initialUser.userId,
            payload,
          });
        }

        // Gọi DELETE /users/{userId}/roles để xóa role cũ (API-018)
        if (removedRoleIds.length > 0) {
          await removeRolesMutation.mutateAsync({
            userId: initialUser.userId,
            payload: { roleIds: removedRoleIds },
          });
        }

        toast.success('Cập nhật người dùng thành công');
      }
      onClose();
      setAvatarFile(null);
      setFinalAvatarUrl(null);
    } catch (err) {
      const appErr = normalizeError(err);
      toast.error(appErr.message);
    }
  };

  const isSubmitting =
    updateMutation.isPending || removeRolesMutation.isPending;

  const avatarInitial = formState.firstName
    ? formState.firstName.charAt(0).toUpperCase()
    : '?';

  return (
    <Dialog
      key={initialUser?.userId ?? 'new-user'}
      open={open}
      onOpenChange={(val) => !val && onClose()}
    >
      <DialogContent className='sm:max-w-4xl w-full'>
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
          <div className='absolute inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-black/40 backdrop-blur-[2px] rounded-xl'>
            <div className='flex flex-col items-center gap-3'>
              <Loader2
                size={32}
                className='animate-spin text-theme-primary-start'
              />
              <span className='text-sm font-medium text-text-sub'>
                Đang tải thông tin chi tiết…
              </span>
            </div>
          </div>
        )}

        <div className='space-y-5 py-1 max-h-[70vh] overflow-y-auto pr-1'>
          {/* Avatar section */}
          <div className='flex items-start gap-5'>
            {/* Avatar preview */}
            <div className='flex flex-col items-center gap-2 shrink-0'>
              <div className='relative w-20 h-20 rounded-full border-2 border-dashed border-gray-200 dark:border-white/15 overflow-hidden bg-gray-50 dark:bg-white/5 flex items-center justify-center group'>
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

            {/* Fields: firstName, lastName + email */}
            <div className='flex-1 space-y-3 min-w-0'>
              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-text-sub uppercase tracking-wide flex items-center gap-1'>
                    <UserIcon size={11} /> Họ *
                  </label>
                  <Input
                    value={formState.firstName}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, firstName: e.target.value }))
                    }
                    placeholder='Nguyễn'
                    className='bg-gray-50/50'
                  />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-text-sub uppercase tracking-wide'>
                    Tên *
                  </label>
                  <Input
                    value={formState.lastName}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, lastName: e.target.value }))
                    }
                    placeholder='Văn A'
                    className='bg-gray-50/50'
                  />
                </div>
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
                    isEdit
                      ? 'opacity-60 bg-gray-100 dark:bg-white/5'
                      : 'bg-gray-50/50 dark:bg-white/3'
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

        {/* ── Roles & Last login - OUTSIDE scroll container so dropdown isn't clipped ── */}
        <div className='grid grid-cols-2 gap-4 px-0'>
          {/* Role multi-select */}
          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-text-sub uppercase tracking-wide flex items-center gap-1'>
              <Shield size={11} /> Vai trò
            </label>
            <div className='relative'>
              {/* Trigger - div avoids nested <button> hydration error */}
              <div
                role='button'
                tabIndex={0}
                onClick={() => setRoleDropdownOpen((v) => !v)}
                onKeyDown={(e) =>
                  (e.key === 'Enter' || e.key === ' ') &&
                  setRoleDropdownOpen((v) => !v)
                }
                className='w-full h-10 flex items-center justify-between gap-2 rounded-lg border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 cursor-pointer hover:border-blue-300 transition-colors select-none overflow-hidden'
              >
                {/* Pills - single row, never wrap */}
                <span className='flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden'>
                  {selectedRoleIds.length === 0 ? (
                    <span className='text-text-sub opacity-50 italic text-xs'>
                      Chọn vai trò...
                    </span>
                  ) : (
                    <>
                      {selectedRoleIds.slice(0, 2).map((id) => {
                        const role = allRoles.find((r) => r.roleId === id);
                        return role ? (
                          <span
                            key={id}
                            className='inline-flex items-center gap-1 rounded-full bg-blue-100 border border-blue-300 pl-2 pr-1 py-0.5 text-xs text-blue-800 font-medium whitespace-nowrap shrink-0'
                          >
                            <Shield size={9} className='shrink-0' />
                            {role.name}
                            <span
                              role='button'
                              tabIndex={0}
                              aria-label={`Xóa ${role.name}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRoleIds((prev) =>
                                  prev.filter((rid) => rid !== id),
                                );
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.stopPropagation();
                                  setSelectedRoleIds((prev) =>
                                    prev.filter((rid) => rid !== id),
                                  );
                                }
                              }}
                              className='ml-0.5 flex items-center justify-center rounded-full w-3.5 h-3.5 hover:bg-blue-300 cursor-pointer'
                            >
                              <X size={8} />
                            </span>
                          </span>
                        ) : null;
                      })}
                      {selectedRoleIds.length > 2 && (
                        <span className='inline-flex items-center rounded-full bg-gray-100 border border-gray-200 px-2 py-0.5 text-xs text-gray-500 font-medium whitespace-nowrap shrink-0'>
                          +{selectedRoleIds.length - 2}
                        </span>
                      )}
                    </>
                  )}
                </span>
                <ChevronDown
                  size={15}
                  className={`shrink-0 text-gray-400 transition-transform duration-150 ${roleDropdownOpen ? 'rotate-180' : ''}`}
                />
              </div>

              {/* Dropdown panel */}
              {roleDropdownOpen && (
                <div className='absolute z-50 top-full mt-1.5 w-full rounded-xl border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card shadow-xl dark:shadow-black/30 overflow-hidden'>
                  <div className='px-3 pt-2.5 pb-1 border-b border-gray-100 dark:border-white/8'>
                    <p className='text-[11px] font-semibold text-text-sub uppercase tracking-wider'>
                      Chọn vai trò ({selectedRoleIds.length} đã chọn)
                    </p>
                  </div>
                  {allRoles.length === 0 ? (
                    <p className='px-4 py-3 text-xs text-text-sub italic'>
                      Không có vai trò nào
                    </p>
                  ) : (
                    <div className='max-h-44 overflow-y-auto py-1'>
                      {allRoles.map((role) => {
                        const checked = selectedRoleIds.includes(role.roleId);
                        return (
                          <label
                            key={role.roleId}
                            className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                              checked
                                ? 'bg-blue-50 dark:bg-blue-900/20'
                                : 'hover:bg-gray-50 dark:hover:bg-white/5'
                            }`}
                          >
                            <input
                              type='checkbox'
                              checked={checked}
                              onChange={() =>
                                setSelectedRoleIds((prev) =>
                                  checked
                                    ? prev.filter((id) => id !== role.roleId)
                                    : [...new Set([...prev, role.roleId])],
                                )
                              }
                              className='h-4 w-4 rounded accent-blue-600 shrink-0'
                            />
                            <span className='flex-1 min-w-0'>
                              <span
                                className={`block text-sm font-semibold ${checked ? 'text-blue-700' : 'text-text-main'}`}
                              >
                                {role.name}
                              </span>
                              {role.description && (
                                <span className='block text-xs text-text-sub truncate'>
                                  {role.description}
                                </span>
                              )}
                            </span>
                            {!role.active && (
                              <span className='shrink-0 text-[10px] text-orange-600 border border-orange-200 bg-orange-50 rounded-full px-2 py-0.5 font-medium'>
                                Tắt
                              </span>
                            )}
                            {checked && (
                              <span className='shrink-0 text-blue-500'>
                                <CheckCircle2 size={14} />
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}
                  <div className='border-t border-gray-100 dark:border-white/8 px-3 py-2 flex justify-end'>
                    <button
                      type='button'
                      onClick={() => setRoleDropdownOpen(false)}
                      className='text-xs font-medium text-blue-600 hover:text-blue-800'
                    >
                      Xong
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nickname - below role select */}
          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-text-sub uppercase tracking-wide flex items-center gap-1'>
              <UserIcon size={11} /> Nickname
            </label>
            <Input
              value={formState.nickname}
              onChange={(e) =>
                setFormState((s) => ({ ...s, nickname: e.target.value }))
              }
              placeholder='Biệt danh'
              className='bg-gray-50/50 h-10'
            />
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
              !formState.firstName.trim() ||
              !formState.email.trim()
            }
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface UserDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  user?: UserResponse | null;
}

export function UserDeleteDialog({
  open,
  onClose,
  user,
}: UserDeleteDialogProps) {
  const deleteMutation = useDeleteUserMutation();
  const handleDelete = async () => {
    if (!user) return;
    try {
      await deleteMutation.mutateAsync(user.userId);
      toast.success('Xóa người dùng thành công');
      onClose();
    } catch (err) {
      const appErr = normalizeError(err);
      toast.error(appErr.message);
    }
  };

  const isSubmitting = deleteMutation.isPending;
  const userName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    : '';

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-text-main'>Xóa người dùng</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa người dùng{' '}
            <span className='font-semibold text-text-main'>{userName}</span>?
            Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className='flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-white/5 px-4 py-3 border border-gray-200 dark:border-white/8'>
            <div className='h-9 w-9 rounded-full bg-theme-primary-start/10 flex items-center justify-center shrink-0'>
              <span className='text-sm font-bold text-theme-primary-start'>
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className='text-sm font-medium text-text-main'>{userName}</p>
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
