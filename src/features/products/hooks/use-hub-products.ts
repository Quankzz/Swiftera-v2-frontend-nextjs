/**
 * useHubAvailableProducts
 *
 * Lấy danh sách sản phẩm khả dụng (AVAILABLE) tại một hub cụ thể.
 *
 * Hai bước do giới hạn backend RSQL:
 *  Bước 1 — GET /inventory-items?filter=status:'AVAILABLE'&size=200
 *            Backend KHÔNG hỗ trợ filter hubId qua RSQL (trả 500),
 *            nên fetch toàn hệ thống rồi filter client-side theo hubId.
 *  Bước 2 — GET /products?filter=productId:'id1' or productId:'id2'
 *            Lấy đầy đủ chi tiết sản phẩm (ảnh, giá) cho các productId unique.
 *
 * Fallback: nếu /products lỗi, vẫn hiển thị tên từ inventory response.
 */

import { useQuery } from '@tanstack/react-query';
import { getInventoryItems, getProducts } from '../api/product.service';
import type { InventoryItemResponse, ProductResponse } from '../types';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface HubProduct {
  product: ProductResponse;
  /** Tất cả inventory items AVAILABLE của sản phẩm này tại hub */
  items: InventoryItemResponse[];
}

export interface HubAvailableProductsResult {
  hubProducts: HubProduct[];
  /** Tổng số lượng thiết bị khả dụng (individual units) */
  totalAvailable: number;
}

// ─── Query key factory ────────────────────────────────────────────────────────

export const hubProductKeys = {
  all: ['hub-available-products'] as const,
  byHub: (hubId: string) => [...hubProductKeys.all, hubId] as const,
};

// ─── Core fetch (pure async) ──────────────────────────────────────────────────

async function fetchHubAvailableProducts(
  hubId: string,
): Promise<HubAvailableProductsResult> {
  // Bước 1: lấy items AVAILABLE toàn hệ thống, filter client-side
  const invRes = await getInventoryItems({
    filter: `status:'AVAILABLE'`,
    size: 200,
  });

  const items = (invRes.content ?? []).filter((i) => i.hubId === hubId);
  if (items.length === 0) return { hubProducts: [], totalAvailable: 0 };

  // Nhóm items theo productId
  const itemsByProduct: Record<string, InventoryItemResponse[]> = {};
  for (const item of items) {
    (itemsByProduct[item.productId] ??= []).push(item);
  }

  const uniqueIds = Object.keys(itemsByProduct);
  const rsqlFilter = uniqueIds.map((id) => `productId:'${id}'`).join(' or ');

  // Bước 2: lấy chi tiết sản phẩm
  try {
    const prodRes = await getProducts({
      filter: rsqlFilter,
      size: uniqueIds.length,
    });
    const productMap: Record<string, ProductResponse> = {};
    for (const p of prodRes.content ?? []) productMap[p.productId] = p;

    const hubProducts = uniqueIds
      .filter((id) => productMap[id])
      .map((id) => ({ product: productMap[id], items: itemsByProduct[id] }));

    return { hubProducts, totalAvailable: items.length };
  } catch {
    // Fallback: dùng productName từ inventory khi /products lỗi
    const hubProducts = uniqueIds.map((id) => ({
      product: {
        productId: id,
        name: itemsByProduct[id][0].productName,
        categoryId: '',
        categoryName: '',
        brand: null,
        voucherId: null,
        color: null,
        colors: [],
        shortDescription: null,
        description: null,
        dailyPrice: 0,
        oldDailyPrice: null,
        depositAmount: null,
        minRentalDays: 1,
        isActive: true,
        images: [],
        availableStock: itemsByProduct[id].length,
        averageRating: null,
        createdAt: '',
        updatedAt: '',
      } satisfies ProductResponse,
      items: itemsByProduct[id],
    }));
    return { hubProducts, totalAvailable: items.length };
  }
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
    queryKey: hubId ? hubProductKeys.byHub(hubId) : hubProductKeys.all,
    queryFn: () => fetchHubAvailableProducts(hubId!),
    enabled: !!hubId && enabled,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
}
