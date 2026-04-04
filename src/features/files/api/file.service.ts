/**
 * File service — tất cả API calls cho files / Azure Blob Storage.
 * Dùng apiService.ts làm HTTP layer, KHÔNG dùng client.ts.
 *
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md (Module 5: FILES)
 */

import { apiUpload, apiDelete, apiPut } from '@/api/apiService';
import type {
  UploadSingleResponse,
  UploadMultipleResponse,
  DeleteMultipleFilesInput,
  MoveSingleFileInput,
  MoveMultipleFilesInput,
} from '../types';

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
export function uploadSingleFile(
  file: File,
  folder?: string,
): Promise<UploadSingleResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (folder) formData.append('folderName', folder);

  return apiUpload<UploadSingleResponse>(
    '/storage/azure-blob/upload/single',
    formData,
  );
}

/**
 * API-035: Upload nhiều file
 * POST /storage/azure-blob/upload/multiple [AUTH]
 * Content-Type: multipart/form-data
 */
export function uploadMultipleFiles(
  files: File[],
  folder?: string,
): Promise<UploadMultipleResponse> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }
  if (folder) formData.append('folderName', folder);

  return apiUpload<UploadMultipleResponse>(
    '/storage/azure-blob/upload/multiple',
    formData,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-036: Xóa một file
 * DELETE /storage/azure-blob/delete/single?filePath=... [AUTH]
 */
export function deleteSingleFile(filePath: string): Promise<null> {
  return apiDelete<null>('/storage/azure-blob/delete/single', undefined, {
    params: { filePath },
  });
}

/**
 * API-037: Xóa nhiều file
 * DELETE /storage/azure-blob/delete/multiple [AUTH]
 */
export function deleteMultipleFiles(
  payload: DeleteMultipleFilesInput,
): Promise<null> {
  return apiDelete<null>('/storage/azure-blob/delete/multiple', payload);
}

// ─────────────────────────────────────────────────────────────────────────────
// Move
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-038: Di chuyển một file
 * PUT /storage/azure-blob/move/single [AUTH]
 */
export function moveSingleFile(payload: MoveSingleFileInput): Promise<string> {
  return apiPut<string>('/storage/azure-blob/move/single', payload);
}

/**
 * API-039: Di chuyển nhiều file
 * PUT /storage/azure-blob/move/multiple [AUTH]
 */
export function moveMultipleFiles(
  payload: MoveMultipleFilesInput,
): Promise<string> {
  return apiPut<string>('/storage/azure-blob/move/multiple', payload);
}
