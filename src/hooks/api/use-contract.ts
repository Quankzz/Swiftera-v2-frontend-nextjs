import { useQuery } from '@tanstack/react-query';
import { contractKeys } from '@/hooks/api/contract.keys';
import { getContractByRentalOrderId } from '@/api/contractApi';
import type { RentalContractResponse } from '@/api/contractApi';

/** Mã lỗi backend: CONTRACT_NOT_FOUND (doc) */
const CONTRACT_NOT_FOUND = 2401;

function isContractNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as {
    errors?: Array<{ code?: number }>;
    code?: number;
  };
  if (e.code === CONTRACT_NOT_FOUND) return true;
  return e.errors?.some((x) => x.code === CONTRACT_NOT_FOUND) ?? false;
}

async function fetchContractByRentalOrder(
  rentalOrderId: string,
): Promise<RentalContractResponse | null> {
  try {
    const res = await getContractByRentalOrderId(rentalOrderId);
    return res.data.data ?? null;
  } catch (e: unknown) {
    if (isContractNotFoundError(e)) return null;
    throw e;
  }
}

/**
 * API-094: Hợp đồng gắn đơn thuê (sau PAID).
 * Trả `null` khi chưa có hợp đồng (404 / CONTRACT_NOT_FOUND).
 */
export function useRentalContractByOrderQuery(
  rentalOrderId: string,
  options?: { enabled?: boolean },
) {
  const enabled = !!rentalOrderId && (options?.enabled ?? true);

  return useQuery({
    queryKey: contractKeys.byRentalOrder(rentalOrderId),
    queryFn: () => fetchContractByRentalOrder(rentalOrderId),
    enabled,
    staleTime: 60_000,
    retry: false,
  });
}
