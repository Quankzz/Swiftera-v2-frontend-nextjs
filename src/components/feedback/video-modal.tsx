'use client';

import { useState, useEffect } from 'react';
import { X, Video } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
}

export default function VideoModal({
  isOpen,
  onClose,
  onSubmit,
}: VideoModalProps) {
  const [url, setUrl] = useState('');

  const handleClose = () => {
    setUrl('');
    onClose();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) handleClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/40 backdrop-blur-sm'
        onClick={handleClose}
      />

      {/* Modal */}
      <div className='relative bg-white dark:bg-[#1a1a1f] rounded-xl shadow-2xl dark:shadow-black/50 w-full max-w-md mx-4 p-6 border border-border/60 dark:border-white/8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-5'>
          <div className='flex items-center gap-2.5'>
            <div className='p-2 bg-theme-primary-start/10 rounded-lg'>
              <Video className='w-5 h-5 text-theme-primary-start' />
            </div>
            <h2 className='text-base font-semibold text-text-main'>
              Thêm Video
            </h2>
          </div>
          <button
            onClick={handleClose}
            className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/8 transition-colors text-text-sub hover:text-text-main'
          >
            <X className='w-4 h-4' />
          </button>
        </div>

        {/* Content */}
        <div>
          <div className='mb-5'>
            <label
              htmlFor='video-url'
              className='block text-sm font-medium text-text-main mb-2'
            >
              URL Video
            </label>
            <input
              id='video-url'
              type='url'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (url.trim()) {
                    onSubmit(url.trim());
                    handleClose();
                  }
                }
              }}
              placeholder='https://www.youtube.com/watch?v=...'
              className='w-full px-3 py-2.5 rounded-lg border border-border/60 dark:border-white/8 bg-white dark:bg-[#0f0f11] text-text-main placeholder:text-text-sub text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary-start/30 focus:border-theme-primary-start transition'
              autoFocus
            />
            <p className='mt-1.5 text-xs text-text-sub'>
              Hỗ trợ: YouTube, Vimeo
            </p>
          </div>

          <div className='flex gap-2 justify-end'>
            <button
              type='button'
              onClick={handleClose}
              className='px-4 py-2 text-sm font-medium text-text-sub hover:text-text-main border border-border/60 dark:border-white/8 rounded-lg hover:bg-gray-100 dark:hover:bg-white/8 transition-colors'
            >
              Hủy
            </button>
            <button
              type='button'
              disabled={!url.trim()}
              onClick={() => {
                if (url.trim()) {
                  onSubmit(url.trim());
                  handleClose();
                }
              }}
              className='px-4 py-2 text-sm font-medium text-white bg-theme-primary-start hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-opacity'
            >
              Thêm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
