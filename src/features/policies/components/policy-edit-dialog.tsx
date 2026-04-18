'use client';

/**
 * PolicyEditDialog
 * ─────────────────────────────────────────────────────────────────────────────
 * Dialog cập nhật tài liệu chính sách (API-109A: PATCH /policies/{policyId}).
 *
 * Chỉ cho phép sửa: title, pdfUrl, effectiveFrom.
 * code và policyVersion là immutable.
 */

import { useState, useRef, useEffect } from 'react';
import {
  X,
  Loader2,
  CheckCircle2,
  FileText,
  Upload,
  AlertCircle,
  Trash2,
  Eye,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { storageApi } from '@/api/storageApi';
import { extractBlobPathFromUrl, isAzureBlobUrl } from '@/lib/blob-utils';
import { useUpdatePolicyMutation } from '../hooks/use-policy-management';
import { PolicyPdfPreview } from './policy-pdf-preview';
import type { PolicyDocumentResponse } from '../types';

// ─────────────────────────────────────────────────────────────────────────────

interface PolicyEditDialogProps {
  policy: PolicyDocumentResponse;
  isOpen: boolean;
  onClose: () => void;
}

function Field({
  label,
  required,
  children,
  hint,
  error,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
  error?: string;
}) {
  return (
    <div className='space-y-1.5'>
      <label className='text-xs font-semibold text-text-sub uppercase tracking-wide'>
        {label}
        {required && <span className='text-red-500 ml-0.5'>*</span>}
      </label>
      {children}
      {error && <p className='text-xs text-red-500'>{error}</p>}
      {hint && !error && <p className='text-xs text-text-sub'>{hint}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function PolicyEditDialog({
  policy,
  isOpen,
  onClose,
}: PolicyEditDialogProps) {
  // ── Form state ─────────────────────────────────────────────────────────────
  const [title, setTitle] = useState(policy.title);
  const [effectiveFrom, setEffectiveFrom] = useState(
    policy.effectiveFrom
      ? new Date(policy.effectiveFrom).toISOString().slice(0, 10)
      : '',
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── PDF state ──────────────────────────────────────────────────────────────
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(
    policy.pdfUrl,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateMutation = useUpdatePolicyMutation();

  // Reset when policy changes
  useEffect(() => {
    setTitle(policy.title);
    setEffectiveFrom(
      policy.effectiveFrom
        ? new Date(policy.effectiveFrom).toISOString().slice(0, 10)
        : '',
    );
    setCurrentPdfUrl(policy.pdfUrl);
    setSelectedFile(null);
    setUploadedUrl(null);
    setUploadError(null);
    setShowPreview(false);
    setErrors({});
  }, [policy]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Tiêu đề không được để trống.';
    if (!effectiveFrom) errs.effectiveFrom = 'Vui lòng chọn ngày hiệu lực.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── File upload ────────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setUploadError('Chỉ chấp nhận file PDF.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setUploadError('File không được vượt quá 20MB.');
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
    setUploadedUrl(null);
    setIsUploading(true);

    try {
      const res = await storageApi.uploadSingleFile({
        file,
        folderName: 'policies',
      });
      const url = res.data?.data?.fileUrl;
      if (!url) throw new Error('Không nhận được URL file.');

      // Delete old PDF from Azure Blob if it's a Swiftera blob URL
      if (policy.pdfUrl && isAzureBlobUrl(policy.pdfUrl)) {
        const oldPath = extractBlobPathFromUrl(policy.pdfUrl);
        if (oldPath) {
          try {
            await storageApi.deleteSingleFile({ filePath: oldPath });
          } catch {
            // ignore delete error — non-critical
          }
        }
      }

      setUploadedUrl(url);
      setCurrentPdfUrl(url);
      toast.success('Upload PDF mới thành công!');
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Upload thất bại. Thử lại.',
      );
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePdf = () => {
    setSelectedFile(null);
    setUploadedUrl(null);
    setCurrentPdfUrl(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    // Build payload — chỉ gửi field thay đổi
    const payload: Record<string, unknown> = {};

    if (title.trim() !== policy.title) {
      payload.title = title.trim();
    }

    const newEffective = new Date(effectiveFrom).toISOString();
    if (newEffective !== policy.effectiveFrom) {
      payload.effectiveFrom = newEffective;
    }

    // PDF: nếu user upload mới → gửi URL mới; nếu user xóa → gửi chuỗi rỗng
    const finalPdfUrl = uploadedUrl ?? currentPdfUrl;
    if (finalPdfUrl !== policy.pdfUrl) {
      payload.pdfUrl = finalPdfUrl === null ? '' : finalPdfUrl;
    }

    if (Object.keys(payload).length === 0) {
      toast.info('Không có thay đổi nào.');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        policyDocumentId: policy.policyDocumentId,
        payload,
      });
      toast.success('Cập nhật chính sách thành công!');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cập nhật thất bại.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'relative z-10 w-full mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300',
          showPreview ? 'max-w-4xl max-h-[96vh]' : 'max-w-lg max-h-[90vh]',
        )}
      >
        {/* ── Header ── */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10 shrink-0'>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center'>
              <Pencil className='w-5 h-5 text-amber-500' />
            </div>
            <div>
              <h2 className='text-base font-semibold text-text-main'>
                Cập nhật chính sách
              </h2>
              <p className='text-xs text-text-sub'>
                {policy.code} · v{policy.policyVersion}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors'
          >
            <X className='w-4 h-4 text-text-sub' />
          </button>
        </div>

        {/* ── Body ── */}
        <div className='flex-1 overflow-y-auto px-6 py-5 space-y-5'>
          {/* Immutable fields */}
          <div className='rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/4 px-4 py-3'>
            <p className='text-[11px] font-semibold uppercase tracking-wider text-text-sub mb-2'>
              Không thể sửa
            </p>
            <div className='flex items-center gap-6'>
              <div>
                <p className='text-[10px] text-text-sub'>Mã code</p>
                <p className='text-sm font-mono font-semibold text-text-main'>
                  {policy.code}
                </p>
              </div>
              <div>
                <p className='text-[10px] text-text-sub'>Phiên bản</p>
                <p className='text-sm font-semibold text-text-main'>
                  v{policy.policyVersion}
                </p>
              </div>
            </div>
          </div>

          {/* Editable fields */}
          <Field label='Tiêu đề' required error={errors.title}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Điều khoản thuê thiết bị v2.1'
              className={cn(
                'w-full rounded-xl border px-3 py-2.5 text-sm bg-white dark:bg-white/5 text-text-main outline-none focus:ring-2 transition-all',
                errors.title
                  ? 'border-red-300 focus:ring-red-300'
                  : 'border-gray-200 dark:border-white/10 focus:ring-indigo-300',
              )}
            />
          </Field>

          <Field label='Ngày hiệu lực' required error={errors.effectiveFrom}>
            <input
              type='date'
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              className={cn(
                'w-full rounded-xl border px-3 py-2.5 text-sm bg-white dark:bg-white/5 text-text-main outline-none focus:ring-2 transition-all',
                errors.effectiveFrom
                  ? 'border-red-300 focus:ring-red-300'
                  : 'border-gray-200 dark:border-white/10 focus:ring-indigo-300',
              )}
            />
          </Field>

          {/* ── PDF Section ── */}
          <div className='space-y-3'>
            <p className='text-xs font-semibold text-text-sub uppercase tracking-wide'>
              File PDF
            </p>

            {/* Current / uploaded PDF info */}
            {currentPdfUrl && !isUploading && (
              <div className='flex items-center gap-3 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/15 px-4 py-3'>
                <CheckCircle2 className='w-5 h-5 text-emerald-500 shrink-0' />
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-emerald-700 dark:text-emerald-300 truncate'>
                    {selectedFile ? selectedFile.name : 'PDF hiện tại'}
                  </p>
                  {uploadedUrl && (
                    <p className='text-xs text-emerald-500'>
                      Upload mới thành công
                    </p>
                  )}
                </div>
                <div className='flex items-center gap-1.5'>
                  <button
                    type='button'
                    onClick={() => setShowPreview(!showPreview)}
                    className='p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors'
                    title='Xem trước PDF'
                  >
                    <Eye className='w-4 h-4 text-emerald-600 dark:text-emerald-400' />
                  </button>
                  <button
                    type='button'
                    onClick={handleRemovePdf}
                    className='p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors'
                    title='Xóa file PDF'
                  >
                    <Trash2 className='w-4 h-4 text-emerald-600 dark:text-emerald-400' />
                  </button>
                </div>
              </div>
            )}

            {/* Upload progress */}
            {isUploading && (
              <div className='flex items-center gap-3 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-900/15 px-4 py-3'>
                <Loader2 className='w-5 h-5 animate-spin text-indigo-500 shrink-0' />
                <div>
                  <p className='text-sm font-medium text-indigo-700 dark:text-indigo-300'>
                    Đang upload...
                  </p>
                  <p className='text-xs text-indigo-500'>
                    {selectedFile?.name}
                  </p>
                </div>
              </div>
            )}

            {/* Upload error */}
            {uploadError && (
              <div className='flex items-center gap-2 text-red-500 text-xs px-1'>
                <AlertCircle className='w-3.5 h-3.5' />
                {uploadError}
              </div>
            )}

            {/* Upload button */}
            <button
              type='button'
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className='flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-200 dark:border-white/15 hover:border-indigo-400 dark:hover:border-indigo-500 text-sm text-text-sub hover:text-indigo-600 transition-colors w-full justify-center disabled:opacity-50'
            >
              <Upload className='w-4 h-4' />
              {currentPdfUrl ? 'Thay đổi file PDF' : 'Upload file PDF'}
            </button>

            <input
              ref={fileInputRef}
              type='file'
              accept='application/pdf'
              className='hidden'
              onChange={handleFileChange}
            />

            {/* PDF preview */}
            {showPreview && currentPdfUrl && (
              <div className='rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/8 p-4 overflow-x-auto'>
                <PolicyPdfPreview
                  pdfUrl={currentPdfUrl}
                  file={selectedFile ?? undefined}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className='px-6 py-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-2 bg-gray-50 dark:bg-white/4 shrink-0'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors'
          >
            Hủy
          </button>
          <button
            type='button'
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className='flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
          >
            {updateMutation.isPending ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <FileText className='w-4 h-4' />
            )}
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
