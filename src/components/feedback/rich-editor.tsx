'use client';

import { useRef, useState, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link,
  Image as ImageIcon,
  Video,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Quote,
} from 'lucide-react';
import { buildVideoEmbed } from '@/utils/embed';
import { uploadSingleFile } from '@/features/files/api/file.service';
import ColorPicker from './color-picker';
import VideoModal from './video-modal';

interface RichEditorProps {
  placeholder?: string;
  onChange?: (html: string) => void;
  minHeight?: string;
}

// ─── Toolbar separator ────────────────────────────────────────────
function Sep() {
  return (
    <div className='w-px self-stretch bg-border/50 dark:bg-white/8 mx-0.5' />
  );
}

// ─── Toolbar button ───────────────────────────────────────────────
function ToolBtn({
  onClick,
  title,
  children,
  active = false,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type='button'
      onMouseDown={(e) => {
        e.preventDefault(); // keep editor focus
        onClick();
      }}
      title={title}
      className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-sm transition-colors ${
        active
          ? 'bg-theme-primary-start/10 text-theme-primary-start border border-theme-primary-start/30'
          : 'text-text-sub hover:text-text-main hover:bg-gray-100 dark:hover:bg-white/8 border border-transparent'
      }`}
    >
      {children}
    </button>
  );
}

export default function RichEditor({
  placeholder = 'Mô tả chi tiết ý kiến của bạn...',
  onChange,
  minHeight = '180px',
}: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imgPickerRef = useRef<HTMLInputElement>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [imageMode, setImageMode] = useState<'none' | 'url'>('none');
  const [imageUrl, setImageUrl] = useState('');
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const handleChange = () => {
    const html = editorRef.current?.innerHTML ?? '';
    setShowPlaceholder(!html || html === '<br>');
    onChange?.(html);
  };

  // ─── Insert block element at cursor ──────────────────────────────
  const placeBlock = useCallback((node: HTMLElement) => {
    const editor = editorRef.current;
    if (!editor) return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      const range = sel.getRangeAt(0);
      if (!editor.contains(range.commonAncestorContainer)) {
        editor.appendChild(node);
      } else {
        range.collapse(false);
        range.insertNode(node);
        range.setStartAfter(node);
        range.setEndAfter(node);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } else {
      editor.appendChild(node);
    }
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    editor.focus();
  }, []);

  // ─── Handlers ────────────────────────────────────────────────────
  const handleHeading = (tag: 'h2' | 'h3') => {
    const el = document.createElement(tag);
    el.textContent = tag === 'h2' ? 'Tiêu đề lớn' : 'Tiêu đề nhỏ';
    el.className =
      tag === 'h2'
        ? 'text-xl font-bold mt-3 mb-1 text-text-main'
        : 'text-base font-semibold mt-2 mb-1 text-text-main';
    placeBlock(el);
  };

  const handleQuote = () => {
    const bq = document.createElement('blockquote');
    bq.textContent = 'Trích dẫn...';
    bq.className =
      'border-l-4 border-theme-primary-start/60 pl-4 italic text-text-sub my-2';
    placeBlock(bq);
  };

  const handleHR = () => {
    const hr = document.createElement('hr');
    hr.className = 'my-4 border-border/50 dark:border-white/10';
    placeBlock(hr);
  };

  const handleVideoSubmit = (url: string) => {
    const iframe = buildVideoEmbed(url);
    if (iframe) {
      placeBlock(iframe as unknown as HTMLElement);
    } else if (/^https?:\/\//i.test(url)) {
      exec('createLink', url);
    }
    handleChange();
  };

  const handleInsertImageUrl = () => {
    if (!imageUrl.trim()) return;
    const img = document.createElement('img');
    img.src = imageUrl.trim();
    img.className = 'rich-media block my-3 rounded-lg';
    img.alt = 'Hình ảnh';
    placeBlock(img);
    setImageUrl('');
    setImageMode('none');
    handleChange();
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    // Insert loading placeholder at cursor position
    const placeholder = document.createElement('span');
    placeholder.textContent = '⏳ Đang tải ảnh lên...';
    placeholder.className = 'text-xs text-text-sub italic animate-pulse';
    placeBlock(placeholder);
    handleChange();

    try {
      const result = await uploadSingleFile(file, 'products');
      const img = document.createElement('img');
      img.src = result.fileUrl;
      img.className = 'rich-media block my-3 rounded-lg';
      img.alt = file.name;
      placeholder.replaceWith(img);
      handleChange();
    } catch {
      placeholder.replaceWith(document.createTextNode('❌ Tải ảnh thất bại'));
      handleChange();
    }
  };

  const handleColorChange = (color: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    const sel = window.getSelection();
    const hasSelection =
      sel && sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed;

    if (hasSelection) {
      // Text is selected — apply color directly
      document.execCommand('foreColor', false, color);
    } else {
      // No selection — insert a zero-width span so typing continues in this color
      editor.focus();
      const span = document.createElement('span');
      span.style.color = color;
      // zero-width space so the span has content and the cursor sits inside it
      span.innerHTML = '&#8203;';

      const currentSel = window.getSelection();
      if (currentSel && currentSel.rangeCount > 0) {
        const range = currentSel.getRangeAt(0);
        if (editor.contains(range.commonAncestorContainer)) {
          range.collapse(false);
          range.insertNode(span);
          // Place cursor after the zero-width char, inside the span
          const newRange = document.createRange();
          newRange.setStart(span.firstChild!, 1);
          newRange.collapse(true);
          currentSel.removeAllRanges();
          currentSel.addRange(newRange);
          return;
        }
      }
      // Fallback: append at end
      editor.appendChild(span);
      const newRange = document.createRange();
      newRange.setStart(span.firstChild!, 1);
      newRange.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(newRange);
    }
    editor.focus();
  };

  const handleLink = () => {
    const url = window.prompt('Nhập URL:', 'https://');
    if (url) exec('createLink', url);
  };

  return (
    <div className='rounded-xl border border-border/60 dark:border-white/8 bg-white dark:bg-surface-card overflow-hidden shadow-sm'>
      {/* ── Toolbar ── */}
      <div className='flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-border/50 dark:border-white/8 bg-gray-50/80 dark:bg-white/3'>
        {/* Text formatting */}
        <ToolBtn onClick={() => exec('bold')} title='In đậm (Ctrl+B)'>
          <Bold size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => exec('italic')} title='In nghiêng (Ctrl+I)'>
          <Italic size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => exec('underline')} title='Gạch chân (Ctrl+U)'>
          <Underline size={14} />
        </ToolBtn>

        <Sep />

        {/* Headings */}
        <ToolBtn onClick={() => handleHeading('h2')} title='Tiêu đề lớn'>
          <Heading2 size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => handleHeading('h3')} title='Tiêu đề nhỏ'>
          <Heading3 size={14} />
        </ToolBtn>
        <ToolBtn onClick={handleQuote} title='Trích dẫn'>
          <Quote size={14} />
        </ToolBtn>

        <Sep />

        {/* Lists */}
        <ToolBtn
          onClick={() => exec('insertUnorderedList')}
          title='Danh sách gạch đầu'
        >
          <List size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => exec('insertOrderedList')}
          title='Danh sách đánh số'
        >
          <ListOrdered size={14} />
        </ToolBtn>

        <Sep />

        {/* Alignment */}
        <ToolBtn onClick={() => exec('justifyLeft')} title='Căn trái'>
          <AlignLeft size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => exec('justifyCenter')} title='Căn giữa'>
          <AlignCenter size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => exec('justifyRight')} title='Căn phải'>
          <AlignRight size={14} />
        </ToolBtn>

        <Sep />

        {/* Color */}
        <ColorPicker onColorSelect={handleColorChange} />

        <Sep />

        {/* Link */}
        <ToolBtn onClick={handleLink} title='Thêm liên kết'>
          <Link size={14} />
        </ToolBtn>

        {/* Image */}
        <ToolBtn
          onClick={() => setImageMode(imageMode === 'url' ? 'none' : 'url')}
          title='Thêm ảnh'
          active={imageMode === 'url'}
        >
          <ImageIcon size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => imgPickerRef.current?.click()}
          title='Tải ảnh từ máy'
        >
          <ImageIcon size={14} />
          <span className='text-xs'>Tải lên</span>
        </ToolBtn>

        {/* Video */}
        <ToolBtn
          onClick={() => setIsVideoModalOpen(true)}
          title='Thêm video YouTube/Vimeo'
        >
          <Video size={14} />
        </ToolBtn>

        <Sep />

        {/* Divider line */}
        <ToolBtn onClick={handleHR} title='Đường kẻ ngang'>
          <Minus size={14} />
        </ToolBtn>
      </div>

      {/* ── Image URL input (shown when imageMode === 'url') ── */}
      {imageMode === 'url' && (
        <div className='flex items-center gap-2 px-3 py-2 border-b border-border/50 dark:border-white/8 bg-blue-50/50 dark:bg-white/3'>
          <ImageIcon size={14} className='text-text-sub shrink-0' />
          <input
            type='url'
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInsertImageUrl()}
            placeholder='Dán URL ảnh vào đây rồi nhấn Enter hoặc Chèn...'
            className='flex-1 text-sm bg-transparent text-text-main placeholder:text-text-sub focus:outline-none'
            autoFocus
          />
          <button
            type='button'
            onClick={handleInsertImageUrl}
            className='px-3 py-1 text-xs font-medium text-white bg-theme-primary-start rounded-md hover:opacity-90 transition-opacity shrink-0'
          >
            Chèn
          </button>
          <button
            type='button'
            onClick={() => {
              setImageMode('none');
              setImageUrl('');
            }}
            className='px-2 py-1 text-xs text-text-sub hover:text-text-main border border-border/60 dark:border-white/8 rounded-md hover:bg-gray-100 dark:hover:bg-white/8 transition-colors shrink-0'
          >
            Hủy
          </button>
        </div>
      )}

      {/* ── Editable area ── */}
      <div className='relative'>
        {showPlaceholder && (
          <p
            className='absolute top-0 left-0 px-4 py-3 text-sm text-text-sub pointer-events-none select-none'
            aria-hidden
          >
            {placeholder}
          </p>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          onInput={handleChange}
          onFocus={() => setShowPlaceholder(false)}
          onBlur={() => {
            const html = editorRef.current?.innerHTML ?? '';
            setShowPlaceholder(!html || html === '<br>');
          }}
          className='px-4 py-3 text-sm text-text-main focus:outline-none
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1
            [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1
            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1
            [&_blockquote]:border-l-4 [&_blockquote]:border-theme-primary-start/60 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-text-sub [&_blockquote]:my-2
            [&_a]:text-theme-primary-start [&_a]:underline
            [&_.rich-media]:block [&_.rich-media]:max-w-sm [&_.rich-media]:h-auto [&_.rich-media]:rounded-lg [&_.rich-media]:my-3
            [&_iframe.rich-media]:w-full [&_iframe.rich-media]:max-w-sm [&_iframe.rich-media]:aspect-video
            [&_hr]:border-border/50 [&_hr]:dark:border-white/10 [&_hr]:my-3'
          style={{ minHeight: minHeight }}
        />
      </div>

      {/* Hidden file input */}
      <input
        ref={imgPickerRef}
        type='file'
        accept='image/*,image/gif'
        className='hidden'
        onChange={handleImageFile}
      />

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onSubmit={handleVideoSubmit}
      />
    </div>
  );
}
