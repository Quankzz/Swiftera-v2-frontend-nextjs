"use client";

import { useState } from "react";
import { ShieldCheck, Plus } from "lucide-react";
import { PolicyTable } from "@/features/policies/components/policy-table";
import { PolicyCreateDialog } from "@/features/policies/components/policy-create-dialog";

export default function PoliciesPage() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 mt-0.5">
            <ShieldCheck size={20} className="text-indigo-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-text-main">
              Chính sách
            </h2>
            <p className="text-text-sub mt-1 text-sm">
              Quản lý tài liệu chính sách, điều khoản và quy định của hệ thống.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tạo chính sách
        </button>
      </div>

      {/* Table */}
      <div className="w-full">
        <PolicyTable />
      </div>

      {/* Create dialog */}
      <PolicyCreateDialog
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
