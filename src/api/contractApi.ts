/**
 * Module 14: CONTRACTS (API-093 → API-094) [AUTH]
 * Base: /api/v1
 */

import type { AxiosResponse } from 'axios';
import { httpService } from '@/api/http';

const authOpts = { requireToken: true as const };

export type ContractAcceptMethod = 'CLICK' | 'SIGNATURE';

/** API-093 / API-094 response `data` */
export interface RentalContractResponse {
  rentalContractId: string;
  rentalOrderId: string;
  policyDocumentId: string | null;
  contractNumber: string;
  contractVersion: string;
  acceptMethod: ContractAcceptMethod | string;
  acceptedAt: string | null;
  contractPdfUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RentalContractEnvelope {
  success?: boolean;
  message?: string;
  data: RentalContractResponse;
  meta?: { timestamp: string; instance: string };
}

/**
 * API-093: Lấy hợp đồng theo ID [AUTH]
 */
export function getContractById(
  rentalContractId: string,
): Promise<AxiosResponse<RentalContractEnvelope>> {
  return httpService.get<RentalContractEnvelope>(
    `/contracts/${rentalContractId}`,
    authOpts,
  );
}

/**
 * API-094: Lấy hợp đồng theo đơn thuê [AUTH]
 *
 * Contract được tạo tự động sau khi thanh toán thành công (PAID).
 */
export function getContractByRentalOrderId(
  rentalOrderId: string,
): Promise<AxiosResponse<RentalContractEnvelope>> {
  return httpService.get<RentalContractEnvelope>(
    `/contracts/rental-order/${rentalOrderId}`,
    authOpts,
  );
}
