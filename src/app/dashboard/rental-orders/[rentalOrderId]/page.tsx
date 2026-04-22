"use client";

import { use } from "react";
import { RentalOrderDetailView } from "@/features/rental-orders/components/rental-order-detail-view";

interface Props {
  params: Promise<{ rentalOrderId: string }>;
}

export default function RentalOrderDetailPage({ params }: Props) {
  const { rentalOrderId } = use(params);
  return <RentalOrderDetailView rentalOrderId={rentalOrderId} />;
}
