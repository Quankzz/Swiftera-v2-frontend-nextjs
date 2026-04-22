/**
 * Hooks cho files module:
 *  - useUploadFileMutation     (upload single)
 *  - useUploadFilesMutation    (upload multiple)
 *  - useDeleteFileMutation     (delete single)
 *  - useDeleteFilesMutation    (delete multiple)
 *  - useMoveSingleFileMutation
 *  - useMoveFilesMutation
 *
 * Dùng TanStack Query mutations.
 * Error từ apiService/AppError đi xuyên suốt.
 */

import { useMutation } from "@tanstack/react-query";
import {
  uploadSingleFile,
  uploadMultipleFiles,
  deleteSingleFile,
  deleteMultipleFiles,
  moveSingleFile,
  moveMultipleFiles,
} from "../api/file.service";
import type {
  UploadSingleResponse,
  UploadMultipleResponse,
  DeleteMultipleFilesInput,
  MoveSingleFileInput,
  MoveMultipleFilesInput,
} from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// Upload
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Upload một file (API-034)
 */
export function useUploadFileMutation() {
  return useMutation<
    UploadSingleResponse,
    Error,
    { file: File; folder?: string }
  >({
    mutationFn: ({ file, folder }) => uploadSingleFile(file, folder),
  });
}

/**
 * Upload nhiều file (API-035)
 */
export function useUploadFilesMutation() {
  return useMutation<
    UploadMultipleResponse,
    Error,
    { files: File[]; folder?: string }
  >({
    mutationFn: ({ files, folder }) => uploadMultipleFiles(files, folder),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Xóa một file (API-036)
 */
export function useDeleteFileMutation() {
  return useMutation<null, Error, string>({
    mutationFn: deleteSingleFile,
  });
}

/**
 * Xóa nhiều file (API-037)
 */
export function useDeleteFilesMutation() {
  return useMutation<null, Error, DeleteMultipleFilesInput>({
    mutationFn: deleteMultipleFiles,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Move
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Di chuyển một file (API-038)
 */
export function useMoveSingleFileMutation() {
  return useMutation<string, Error, MoveSingleFileInput>({
    mutationFn: moveSingleFile,
  });
}

/**
 * Di chuyển nhiều file (API-039)
 */
export function useMoveFilesMutation() {
  return useMutation<string, Error, MoveMultipleFilesInput>({
    mutationFn: moveMultipleFiles,
  });
}
