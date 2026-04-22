"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { RentalOrdersTable } from "@/components/dashboard/rental-orders/rental-order-table";
import { RentalOrderAssignDialog } from "@/features/rental-orders/components/rental-order-assign-dialog";
import type { RentalOrderResponse } from "@/features/rental-orders/types";

export default function RentalOrdersPage() {
  const [selectedOrder, setSelectedOrder] =
    useState<RentalOrderResponse | null>(null);

  return (
    <div className="flex flex-col gap-6 w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-blue-500/10 mt-0.5">
            <ClipboardList size={20} className="text-blue-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-text-main">
              Đơn thuê
            </h2>
            <p className="text-text-sub mt-1 text-sm">
              Quản lý đơn thuê thiết bị và phân công nhân viên giao hàng theo
              hub.
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="w-full">
        <RentalOrdersTable onAssign={setSelectedOrder} />
      </div>

      {/* Order assign dialog (chi tiết đơn + chọn nhân viên) */}
      {selectedOrder && (
        <RentalOrderAssignDialog
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
