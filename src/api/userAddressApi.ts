/**
 * Module 19: USER ADDRESSES (API-115 → API-119) [AUTH]
 * Base: /api/v1
 */

import type { AxiosResponse } from "axios";
import { httpService } from "@/api/http";

const authOpts = { requireToken: true as const };

export interface UserAddressResponse {
  userAddressId: string;
  recipientName: string;
  phoneNumber: string;
  addressLine: string | null;
  ward: string | null;
  district: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserAddressListEnvelope {
  success: boolean;
  message?: string;
  data: UserAddressResponse[];
  meta?: { timestamp: string; instance: string };
}

export interface UserAddressSingleEnvelope {
  success: boolean;
  message?: string;
  data: UserAddressResponse;
  meta?: { timestamp: string; instance: string };
}

export interface UserAddressVoidEnvelope {
  success: boolean;
  message: string;
  data: null;
  meta?: { timestamp: string; instance: string };
}

/** API-115 POST */
export interface CreateUserAddressInput {
  recipientName: string;
  phoneNumber: string;
  addressLine?: string;
  ward?: string;
  district?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

/** API-118 PATCH - tất cả field tùy chọn */
export type UpdateUserAddressInput = Partial<CreateUserAddressInput>;

export function createUserAddress(
  input: CreateUserAddressInput,
): Promise<AxiosResponse<UserAddressSingleEnvelope>> {
  return httpService.post<UserAddressSingleEnvelope>(
    "/user-addresses",
    input,
    authOpts,
  );
}

export function getUserAddresses(): Promise<
  AxiosResponse<UserAddressListEnvelope>
> {
  return httpService.get<UserAddressListEnvelope>("/user-addresses", authOpts);
}

export function getUserAddressById(
  userAddressId: string,
): Promise<AxiosResponse<UserAddressSingleEnvelope>> {
  return httpService.get<UserAddressSingleEnvelope>(
    `/user-addresses/${userAddressId}`,
    authOpts,
  );
}

export function updateUserAddress(
  userAddressId: string,
  input: UpdateUserAddressInput,
): Promise<AxiosResponse<UserAddressSingleEnvelope>> {
  return httpService.patch<UserAddressSingleEnvelope>(
    `/user-addresses/${userAddressId}`,
    input,
    authOpts,
  );
}

export function deleteUserAddress(
  userAddressId: string,
): Promise<AxiosResponse<UserAddressVoidEnvelope>> {
  return httpService.delete<UserAddressVoidEnvelope>(
    `/user-addresses/${userAddressId}`,
    authOpts,
  );
}
