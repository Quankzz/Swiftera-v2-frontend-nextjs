'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, CheckCircle2 } from 'lucide-react';

interface UserEmailFormProps {
  email: string;
}

export function UserEmailForm({ email }: UserEmailFormProps) {
  const [newEmail, setNewEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setError('Email không hợp lệ');
      return;
    }
    setSaving(true);
    setError('');
    // TODO: wire up to real API
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setDone(true);
    setNewEmail('');
    setTimeout(() => setDone(false), 3000);
  };

  return (
    <div className='bg-white dark:bg-[#1a1a1f] rounded-xl border border-gray-200 dark:border-white/8 shadow-sm p-6 space-y-6'>
      <div className='flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-white/8'>
        <div className='h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center'>
          <Mail size={18} className='text-blue-600 dark:text-blue-400' />
        </div>
        <div>
          <h2 className='text-base font-semibold text-text-main'>Đổi email</h2>
          <p className='text-xs text-text-sub'>
            Email hiện tại:{' '}
            <span className='font-medium text-text-main'>{email}</span>
          </p>
        </div>
      </div>

      {done && (
        <div className='flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 px-4 py-3 text-sm text-green-700 dark:text-green-400'>
          <CheckCircle2 size={16} /> Yêu cầu đổi email đã được gửi. Vui lòng
          kiểm tra hòm thư.
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='space-y-1.5'>
          <label className='text-xs font-semibold text-text-sub uppercase tracking-wide'>
            Email mới
          </label>
          <Input
            type='email'
            value={newEmail}
            onChange={(e) => {
              setNewEmail(e.target.value);
              setError('');
            }}
            placeholder='email-moi@domain.com'
            className='bg-gray-50/50'
          />
          {error && <p className='text-xs text-red-500'>{error}</p>}
        </div>

        <div className='pt-2 flex justify-end'>
          <Button
            type='submit'
            disabled={saving || !newEmail.trim()}
            className='bg-theme-primary-start hover:opacity-90'
          >
            {saving ? 'Đang gửi...' : 'Gửi yêu cầu đổi email'}
          </Button>
        </div>
      </form>
    </div>
  );
}
