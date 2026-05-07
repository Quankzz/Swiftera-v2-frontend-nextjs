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
import {
  useCreatePermissionMutation,
  useCreateModuleMutation,
  useDeleteModuleMutation,
  useDeletePermissionMutation,
  useModulesQuery,
  usePermissionDetailQuery,
  useUpdatePermissionMutation,
  usePermissionsListQuery,
} from "@/features/roles/hooks/use-roles";
import { useIsDirty } from "@/hooks/use-is-dirty";
import type {
  CreatePermissionInput,
  PermissionResponse,
  UpdatePermissionInput,
} from "@/features/roles/types";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

interface PermissionFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialPermission?: PermissionResponse | null;
  presetModule?: string;
}

export function PermissionFormDialog({
  open,
  onClose,
  initialPermission,
  presetModule,
}: PermissionFormDialogProps) {
  const isEdit = !!initialPermission;
  const { data: permissionDetail, isFetching } = usePermissionDetailQuery(
    initialPermission?.permissionId,
  );
  const { data: moduleOptions } = useModulesQuery();

  const [formState, setFormState] = useState(() => ({
    name: initialPermission?.name || "",
    apiPath: initialPermission?.apiPath || "",
    httpMethod: initialPermission?.httpMethod || "GET",
    module: initialPermission?.module || presetModule || "",
  }));

  useEffect(() => {
    if (!open) return;
    if (!isEdit) {
      startTransition(() =>
        setFormState({
          name: "",
          apiPath: "",
          httpMethod: "GET",
          module: presetModule || "",
        }),
      );
      return;
    }
    if (permissionDetail) {
      startTransition(() =>
        setFormState({
          name: permissionDetail.name,
          apiPath: permissionDetail.apiPath,
          httpMethod: permissionDetail.httpMethod,
          module: permissionDetail.module,
        }),
      );
    }
  }, [
    open,
    isEdit,
    permissionDetail,
    initialPermission?.permissionId,
    presetModule,
  ]);

  const initialPermissionState = permissionDetail
    ? {
        name: permissionDetail.name,
        apiPath: permissionDetail.apiPath,
        httpMethod: permissionDetail.httpMethod,
        module: permissionDetail.module,
      }
    : { name: initialPermission?.name || "", apiPath: initialPermission?.apiPath || "", httpMethod: initialPermission?.httpMethod || "GET", module: initialPermission?.module || presetModule || "" };
  const isDirty = useIsDirty(initialPermissionState, formState);

  const createMutation = useCreatePermissionMutation();
  const updateMutation = useUpdatePermissionMutation();

  const handleSubmit = async () => {
    if (!formState.name.trim() || !formState.apiPath.trim()) return;

    if (isEdit && initialPermission) {
      const payload: UpdatePermissionInput = {
        name: formState.name.trim(),
        apiPath: formState.apiPath.trim(),
        httpMethod: formState.httpMethod,
        module: formState.module.trim() || "Chưa phân loại",
      };
      await updateMutation.mutateAsync({
        permissionId: initialPermission.permissionId,
        payload,
      });
    } else {
      const payload: CreatePermissionInput = {
        name: formState.name.trim(),
        apiPath: formState.apiPath.trim(),
        httpMethod: formState.httpMethod,
        module: formState.module.trim() || "Chưa phân loại",
      };
      await createMutation.mutateAsync(payload);
    }
    onClose();
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      key={initialPermission?.permissionId ?? "new-permission"}
      open={open}
      onOpenChange={(val) => !val && onClose()}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-text-main">
            {isEdit ? "Chỉnh sửa quyền" : "Thêm quyền mới"}
          </DialogTitle>
          <DialogDescription>
            Quản lý quyền truy cập API. Các trường có dấu * là bắt buộc.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {isEdit && isFetching && (
            <div className="text-sm text-text-sub">
              Đang tải chi tiết quyền...
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-text-main text-sm font-medium mb-1">
              Tên quyền *
            </label>
            <Input
              value={formState.name}
              onChange={(e) =>
                setFormState((s) => ({ ...s, name: e.target.value }))
              }
              placeholder="VD: Xem danh sách người dùng"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="block text-text-main text-sm font-medium mb-1">
                Phương thức
              </label>
              <select
                className="w-full rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 py-2 text-sm text-text-main"
                value={formState.httpMethod}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, httpMethod: e.target.value }))
                }
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2 space-y-2">
              <label className="block text-text-main text-sm font-medium mb-1">
                API Path *
              </label>
              <Input
                value={formState.apiPath}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, apiPath: e.target.value }))
                }
                placeholder="/api/v1/users"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-text-main text-sm font-medium mb-1">
              Module
            </label>
            <div className="flex gap-2">
              <select
                className="w-1/2 rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 py-2 text-sm text-text-main"
                value={formState.module}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, module: e.target.value }))
                }
              >
                <option value="">-- Chọn module --</option>
                {(moduleOptions || []).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <Input
                value={formState.module}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, module: e.target.value }))
                }
                placeholder="Hoặc nhập module mới"
                className="w-1/2"
              />
            </div>
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
            disabled={isSubmitting || !isDirty || !formState.name.trim() || !formState.apiPath.trim()}
          >
            {isSubmitting ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo mới"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface PermissionDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  permission?: PermissionResponse | null;
}

export function PermissionDeleteDialog({
  open,
  onClose,
  permission,
}: PermissionDeleteDialogProps) {
  const deleteMutation = useDeletePermissionMutation();

  const handleDelete = async () => {
    if (!permission) return;
    await deleteMutation.mutateAsync(permission.permissionId);
    onClose();
  };

  const isSubmitting = deleteMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-text-main">Xóa quyền</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa quyền{" "}
            <span className="font-semibold text-text-main">
              {permission?.name}
            </span>
            ? Hành động này không thể hoàn tác.
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

interface ModuleFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialModuleName?: string | null;
}

export function ModuleFormDialog({
  open,
  onClose,
  initialModuleName,
}: ModuleFormDialogProps) {
  const isEdit = !!initialModuleName;

  // For rename: fetch all permissions in the old module so we can re-assign them
  const { data: allPermsData } = usePermissionsListQuery({ size: 1000 });
  const createModuleMutation = useCreateModuleMutation();
  const deleteModuleMutation = useDeleteModuleMutation();

  const [moduleName, setModuleName] = useState("");

  useEffect(() => {
    if (open) startTransition(() => setModuleName(initialModuleName || ""));
  }, [open, initialModuleName]);

  const isModuleDirty = moduleName.trim() !== (initialModuleName ?? "");

  const handleSubmit = async () => {
    if (!moduleName.trim()) return;

    if (isEdit && initialModuleName) {
      // Rename = create new module with all IDs from old module, then delete old module
      const permsInOldModule = (allPermsData?.content ?? []).filter(
        (p) => p.module === initialModuleName,
      );
      const permissionIds = permsInOldModule.map((p) => p.permissionId);
      await createModuleMutation.mutateAsync({
        moduleName: moduleName.trim(),
        permissionIds,
      });
      await deleteModuleMutation.mutateAsync(initialModuleName);
    } else {
      // Create empty module (no permissions assigned yet)
      await createModuleMutation.mutateAsync({
        moduleName: moduleName.trim(),
        permissionIds: [],
      });
    }
    onClose();
    setModuleName("");
  };

  const isSubmitting =
    createModuleMutation.isPending || deleteModuleMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-text-main">
            {isEdit ? "Sửa tên module" : "Thêm Module"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Đổi tên module. Các quyền bên trong sẽ được cập nhật theo."
              : "Tạo module để nhóm các quyền liên quan."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="block text-text-main text-sm font-medium mb-1">
            Tên module
          </label>
          <Input
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value)}
            placeholder="VD: Products"
          />
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
            disabled={isSubmitting || !isModuleDirty || !moduleName.trim()}
          >
            {isSubmitting
              ? "Đang lưu..."
              : isEdit
                ? "Lưu thay đổi"
                : "Tạo module"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ModuleDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  moduleName?: string | null;
}

export function ModuleDeleteDialog({
  open,
  onClose,
  moduleName,
}: ModuleDeleteDialogProps) {
  const deleteModuleMutation = useDeleteModuleMutation();

  const handleDelete = async () => {
    if (!moduleName) return;
    await deleteModuleMutation.mutateAsync(moduleName);
    onClose();
  };

  const isSubmitting = deleteModuleMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-text-main">Xóa module</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa module{" "}
            <span className="font-semibold text-text-main">{moduleName}</span>?{" "}
            Các quyền bên trong sẽ được chuyển về{" "}
            <span className="font-semibold">Chưa phân loại</span>.
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
            {isSubmitting ? "Đang xóa..." : "Xóa module"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
