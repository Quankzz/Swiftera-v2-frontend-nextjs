/**
 * Files module types — source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md (Module 5: FILES)
 *
 * Azure Blob Storage APIs:
 *  - API-034: Upload single
 *  - API-035: Upload multiple
 *  - API-036: Delete single
 *  - API-037: Delete multiple
 *  - API-038: Move single
 *  - API-039: Move multiple
 */

// ─────────────────────────────────────────────────────────────────────────────
// Response Types
// ─────────────────────────────────────────────────────────────────────────────

/** Response cho upload single file (API-034) */
export interface UploadSingleResponse {
  fileName: string;
  fileUrl: string;
}

/** Response cho upload multiple files (API-035) */
export interface UploadMultipleResponse {
  files: UploadSingleResponse[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Request Input Types
// ─────────────────────────────────────────────────────────────────────────────

/** API-037: Delete multiple files */
export interface DeleteMultipleFilesInput {
  filePaths: string[];
}

/** API-038: Move single file */
export interface MoveSingleFileInput {
  sourceKey: string;
  destinationFolder: string;
}

/** API-039: Move multiple files */
export interface MoveMultipleFilesInput {
  sourceKeys: string[];
  destinationFolder: string;
}
