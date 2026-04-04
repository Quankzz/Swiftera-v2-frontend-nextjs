import type { AxiosResponse } from 'axios';

import { httpService } from './http';

export interface UploadSingleFileResponse {
  success: boolean;
  message: string;
  data: {
    fileName: string;
    fileUrl: string;
  } | null;
}

export interface UploadSingleFileRequest {
  file: File;
  folderName?: string;
}

export interface UploadMultipleFilesResponse {
  success: boolean;
  message: string;
  data: {
    files: Array<{
      fileName: string;
      fileUrl: string;
    }>;
  } | null;
}

export interface UploadMultipleFilesRequest {
  files: File[];
  folderName?: string;
}

export interface DeleteSingleFileResponse {
  success: boolean;
  message: string;
  data: null;
}

export interface DeleteSingleFileRequest {
  filePath: string;
}

export interface DeleteMultipleFilesResponse {
  success: boolean;
  message: string;
  data: null;
}

export interface DeleteMultipleFilesRequest {
  filePaths: string[];
}

export interface MoveSingleFileResponse {
  success: boolean;
  message: string;
  data: string;
}

export interface MoveSingleFileRequest {
  sourceKey: string;
  destinationFolder: string;
}

export interface MoveMultipleFilesResponse {
  success: boolean;
  message: string;
  data: string;
}

export interface MoveMultipleFilesRequest {
  sourceKeys: string[];
  destinationFolder: string;
}

const authOpts = { requireToken: true as const };

export const storageApi = {
  uploadSingleFile({
    file,
    folderName,
  }: UploadSingleFileRequest): Promise<AxiosResponse<UploadSingleFileResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    if (folderName) {
      formData.append('folderName', folderName);
    }

    return httpService.post<UploadSingleFileResponse>(
      '/storage/azure-blob/upload/single',
      formData,
      {
        ...authOpts,
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
  },

  uploadMultipleFiles({
    files,
    folderName,
  }: UploadMultipleFilesRequest): Promise<
    AxiosResponse<UploadMultipleFilesResponse>
  > {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (folderName) {
      formData.append('folderName', folderName);
    }

    return httpService.post<UploadMultipleFilesResponse>(
      '/storage/azure-blob/upload/multiple',
      formData,
      {
        ...authOpts,
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
  },

  deleteSingleFile({
    filePath,
  }: DeleteSingleFileRequest): Promise<AxiosResponse<DeleteSingleFileResponse>> {
    return httpService.delete<DeleteSingleFileResponse>(
      '/storage/azure-blob/delete/single',
      {
        ...authOpts,
        params: { filePath },
      },
    );
  },

  deleteMultipleFiles({
    filePaths,
  }: DeleteMultipleFilesRequest): Promise<
    AxiosResponse<DeleteMultipleFilesResponse>
  > {
    return httpService.delete<DeleteMultipleFilesResponse>(
      '/storage/azure-blob/delete/multiple',
      {
        ...authOpts,
        data: { filePaths },
      },
    );
  },

  moveSingleFile({
    sourceKey,
    destinationFolder,
  }: MoveSingleFileRequest): Promise<AxiosResponse<MoveSingleFileResponse>> {
    return httpService.put<MoveSingleFileResponse>(
      '/storage/azure-blob/move/single',
      { sourceKey, destinationFolder },
      authOpts,
    );
  },

  moveMultipleFiles({
    sourceKeys,
    destinationFolder,
  }: MoveMultipleFilesRequest): Promise<
    AxiosResponse<MoveMultipleFilesResponse>
  > {
    return httpService.put<MoveMultipleFilesResponse>(
      '/storage/azure-blob/move/multiple',
      { sourceKeys, destinationFolder },
      authOpts,
    );
  },
};
