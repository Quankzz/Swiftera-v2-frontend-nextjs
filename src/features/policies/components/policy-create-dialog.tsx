'use client';

/**
 * PolicyCreateDialog
 * ─────────────────────────────────────────────────────────────────────────────
 * Dialog tạo tài liệu chính sách mới.
 *
 * Flow:
 *  Bước 1 - Điền thông tin (code, version, title, ngày hiệu lực).
 *  Bước 2 - Upload PDF → preview bằng react-pageflip.
 *  Bước 3 - Xác nhận submit → gọi API-106 POST /policies.
 *
 * Upload PDF:
 *  1. Người dùng chọn file PDF.
 *  2. Upload lên Azure Blob (storageApi) để lấy pdfUrl.
 *  3. Hiển thị preview trang sách với PolicyPdfPreview.
 *  4. Người dùng xác nhận → submit form tạo policy.
 */

import { useState, useRef } from 'react';
import {
  X,
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Eye,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { storageApi } from '@/api/storageApi';
import { parseErrorForForm } from '@/api/apiService';
import { extractBlobPathFromUrl, isAzureBlobUrl } from '@/lib/blob-utils';
import { useCreatePolicyMutation } from '../hooks/use-policy-management';
import { PolicyPdfPreview } from './policy-pdf-preview';

// ─────────────────────────────────────────────────────────────────────────────

interface PolicyCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Step indicator ───────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Thông tin' },
  { id: 2, label: 'Upload PDF' },
  { id: 3, label: 'Xác nhận' },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((step, idx) => (
        <div key={step.id} className="flex items-center flex-1 min-w-0">
          <div className="flex flex-col items-center gap-1 flex-1">
            <div
              className={cn(
                'w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all',
                current > step.id
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : current === step.id
                    ? 'bg-white dark:bg-gray-900 border-indigo-600 text-indigo-600'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-white/20 text-text-sub',
              )}
            >
              {current > step.id ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                step.id
              )}
            </div>
            <span
              className={cn(
                'text-[10px] font-medium',
                current >= step.id ? 'text-indigo-600' : 'text-text-sub',
              )}
            >
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className={cn(
                'h-0.5 flex-1 mb-4 mx-1 transition-all',
                current > step.id + 1
                  ? 'bg-indigo-600'
                  : current > step.id
                    ? 'bg-indigo-400'
                    : 'bg-gray-200 dark:bg-white/10',
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
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
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-text-sub uppercase tracking-wide">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-text-sub">{hint}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main dialog
// ─────────────────────────────────────────────────────────────────────────────

export function PolicyCreateDialog({
  isOpen,
  onClose,
}: PolicyCreateDialogProps) {
  const [step, setStep] = useState(1);

  // ── Step 1 form state ──────────────────────────────────────────────────────
  const [code, setCode] = useState('');
  const [policyVersion, setPolicyVersion] = useState('1');
  const [title, setTitle] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Step 2 upload state ────────────────────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createMutation = useCreatePolicyMutation();

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!code.trim()) errs.code = 'Vui lòng nhập mã code chính sách.';
    else if (!/^[A-Z0-9_]+$/.test(code.trim()))
      errs.code = 'Code chỉ gồm chữ in hoa, số và dấu gạch dưới.';

    const ver = parseInt(policyVersion, 10);
    if (!policyVersion || isNaN(ver) || ver < 1)
      errs.policyVersion = 'Phiên bản phải là số nguyên ≥ 1.';

    if (!title.trim()) errs.title = 'Vui lòng nhập tiêu đề.';
    if (!effectiveFrom) errs.effectiveFrom = 'Vui lòng chọn ngày hiệu lực.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── File select & upload ───────────────────────────────────────────────────
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
      setUploadedUrl(url);
      toast.success('Upload PDF thành công!');
    } catch (err) {
      const { formMessage } = parseErrorForForm(
        err,
        'Upload thất bại. Thử lại.',
      );
      setUploadError(formMessage ?? 'Upload thất bại. Thử lại.');
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    // Delete uploaded blob from Azure if present
    if (uploadedUrl && isAzureBlobUrl(uploadedUrl)) {
      const blobPath = extractBlobPathFromUrl(uploadedUrl);
      if (blobPath) {
        storageApi
          .deleteSingleFile({ filePath: blobPath })
          .catch(() => toast.error('Không thể xóa file PDF đã upload.'));
      }
    }
    setSelectedFile(null);
    setUploadedUrl(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      await createMutation.mutateAsync({
        code: code.trim().toUpperCase(),
        policyVersion: parseInt(policyVersion, 10),
        title: title.trim(),
        pdfUrl: uploadedUrl ?? undefined,
        effectiveFrom: new Date(effectiveFrom).toISOString(),
      });
      toast.success('Tạo chính sách thành công!');
      // Clear uploadedUrl before calling handleClose so the orphan-cleanup guard is skipped
      setUploadedUrl(null);
      handleClose();
    } catch (err) {
      const { fieldErrors, formMessage } = parseErrorForForm(
        err,
        'Tạo chính sách thất bại.',
      );

      setErrors((prev) => ({
        ...prev,
        code: fieldErrors.code,
        policyVersion: fieldErrors.policyVersion,
        title: fieldErrors.title,
        effectiveFrom: fieldErrors.effectiveFrom,
      }));

      if (formMessage) {
        toast.error(formMessage);
      }
    }
  };

  const handleClose = () => {
    // If a PDF was uploaded but the policy was never submitted, delete the orphan blob
    if (uploadedUrl && isAzureBlobUrl(uploadedUrl)) {
      const blobPath = extractBlobPathFromUrl(uploadedUrl);
      if (blobPath) {
        storageApi.deleteSingleFile({ filePath: blobPath }).catch(() => {
          /* silent – best-effort cleanup */
        });
      }
    }
    setStep(1);
    setCode('');
    setPolicyVersion('1');
    setTitle('');
    setEffectiveFrom('');
    setErrors({});
    setSelectedFile(null);
    setUploadedUrl(null);
    setUploadError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'relative z-10 w-full bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl flex flex-col overflow-hidden transition-all duration-500 ease-in-out border border-slate-200 dark:border-slate-800',
          step === 2 && selectedFile
            ? 'max-w-4xl max-h-[96vh]'
            : 'max-w-2xl max-h-[90vh]',
        )}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 flex items-center justify-center shadow-inner">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                Tạo chính sách mới
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {step === 1 && 'Nhập thông tin cơ bản'}
                {step === 2 && 'Upload và xem trước tài liệu PDF'}
                {step === 3 && 'Xem lại trước khi xác nhận'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
          {/* ── Nút báo Bước (Step Indicator nối liền) ── */}
          <div className="relative mb-10 px-2">
            {/* Thanh Progress Line nền */}
            <div className="absolute top-5 left-10 right-10 h-[3px] bg-slate-100 dark:bg-slate-800 rounded-full -z-0" />

            {/* Thanh Progress Line chạy màu */}
            <div
              className="absolute top-5 left-10 h-[3px] bg-indigo-600 transition-all duration-500 ease-in-out rounded-full -z-0"
              style={{
                width: `calc(${((step - 1) / 2) * 100}% - ${step === 1 ? '0px' : step === 3 ? '40px' : '20px'})`,
              }}
            />

            <div className="flex items-center justify-between relative z-10">
              {[
                { id: 1, title: 'Thông tin' },
                { id: 2, title: 'Tài liệu' },
                { id: 3, title: 'Xác nhận' },
              ].map((s) => {
                const isActive = step === s.id;
                const isCompleted = step > s.id;

                return (
                  <div key={s.id} className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm border-[3px]',
                        isCompleted
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : isActive
                            ? 'bg-white dark:bg-slate-900 border-indigo-600 text-indigo-600 shadow-indigo-100 dark:shadow-none scale-110'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400',
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        s.id
                      )}
                    </div>
                    <span
                      className={cn(
                        'mt-3 text-xs font-bold uppercase tracking-wider transition-colors absolute -bottom-6 w-24 text-center',
                        isActive || isCompleted
                          ? 'text-slate-800 dark:text-slate-200'
                          : 'text-slate-400',
                      )}
                    >
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8">
            {/* ── Bước 1: Thông tin ── */}
            {step === 1 && (
              <div className="space-y-6">
                <Field
                  label="Mã code chính sách"
                  required
                  error={errors.code}
                  hint="Ví dụ: RENTAL_TERMS, PRIVACY_POLICY"
                >
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="RENTAL_TERMS"
                    className={cn(
                      'w-full rounded-xl border px-4 py-3 text-sm font-mono bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm hover:border-slate-300 dark:hover:border-slate-600',
                      errors.code
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                        : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10',
                    )}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-6">
                  <Field
                    label="Phiên bản"
                    required
                    error={errors.policyVersion}
                  >
                    <input
                      type="number"
                      min={1}
                      value={policyVersion}
                      onChange={(e) => setPolicyVersion(e.target.value)}
                      placeholder="VD: 1"
                      className={cn(
                        'w-full rounded-xl border px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm',
                        errors.policyVersion
                          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                          : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10',
                      )}
                    />
                  </Field>

                  <Field
                    label="Ngày hiệu lực"
                    required
                    error={errors.effectiveFrom}
                  >
                    <input
                      type="date"
                      value={effectiveFrom}
                      onChange={(e) => setEffectiveFrom(e.target.value)}
                      className={cn(
                        'w-full rounded-xl border px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm',
                        errors.effectiveFrom
                          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                          : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10',
                      )}
                    />
                  </Field>
                </div>

                <Field label="Tiêu đề" required error={errors.title}>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Điều khoản thuê thiết bị v2.0"
                    className={cn(
                      'w-full rounded-xl border px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm',
                      errors.title
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                        : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10',
                    )}
                  />
                </Field>
              </div>
            )}

            {/* ── Bước 2: Upload PDF + Preview ── */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Drop zone / Upload area */}
                {!selectedFile && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all flex flex-col items-center justify-center py-16 px-6 gap-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-7 h-7 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
                        Kéo thả hoặc{' '}
                        <span className="text-indigo-600 dark:text-indigo-400">
                          bấm vào đây
                        </span>{' '}
                        để tải file
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Tối đa 20MB · Chỉ chấp nhận .pdf
                      </p>
                    </div>
                    {uploadError && (
                      <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 px-3 py-1.5 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        {uploadError}
                      </div>
                    )}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* Upload progress */}
                {isUploading && (
                  <div className="flex items-center gap-4 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-900/10 p-5 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Đang upload...
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {selectedFile?.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Uploaded file info */}
                {selectedFile && !isUploading && uploadedUrl && (
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB ·
                          Upload thành công
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                      title="Xóa file"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* PDF Preview */}
                {selectedFile && !isUploading && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <Eye className="w-4 h-4" /> Xem trước tài liệu
                    </div>
                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-4 overflow-x-auto shadow-inner">
                      <PolicyPdfPreview file={selectedFile} />
                    </div>
                  </div>
                )}

                <p className="text-sm text-slate-500 text-center">
                  Bước upload PDF là tùy chọn. Bạn có thể bỏ qua và thêm sau.
                </p>
              </div>
            )}

            {/* ── Bước 3: Xác nhận ── */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                      Tóm tắt thông tin
                    </h3>
                  </div>
                  <div>
                    {[
                      {
                        label: 'Mã code',
                        value: (
                          <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-sm">
                            {code || '-'}
                          </span>
                        ),
                      },
                      { label: 'Phiên bản', value: `v${policyVersion || '1'}` },
                      { label: 'Tiêu đề', value: title || '-' },
                      {
                        label: 'Ngày hiệu lực',
                        value: effectiveFrom
                          ? new Date(effectiveFrom).toLocaleDateString(
                            'vi-VN',
                            {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            },
                          )
                          : '-',
                      },
                      {
                        label: 'File PDF',
                        value: selectedFile ? (
                          <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            {selectedFile.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">
                            Không có (thêm sau)
                          </span>
                        ),
                      },
                    ].map(({ label, value }, idx) => (
                      <div
                        key={label}
                        className={cn(
                          'flex items-center justify-between px-6 py-4',
                          idx !== 4 &&
                          'border-b border-slate-100 dark:border-slate-700',
                        )}
                      >
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {label}
                        </span>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100 text-right">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-amber-200/60 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-900/10 p-5">
                  <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                    Sau khi tạo, chính sách sẽ có trạng thái{' '}
                    <strong className="font-semibold">Hoạt động</strong>. Bạn có
                    thể vô hiệu hóa bất cứ lúc nào từ bảng quản lý.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={step === 1 ? handleClose : () => setStep((s) => s - 1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            {step > 1 && <ChevronLeft className="w-4 h-4" />}
            {step === 1 ? 'Hủy' : 'Quay lại'}
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !validateStep1()) return;
                setStep((s) => s + 1);
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md shadow-indigo-200 dark:shadow-none hover:shadow-lg active:scale-95"
            >
              {step === 2 ? 'Tiếp theo (Xem lại)' : 'Tiếp theo'}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Xác nhận tạo chính sách
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
