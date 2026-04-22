"use client";

import { startTransition, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useRoleDetailQuery,
  useUpdateRoleMutation,
} from "@/features/roles/hooks/use-roles";
import type {
  CreateRoleInput,
  UpdateRoleInput,
  RoleResponse,
} from "@/features/roles/types";

interface RoleFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialRole?: RoleResponse | null;
}

export function RoleFormDialog({
  open,
  onClose,
  initialRole,
}: RoleFormDialogProps) {
  const isEdit = !!initialRole;
  const { data: roleDetail, isFetching } = useRoleDetailQuery(
    initialRole?.roleId,
  );

  const buildState = (role?: RoleResponse | null) => ({
    name: role?.name || "",
    description: role?.description || "",
    active: role?.active ?? true,
  });

  const [formState, setFormState] = useState(buildState(initialRole));

  useEffect(() => {
    if (!open) return;
    if (!isEdit) {
      startTransition(() => setFormState(buildState(null)));
      return;
    }
    if (roleDetail) {
      startTransition(() => setFormState(buildState(roleDetail)));
    }
  }, [open, isEdit, roleDetail, initialRole?.roleId]);

  const createMutation = useCreateRoleMutation();
  const updateMutation = useUpdateRoleMutation();

  const handleSubmit = async () => {
    if (!formState.name.trim()) return;

    if (isEdit && initialRole) {
      // Chỉ gửi các trường thực sự thay đổi so với dữ liệu gốc
      const source = roleDetail ?? initialRole;
      const payload: UpdateRoleInput = {};
      const trimmedName = formState.name.trim();
      const trimmedDesc = formState.description
        ? formState.description.trim()
        : null;
      if (trimmedName !== (source.name ?? "")) payload.name = trimmedName;
      if (trimmedDesc !== (source.description ?? null))
        payload.description = trimmedDesc;
      if (formState.active !== (source.active ?? true))
        payload.active = formState.active;

      if (Object.keys(payload).length === 0) {
        onClose();
        return;
      }
      await updateMutation.mutateAsync({ roleId: initialRole.roleId, payload });
    } else {
      const payload: CreateRoleInput = {
        name: formState.name.trim(),
        description: formState.description
          ? formState.description.trim()
          : null,
        active: formState.active,
      };
      await createMutation.mutateAsync(payload);
    }
    onClose();
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      key={initialRole?.roleId ?? "new-role"}
      open={open}
      onOpenChange={(val) => !val && onClose()}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-text-main">
            {isEdit ? "Chỉnh sửa vai trò" : "Thêm vai trò"}
          </DialogTitle>
          <DialogDescription>
            Nhập thông tin vai trò. Các trường có dấu * là bắt buộc.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {isEdit && isFetching && (
            <div className="text-sm text-text-sub">
              Đang tải thông tin chi tiết...
            </div>
          )}
          <div className="space-y-2">
            <label className="block text-text-main text-sm font-medium mb-1">
              Tên vai trò <span className="text-theme-primary-start"> * </span>
            </label>
            <Input
              value={formState.name}
              onChange={(e) =>
                setFormState((s) => ({ ...s, name: e.target.value }))
              }
              placeholder="VD: Quản trị viên"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-text-main text-sm font-medium mb-1">
              Mô tả
            </label>
            <Textarea
              value={formState.description}
              onChange={(e) =>
                setFormState((s) => ({ ...s, description: e.target.value }))
              }
              placeholder="Mô tả ngắn về vai trò"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between rounded-md border border-gray-200 dark:border-white/8 px-3 py-2">
            <div>
              <p className="text-sm font-medium text-text-main">Trạng thái</p>
              <p className="text-xs text-text-sub">
                Bật nếu vai trò đang hoạt động
              </p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={formState.active}
              onChange={(e) =>
                setFormState((s) => ({ ...s, active: e.target.checked }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-text-sub"
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-theme-primary-start hover:opacity-90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo mới"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface RoleDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  role?: RoleResponse | null;
}

export function RoleDeleteDialog({
  open,
  onClose,
  role,
}: RoleDeleteDialogProps) {
  const deleteMutation = useDeleteRoleMutation();

  const handleDelete = async () => {
    if (!role) return;
    await deleteMutation.mutateAsync(role.roleId);
    onClose();
  };

  const isSubmitting = deleteMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-text-main">Xóa vai trò</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa vai trò{" "}
            <span className="font-semibold text-text-main">{role?.name}</span>?
            Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-text-sub"
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="bg-theme-primary-start hover:bg-theme-primary-end text-white"
          >
            {isSubmitting ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
