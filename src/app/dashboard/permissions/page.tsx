"use client";

import { useState } from "react";
import { PermissionsBoard } from "@/components/dashboard/permissions/permissions-board";
import {
  ModuleFormDialog,
  ModuleDeleteDialog,
  PermissionDeleteDialog,
  PermissionFormDialog,
} from "@/components/dashboard/permissions/permissions-dialogs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { PermissionResponse } from "@/features/roles/types";

export default function PermissionsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [moduleOpen, setModuleOpen] = useState(false);
  const [moduleDeleteOpen, setModuleDeleteOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedPermission, setSelectedPermission] =
    useState<PermissionResponse | null>(null);
  const [presetModule, setPresetModule] = useState<string | undefined>(
    undefined,
  );

  const handleAddPermission = (moduleName?: string) => {
    setSelectedPermission(null);
    setPresetModule(moduleName);
    setFormOpen(true);
  };

  const handleEditPermission = (permission: PermissionResponse) => {
    setSelectedPermission(permission);
    setPresetModule(permission.module);
    setFormOpen(true);
  };

  const handleDeletePermission = (permission: PermissionResponse) => {
    setSelectedPermission(permission);
    setDeleteOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 w-full p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-main">
            Cấu hình phân quyền (Permissions)
          </h2>
          <p className="text-text-sub mt-1 text-sm">
            Quản lý các quyền API của hệ thống. Bạn có thể kéo thả để nhóm các
            quyền vào từng Module tương ứng.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="lg"
            className="bg-theme-primary-start hover:opacity-90 transition-opacity text-white rounded-sm"
            onClick={() => handleAddPermission()}
          >
            <Plus className="mr-2 h-4 w-4" /> Thêm quyền mới
          </Button>
        </div>
      </div>

      <div className="w-full">
        <PermissionsBoard
          onAddPermission={handleAddPermission}
          onEditPermission={handleEditPermission}
          onDeletePermission={handleDeletePermission}
          onAddModule={() => {
            setSelectedModule(null);
            setModuleOpen(true);
          }}
          onEditModule={(name) => {
            setSelectedModule(name);
            setModuleOpen(true);
          }}
          onDeleteModule={(name) => {
            setSelectedModule(name);
            setModuleDeleteOpen(true);
          }}
        />
      </div>

      <PermissionFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialPermission={selectedPermission}
        presetModule={presetModule}
      />

      <PermissionDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        permission={selectedPermission}
      />

      <ModuleFormDialog
        open={moduleOpen}
        onClose={() => setModuleOpen(false)}
        initialModuleName={selectedModule}
      />

      <ModuleDeleteDialog
        open={moduleDeleteOpen}
        onClose={() => setModuleDeleteOpen(false)}
        moduleName={selectedModule}
      />
    </div>
  );
}
