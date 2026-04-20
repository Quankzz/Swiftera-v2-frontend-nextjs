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
    <div className='flex items-center gap-0 mb-6'>
      {STEPS.map((step, idx) => (
        <div key={step.id} className='flex items-center flex-1 min-w-0'>
          <div className='flex flex-col items-center gap-1 flex-1'>
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
                <CheckCircle2 className='w-4 h-4' />
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
      const { formMessage } = parseErrorForForm(err, 'Upload thất bại. Thử lại.');
      setUploadError(formMessage ?? 'Upload thất bại. Thử lại.');
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
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
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'relative z-10 w-full mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300',
          step === 2 && selectedFile
            ? 'max-w-4xl max-h-[96vh]'
            : 'max-w-lg max-h-[90vh]',
        )}
      >
        {/* ── Header ── */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10 shrink-0'>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center'>
              <FileText className='w-5 h-5 text-indigo-500' />
            </div>
            <div>
              <h2 className='text-base font-semibold text-text-main'>
                Tạo chính sách mới
              </h2>
              <p className='text-xs text-text-sub'>
                {step === 1 && 'Nhập thông tin cơ bản'}
                {step === 2 && 'Upload và xem trước tài liệu PDF'}
                {step === 3 && 'Xem lại trước khi xác nhận'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className='w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors'
          >
            <X className='w-4 h-4 text-text-sub' />
          </button>
        </div>

        {/* ── Body ── */}
        <div className='flex-1 overflow-y-auto px-6 py-5'>
          <StepIndicator current={step} />

          {/* ── Bước 1: Thông tin ── */}
          {step === 1 && (
            <div className='space-y-4'>
              <Field
                label='Mã code chính sách'
                required
                error={errors.code}
                hint='Ví dụ: RENTAL_TERMS, PRIVACY_POLICY'
              >
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder='RENTAL_TERMS'
                  className={cn(
                    'w-full rounded-xl border px-3 py-2.5 text-sm font-mono bg-white dark:bg-white/5 text-text-main outline-none focus:ring-2 transition-all',
                    errors.code
                      ? 'border-red-300 focus:ring-red-300'
                      : 'border-gray-200 dark:border-white/10 focus:ring-indigo-300 dark:focus:ring-indigo-600',
                  )}
                />
              </Field>

              <div className='grid grid-cols-2 gap-4'>
                <Field label='Phiên bản' required error={errors.policyVersion}>
                  <input
                    type='number'
                    min={1}
                    value={policyVersion}
                    onChange={(e) => setPolicyVersion(e.target.value)}
                    className={cn(
                      'w-full rounded-xl border px-3 py-2.5 text-sm bg-white dark:bg-white/5 text-text-main outline-none focus:ring-2 transition-all',
                      errors.policyVersion
                        ? 'border-red-300 focus:ring-red-300'
                        : 'border-gray-200 dark:border-white/10 focus:ring-indigo-300',
                    )}
                  />
                </Field>

                <Field
                  label='Ngày hiệu lực'
                  required
                  error={errors.effectiveFrom}
                >
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
              </div>

              <Field label='Tiêu đề' required error={errors.title}>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='Điều khoản thuê thiết bị v2.0'
                  className={cn(
                    'w-full rounded-xl border px-3 py-2.5 text-sm bg-white dark:bg-white/5 text-text-main outline-none focus:ring-2 transition-all',
                    errors.title
                      ? 'border-red-300 focus:ring-red-300'
                      : 'border-gray-200 dark:border-white/10 focus:ring-indigo-300',
                  )}
                />
              </Field>
            </div>
          )}

          {/* ── Bước 2: Upload PDF + Preview ── */}
          {step === 2 && (
            <div className='space-y-5'>
              {/* Drop zone / Upload area */}
              {!selectedFile && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className='group cursor-pointer rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/15 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors flex flex-col items-center justify-center py-12 gap-3 bg-gray-50 dark:bg-white/3'
                >
                  <div className='w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center group-hover:scale-105 transition-transform'>
                    <Upload className='w-6 h-6 text-indigo-500' />
                  </div>
                  <div className='text-center'>
                    <p className='text-sm font-semibold text-text-main'>
                      Kéo thả hoặc bấm để chọn file PDF
                    </p>
                    <p className='text-xs text-text-sub mt-1'>
                      Tối đa 20MB · Chỉ chấp nhận .pdf
                    </p>
                  </div>
                  {uploadError && (
                    <div className='flex items-center gap-2 text-red-500 text-xs'>
                      <AlertCircle className='w-3.5 h-3.5' />
                      {uploadError}
                    </div>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type='file'
                accept='application/pdf'
                className='hidden'
                onChange={handleFileChange}
              />

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

              {/* Uploaded file info */}
              {selectedFile && !isUploading && uploadedUrl && (
                <div className='flex items-center gap-3 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/15 px-4 py-3'>
                  <CheckCircle2 className='w-5 h-5 text-emerald-500 shrink-0' />
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-emerald-700 dark:text-emerald-300 truncate'>
                      {selectedFile.name}
                    </p>
                    <p className='text-xs text-emerald-500'>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Upload
                      thành công
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={handleRemoveFile}
                    className='p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors'
                    title='Xóa file'
                  >
                    <Trash2 className='w-4 h-4 text-emerald-600 dark:text-emerald-400' />
                  </button>
                </div>
              )}

              {/* PDF Preview */}
              {selectedFile && !isUploading && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-xs font-semibold text-text-sub uppercase tracking-wide'>
                    <Eye className='w-3.5 h-3.5' />
                    Xem trước tài liệu
                  </div>
                  <div className='rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/8 p-4 overflow-x-auto'>
                    <PolicyPdfPreview file={selectedFile} />
                  </div>
                </div>
              )}

              <p className='text-xs text-text-sub text-center'>
                Bước upload PDF là tùy chọn. Bạn có thể bỏ qua và thêm sau.
              </p>
            </div>
          )}

          {/* ── Bước 3: Xác nhận ── */}
          {step === 3 && (
            <div className='space-y-4'>
              <div className='rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden'>
                {[
                  { label: 'Mã code', value: code },
                  { label: 'Phiên bản', value: `v${policyVersion}` },
                  { label: 'Tiêu đề', value: title },
                  {
                    label: 'Ngày hiệu lực',
                    value: effectiveFrom
                      ? new Date(effectiveFrom).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                      : '-',
                  },
                  {
                    label: 'File PDF',
                    value: selectedFile ? (
                      <span className='flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400'>
                        <CheckCircle2 className='w-3.5 h-3.5' />
                        {selectedFile.name}
                      </span>
                    ) : (
                      <span className='text-text-sub italic'>
                        Không có (thêm sau)
                      </span>
                    ),
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className='flex items-start gap-3 px-4 py-3 border-b border-gray-100 dark:border-white/8 last:border-0'
                  >
                    <span className='text-xs text-text-sub w-32 shrink-0 pt-0.5'>
                      {label}
                    </span>
                    <span className='text-sm font-medium text-text-main flex-1'>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className='flex items-start gap-2.5 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-900/10 px-4 py-3'>
                <Sparkles className='w-4 h-4 text-amber-500 shrink-0 mt-0.5' />
                <p className='text-xs text-amber-700 dark:text-amber-400'>
                  Sau khi tạo, chính sách sẽ có trạng thái{' '}
                  <strong>Hoạt động</strong>. Bạn có thể vô hiệu hóa bất cứ lúc
                  nào từ bảng quản lý.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className='px-6 py-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-white/4 shrink-0'>
          <button
            type='button'
            onClick={step === 1 ? handleClose : () => setStep((s) => s - 1)}
            className='flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors'
          >
            {step > 1 && <ChevronLeft className='w-4 h-4' />}
            {step === 1 ? 'Hủy' : 'Quay lại'}
          </button>

          {step < 3 ? (
            <button
              type='button'
              onClick={() => {
                if (step === 1 && !validateStep1()) return;
                setStep((s) => s + 1);
              }}
              className='flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors'
            >
              {step === 2 ? 'Tiếp theo (Xem lại)' : 'Tiếp theo'}
              <ChevronRight className='w-4 h-4' />
            </button>
          ) : (
            <button
              type='button'
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className='flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
            >
              {createMutation.isPending ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <CheckCircle2 className='w-4 h-4' />
              )}
              Xác nhận tạo chính sách
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
