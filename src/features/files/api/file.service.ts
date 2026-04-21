/**
 * File service - tất cả API calls cho files / Azure Blob Storage.
 * HTTP layer: httpService (axios) - dùng http.ts.
 *
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md (Module 5: FILES)
 */

import { httpService } from '@/api/http';
import type { ApiResponse } from '@/types/api.types';
import type {
  UploadSingleResponse,
  UploadMultipleResponse,
  DeleteMultipleFilesInput,
  MoveSingleFileInput,
  MoveMultipleFilesInput,
} from '../types';

const authOpts = { requireToken: true as const };

// ─────────────────────────────────────────────────────────────────────────────
// Upload
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-034: Upload một file
 * POST /storage/azure-blob/upload/single [AUTH]
 * Content-Type: multipart/form-data
 *
 * @param file     File binary
 * @param folder   Tên folder (tùy chọn, default AZURE_STORAGE_CONTAINER_NAME)
 */
export async function uploadSingleFile(
  file: File,
  folder?: string,
): Promise<UploadSingleResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (folder) formData.append('folderName', folder);

  const res = await httpService.post<ApiResponse<UploadSingleResponse>>(
    '/storage/azure-blob/upload/single',
    formData,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-035: Upload nhiều file
 * POST /storage/azure-blob/upload/multiple [AUTH]
 * Content-Type: multipart/form-data
 */
export async function uploadMultipleFiles(
  files: File[],
  folder?: string,
): Promise<UploadMultipleResponse> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }
  if (folder) formData.append('folderName', folder);

  const res = await httpService.post<ApiResponse<UploadMultipleResponse>>(
    '/storage/azure-blob/upload/multiple',
    formData,
    authOpts,
  );
  return res.data.data!;
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-036: Xóa một file
 * DELETE /storage/azure-blob/delete/single?filePath=... [AUTH]
 */
export async function deleteSingleFile(filePath: string): Promise<null> {
  await httpService.delete('/storage/azure-blob/delete/single', {
    ...authOpts,
    params: { filePath },
  });
  return null;
}

/**
 * API-037: Xóa nhiều file
 * DELETE /storage/azure-blob/delete/multiple [AUTH]
 */
export async function deleteMultipleFiles(
  payload: DeleteMultipleFilesInput,
): Promise<null> {
  await httpService.delete('/storage/azure-blob/delete/multiple', {
    ...authOpts,
    data: payload,
  });
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Move
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-038: Di chuyển một file
 * PUT /storage/azure-blob/move/single [AUTH]
 */
export async function moveSingleFile(
  payload: MoveSingleFileInput,
): Promise<string> {
  const res = await httpService.put<ApiResponse<string>>(
    '/storage/azure-blob/move/single',
    payload,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-039: Di chuyển nhiều file
 * PUT /storage/azure-blob/move/multiple [AUTH]
 */
export async function moveMultipleFiles(
  payload: MoveMultipleFilesInput,
): Promise<string> {
  const res = await httpService.put<ApiResponse<string>>(
    '/storage/azure-blob/move/multiple',
    payload,
    authOpts,
  );
  return res.data.data!;
}
