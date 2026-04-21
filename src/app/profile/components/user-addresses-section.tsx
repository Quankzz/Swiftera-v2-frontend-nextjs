'use client';

import { useMemo, useState } from 'react';
import { MapPin, Pencil, Plus, Trash2, Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  useUserAddressesQuery,
  useCreateUserAddress,
  useUpdateUserAddress,
  useDeleteUserAddress,
} from '@/hooks/api/use-user-addresses';
import {
  AddressFormDialog,
  type AddressFormValues,
} from '@/components/user-address/address-form-dialog';
import type { UserAddressResponse } from '@/api/userAddressApi';
import { getApiErrorMessage } from '../utils';

function addrToForm(a: UserAddressResponse): AddressFormValues {
  return {
    recipientName: a.recipientName,
    phoneNumber: a.phoneNumber,
    addressLine: a.addressLine ?? '',
    ward: a.ward ?? '',
    district: a.district ?? '',
    city: a.city ?? '',
    isDefault: a.isDefault,
  };
}

function formatLine(a: UserAddressResponse): string {
  return [a.addressLine, a.ward, a.district, a.city].filter(Boolean).join(', ');
}

export function UserAddressesSection() {
  const {
    data: addresses,
    isLoading,
    isError,
    refetch,
  } = useUserAddressesQuery();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<UserAddressResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const createMut = useCreateUserAddress({
    onSuccess: () => {
      toast.success('Đã thêm địa chỉ.');
      setAddOpen(false);
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, 'Không thể thêm địa chỉ.')),
  });

  const updateMut = useUpdateUserAddress({
    onSuccess: () => {
      toast.success('Đã cập nhật địa chỉ.');
      setEditing(null);
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, 'Không thể cập nhật địa chỉ.')),
  });

  const deleteMut = useDeleteUserAddress({
    onSuccess: () => toast.success('Đã xóa địa chỉ.'),
    onError: (err) =>
      toast.error(getApiErrorMessage(err, 'Không thể xóa địa chỉ.')),
  });

  const editInitial = useMemo(
    () => (editing ? addrToForm(editing) : undefined),
    [editing],
  );

  const addDialogInitial = useMemo(
    () => ({ isDefault: (addresses ?? []).length === 0 }),
    [addresses],
  );

  function handleCreate(values: AddressFormValues) {
    createMut.mutate({
      recipientName: values.recipientName,
      phoneNumber: values.phoneNumber,
      addressLine: values.addressLine || undefined,
      ward: values.ward || undefined,
      district: values.district || undefined,
      city: values.city || undefined,
      isDefault: values.isDefault,
    });
  }

  function handleUpdate(values: AddressFormValues) {
    if (!editing) return;
    updateMut.mutate({
      userAddressId: editing.userAddressId,
      input: {
        recipientName: values.recipientName,
        phoneNumber: values.phoneNumber,
        addressLine: values.addressLine || undefined,
        ward: values.ward || undefined,
        district: values.district || undefined,
        city: values.city || undefined,
        isDefault: values.isDefault,
      },
    });
  }

  function handleDelete(id: string) {
    setConfirmDeleteId(id);
  }

  function confirmDeleteAddress() {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    deleteMut.mutate(confirmDeleteId, {
      onSettled: () => {
        setDeletingId(null);
        setConfirmDeleteId(null);
      },
    });
  }

  if (isLoading) {
    return (
      <div className='rounded-xl border border-white/20 dark:border-white/8 bg-white/60 dark:bg-white/5 backdrop-blur-sm p-6 space-y-4'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-24 w-full rounded-xl' />
        <Skeleton className='h-24 w-full rounded-xl' />
      </div>
    );
  }

  if (isError) {
    return (
      <div className='rounded-xl border border-red-200 dark:border-red-500/25 bg-red-50/80 dark:bg-red-500/10 px-6 py-6 text-sm text-red-800 dark:text-red-300'>
        <p className='font-medium'>Không tải được sổ địa chỉ.</p>
        <Button
          variant='outline'
          className='mt-3'
          onClick={() => void refetch()}
        >
          Thử lại
        </Button>
      </div>
    );
  }

  const list = addresses ?? [];

  return (
    <div className='rounded-xl border border-white/20 dark:border-white/8 bg-white/60 dark:bg-white/5 backdrop-blur-sm shadow-lg p-6 sm:p-8'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-amber-100 dark:bg-amber-500/15 rounded-lg'>
            <MapPin className='h-5 w-5 text-amber-700 dark:text-amber-400' />
          </div>
          <div>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-text-main'>
              Sổ địa chỉ
            </h2>
            <p className='text-sm text-gray-600 dark:text-text-sub'>
              Lưu địa chỉ giao hàng để đặt thuê nhanh hơn.
            </p>
          </div>
        </div>
        <Button
          type='button'
          className='gap-2 bg-theme-primary-start hover:opacity-90 text-white shrink-0'
          onClick={() => setAddOpen(true)}
        >
          <Plus className='h-4 w-4' />
          Thêm địa chỉ
        </Button>
      </div>

      {list.length === 0 ? (
        <div className='text-center py-12 rounded-xl border border-dashed border-border bg-muted/30'>
          <MapPin className='h-10 w-10 mx-auto text-muted-foreground/50 mb-3' />
          <p className='text-sm text-muted-foreground mb-4'>
            Bạn chưa có địa chỉ nào.
          </p>
          <Button
            type='button'
            variant='outline'
            className='gap-2'
            onClick={() => setAddOpen(true)}
          >
            <Plus className='h-4 w-4' />
            Thêm địa chỉ đầu tiên
          </Button>
        </div>
      ) : (
        <ul className='space-y-3'>
          {list.map((a) => {
            const busy =
              deletingId === a.userAddressId ||
              (deleteMut.isPending && deleteMut.variables === a.userAddressId);
            return (
              <li
                key={a.userAddressId}
                className={cn(
                  'rounded-xl border p-4 flex flex-col sm:flex-row sm:items-start gap-3 transition-colors',
                  a.isDefault
                    ? 'border-blue-300/70 bg-blue-50/50 dark:border-blue-800/50 dark:bg-blue-950/20'
                    : 'border-border/80 bg-background/50',
                )}
              >
                <div className='min-w-0 flex-1 space-y-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span className='font-semibold text-foreground'>
                      {a.recipientName}
                    </span>
                    {a.isDefault && (
                      <Badge
                        variant='secondary'
                        className='gap-1 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200'
                      >
                        <Star className='size-3 fill-amber-400 text-amber-600' />
                        Mặc định
                      </Badge>
                    )}
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    {a.phoneNumber}
                  </p>
                  {formatLine(a) ? (
                    <p className='text-sm text-foreground/90 leading-relaxed'>
                      {formatLine(a)}
                    </p>
                  ) : (
                    <p className='text-xs text-muted-foreground italic'>
                      Chưa nhập địa chỉ chi tiết
                    </p>
                  )}
                </div>
                <div className='flex items-center gap-1 shrink-0 sm:flex-col sm:items-end'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='text-muted-foreground hover:text-foreground'
                    onClick={() => setEditing(a)}
                    disabled={busy}
                  >
                    <Pencil className='h-4 w-4' />
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='text-muted-foreground hover:text-destructive'
                    onClick={() => handleDelete(a.userAddressId)}
                    disabled={busy}
                  >
                    {busy ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Trash2 className='h-4 w-4' />
                    )}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AddressFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title='Thêm địa chỉ'
        submitLabel={createMut.isPending ? 'Đang lưu…' : 'Lưu địa chỉ'}
        showDefaultCheckbox
        isSubmitting={createMut.isPending}
        initialValues={addDialogInitial}
        onSubmit={handleCreate}
      />

      <AddressFormDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title='Sửa địa chỉ'
        submitLabel={updateMut.isPending ? 'Đang lưu…' : 'Cập nhật'}
        showDefaultCheckbox
        isSubmitting={updateMut.isPending}
        initialValues={editInitial}
        onSubmit={handleUpdate}
      />

      <Dialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa địa chỉ</DialogTitle>
            <DialogDescription>
              Địa chỉ này sẽ bị xóa khỏi sổ địa chỉ của bạn.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setConfirmDeleteId(null)}
              disabled={deleteMut.isPending}
            >
              Hủy
            </Button>
            <Button
              variant='destructive'
              onClick={confirmDeleteAddress}
              disabled={deleteMut.isPending}
            >
              {deleteMut.isPending ? 'Đang xóa…' : 'Xóa địa chỉ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
