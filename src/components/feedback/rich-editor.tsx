'use client';

import { useCallback, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import TiptapImage from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Youtube from '@tiptap/extension-youtube';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Quote,
} from 'lucide-react';
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
        e.preventDefault();
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

// ─── Helper: extract YouTube video ID ─────────────────────────────
function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
    if (u.hostname === 'youtu.be') return u.pathname.slice(1) || null;
    return null;
  } catch {
    return null;
  }
}

export default function RichEditor({
  placeholder = 'Mô tả chi tiết ý kiến của bạn...',
  onChange,
  minHeight = '180px',
}: RichEditorProps) {
  const imgPickerRef = useRef<HTMLInputElement>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [imageMode, setImageMode] = useState<'none' | 'url'>('none');
  const [imageUrl, setImageUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-theme-primary-start underline' },
      }),
      TiptapImage.configure({
        HTMLAttributes: { class: 'rich-media block my-3 rounded-lg' },
      }),
      Placeholder.configure({ placeholder }),
      TextStyle,
      Color,
      Youtube.configure({
        HTMLAttributes: { class: 'rich-media aspect-video rounded-xl my-4' },
        width: 640,
        height: 360,
      }),
    ],
    content: '',
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      onChange?.(html === '<p></p>' ? '' : html);
    },
    editorProps: {
      attributes: {
        class:
          'px-4 py-3 text-sm text-text-main focus:outline-none [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1 [&_blockquote]:border-l-4 [&_blockquote]:border-theme-primary-start/60 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-text-sub [&_blockquote]:my-2 [&_a]:text-theme-primary-start [&_a]:underline [&_.rich-media]:block [&_.rich-media]:max-w-sm [&_.rich-media]:h-auto [&_.rich-media]:rounded-lg [&_.rich-media]:my-3 [&_iframe.rich-media]:w-full [&_iframe.rich-media]:max-w-sm [&_iframe.rich-media]:aspect-video [&_hr]:border-border/50 [&_hr]:my-3',
        style: `min-height: ${minHeight}`,
      },
    },
  });

  // ─── Handlers ────────────────────────────────────────────────────
  const handleVideoSubmit = useCallback(
    (url: string) => {
      if (!editor) return;
      const ytId = extractYouTubeId(url);
      if (ytId) {
        editor.commands.setYoutubeVideo({ src: url });
      } else if (/vimeo\.com/i.test(url)) {
        const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
        if (vimeoId) {
          editor
            .chain()
            .focus()
            .insertContent(
              `<div data-youtube-video><iframe class="rich-media aspect-video rounded-xl my-4" src="https://player.vimeo.com/video/${vimeoId}" frameborder="0" allowfullscreen></iframe></div>`,
            )
            .run();
        }
      } else if (/^https?:\/\//i.test(url)) {
        editor.chain().focus().setLink({ href: url }).run();
      }
    },
    [editor],
  );

  const handleInsertImageUrl = useCallback(() => {
    if (!imageUrl.trim() || !editor) return;
    editor
      .chain()
      .focus()
      .setImage({ src: imageUrl.trim(), alt: 'Hình ảnh' })
      .run();
    setImageUrl('');
    setImageMode('none');
  }, [editor, imageUrl]);

  const handleImageFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;
      e.target.value = '';

      // Insert uploading placeholder
      editor
        .chain()
        .focus()
        .insertContent(
          '<p><em class="text-xs text-text-sub animate-pulse">Đang tải ảnh lên...</em></p>',
        )
        .run();

      try {
        const result = await uploadSingleFile(file, 'products');
        // Remove the placeholder paragraph and insert the real image
        editor
          .chain()
          .focus()
          .deleteRange({
            from: editor.state.selection.from - 1,
            to: editor.state.selection.from,
          })
          .setImage({ src: result.fileUrl, alt: file.name })
          .run();
      } catch {
        editor
          .chain()
          .focus()
          .insertContent('<p>❌ Tải ảnh thất bại</p>')
          .run();
      }
    },
    [editor],
  );

  const handleColorChange = useCallback(
    (color: string) => {
      if (!editor) return;
      editor.chain().focus().setColor(color).run();
    },
    [editor],
  );

  const handleLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    if (previousUrl) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt('Nhập URL:', 'https://');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  return (
    <div className='rounded-xl border border-border/60 dark:border-white/8 bg-white dark:bg-surface-card overflow-hidden shadow-sm'>
      {/* ── Toolbar ── */}
      <div className='flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-border/50 dark:border-white/8 bg-gray-50/80 dark:bg-white/3'>
        {/* Text formatting */}
        <ToolBtn
          onClick={() => editor?.chain().focus().toggleBold().run()}
          title='In đậm (Ctrl+B)'
          active={editor?.isActive('bold') ?? false}
        >
          <Bold size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          title='In nghiêng (Ctrl+I)'
          active={editor?.isActive('italic') ?? false}
        >
          <Italic size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          title='Gạch chân (Ctrl+U)'
          active={editor?.isActive('underline') ?? false}
        >
          <UnderlineIcon size={14} />
        </ToolBtn>

        <Sep />

        {/* Headings */}
        <ToolBtn
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
          title='Tiêu đề lớn'
          active={editor?.isActive('heading', { level: 2 }) ?? false}
        >
          <Heading2 size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run()
          }
          title='Tiêu đề nhỏ'
          active={editor?.isActive('heading', { level: 3 }) ?? false}
        >
          <Heading3 size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          title='Trích dẫn'
          active={editor?.isActive('blockquote') ?? false}
        >
          <Quote size={14} />
        </ToolBtn>

        <Sep />

        {/* Lists */}
        <ToolBtn
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          title='Danh sách gạch đầu'
          active={editor?.isActive('bulletList') ?? false}
        >
          <List size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          title='Danh sách đánh số'
          active={editor?.isActive('orderedList') ?? false}
        >
          <ListOrdered size={14} />
        </ToolBtn>

        <Sep />

        {/* Alignment */}
        <ToolBtn
          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
          title='Căn trái'
          active={editor?.isActive({ textAlign: 'left' }) ?? false}
        >
          <AlignLeft size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
          title='Căn giữa'
          active={editor?.isActive({ textAlign: 'center' }) ?? false}
        >
          <AlignCenter size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
          title='Căn phải'
          active={editor?.isActive({ textAlign: 'right' }) ?? false}
        >
          <AlignRight size={14} />
        </ToolBtn>

        <Sep />

        {/* Color */}
        <ColorPicker onColorSelect={handleColorChange} />

        <Sep />

        {/* Link */}
        <ToolBtn
          onClick={handleLink}
          title='Thêm / bỏ liên kết'
          active={editor?.isActive('link') ?? false}
        >
          <LinkIcon size={14} />
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
        <ToolBtn
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          title='Đường kẻ ngang'
        >
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

      {/* ── Editor area (Tiptap) ── */}
      <EditorContent editor={editor} />

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
