'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { userApi } from '@/api/userProfileApi';
import { getApiErrorMessage, getApiSuccessMessage } from '../utils';

export function UserPasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const validate = () => {
    if (!current) return 'Vui lòng nhập mật khẩu hiện tại';
    if (next.length < 8) return 'Mật khẩu mới phải có ít nhất 8 ký tự';
    if (next !== confirm) return 'Xác nhận mật khẩu không khớp';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      const res = await userApi.updatePassword({
        currentPassword: current,
        newPassword: next,
        confirmPassword: confirm,
      });
      setSuccessMessage(
        getApiSuccessMessage(res.data, 'Mật khẩu đã được đổi thành công.'),
      );
      setCurrent('');
      setNext('');
      setConfirm('');
      setTimeout(() => setSuccessMessage(''), 6000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Đổi mật khẩu thất bại'));
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    show: boolean,
    toggle: () => void,
    placeholder: string,
  ) => (
    <div className='space-y-1.5'>
      <label className='text-xs font-semibold text-text-sub uppercase tracking-wide'>
        {label}
      </label>
      <div className='relative'>
        <Input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setError('');
          }}
          placeholder={placeholder}
          className='bg-gray-50/50 dark:bg-white/5 pr-10'
        />
        <button
          type='button'
          onClick={toggle}
          className='absolute right-3 top-1/2 -translate-y-1/2 text-text-sub hover:text-text-main'
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className='bg-white dark:bg-surface-card rounded-xl border border-gray-200 dark:border-white/8 shadow-sm p-6 space-y-6'>
      <div className='flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-white/8'>
        <div className='h-10 w-10 rounded-full bg-purple-50 dark:bg-purple-500/15 flex items-center justify-center'>
          <Lock size={18} className='text-purple-600 dark:text-purple-400' />
        </div>
        <div>
          <h2 className='text-base font-semibold text-text-main'>
            Đổi mật khẩu
          </h2>
          <p className='text-xs text-text-sub'>
            Mật khẩu mới phải có ít nhất 8 ký tự
          </p>
        </div>
      </div>

      {successMessage && (
        <div className='flex items-start gap-2 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 px-4 py-3 text-sm text-green-700 dark:text-green-400'>
          <CheckCircle2 size={16} className='shrink-0 mt-0.5' />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-4'>
        {field(
          'Mật khẩu hiện tại',
          current,
          setCurrent,
          showCurrent,
          () => setShowCurrent((v) => !v),
          '••••••••',
        )}
        {field(
          'Mật khẩu mới',
          next,
          setNext,
          showNext,
          () => setShowNext((v) => !v),
          'Ít nhất 8 ký tự',
        )}
        {field(
          'Xác nhận mật khẩu mới',
          confirm,
          setConfirm,
          showConfirm,
          () => setShowConfirm((v) => !v),
          'Nhập lại mật khẩu mới',
        )}

        {error && <p className='text-xs text-red-500'>{error}</p>}

        <div className='pt-2 flex justify-end'>
          <Button
            type='submit'
            disabled={saving || !current || !next || !confirm}
            className='bg-theme-primary-start hover:opacity-90'
          >
            {saving ? 'Đang đổi...' : 'Đổi mật khẩu'}
          </Button>
        </div>
      </form>
    </div>
  );
}
