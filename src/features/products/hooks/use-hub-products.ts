/**
 * useHubAvailableProducts
 *
 * Lấy danh sách sản phẩm khả dụng (AVAILABLE) tại một hub cụ thể.
 *
 * Hai bước do giới hạn backend RSQL:
 *  Bước 1 - GET /inventory-items?filter=status:'AVAILABLE'&size=200
 *            Backend KHÔNG hỗ trợ filter hubId qua RSQL (trả 500),
 *            nên fetch toàn hệ thống rồi filter client-side theo hubId.
 *  Bước 2 - GET /products?filter=productId:'id1' or productId:'id2'
 *            Lấy đầy đủ chi tiết sản phẩm (ảnh, giá) cho các productId unique.
 *
 * Fallback: nếu /products lỗi, vẫn hiển thị tên từ inventory response.
 */

import { useQuery } from "@tanstack/react-query";
import { getProductsByHub } from "../api/product.service";
import type { ProductResponse } from "../types";

// ─── Public types ─────────────────────────────────────────────────────────────

export interface HubProduct {
  product: ProductResponse;
  /** Số lượng thiết bị khả dụng tại hub */
  availableCount: number;
}

export interface HubAvailableProductsResult {
  hubProducts: HubProduct[];
  /** Tổng số lượng thiết bị khả dụng (individual units) */
  totalAvailable: number;
}

// ─── Query key factory ────────────────────────────────────────────────────────

export const hubProductKeys = {
  all: ["hub-available-products"] as const,
  byHub: (hubId: string) => [...hubProductKeys.all, hubId] as const,
};

// ─── Core fetch (pure async) ──────────────────────────────────────────────────

async function fetchHubAvailableProducts(
  hubId: string,
): Promise<HubAvailableProductsResult> {
  const res = await getProductsByHub(hubId, {
    page: 1,
    size: 50,
    sort: "createdAt,desc",
    filter: "isActive:true",
    includeDescendants: false,
  });

  const products = res.content ?? [];
  const hubProducts: HubProduct[] = products.map((p) => ({
    product: p,
    availableCount: p.availableStock ?? 0,
  }));
  const totalAvailable = hubProducts.reduce(
    (sum, hp) => sum + hp.availableCount,
    0,
  );

  return { hubProducts, totalAvailable };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * @param hubId   - hub_id của hub cần xem (undefined = tắt query)
 * @param enabled - gate bổ sung, ví dụ chỉ fetch khi modal mở
 */
export function useHubAvailableProducts(
  hubId: string | undefined,
  enabled = true,
) {
  return useQuery<HubAvailableProductsResult>({
    queryKey: hubProductKeys.byHub(hubId ?? "__none__"),
    queryFn: () => fetchHubAvailableProducts(hubId!),
    enabled: !!hubId && enabled,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
}
