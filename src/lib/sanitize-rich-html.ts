'use client';

import DOMPurify from 'dompurify';

import { normalizeRichTextToHtml } from '@/lib/rich-text';

const YOUTUBE_EMBED_SRC_PATTERN =
  /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\/embed\//i;

function keepOnlyAllowedIframes(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const iframes = Array.from(doc.querySelectorAll('iframe'));
  for (const iframe of iframes) {
    const src = iframe.getAttribute('src') ?? '';
    if (!YOUTUBE_EMBED_SRC_PATTERN.test(src)) {
      iframe.remove();
      continue;
    }

    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    iframe.setAttribute('allowfullscreen', 'true');
  }

  return doc.body.innerHTML;
}

export function sanitizeRichHtml(value: string): string {
  const normalized = normalizeRichTextToHtml(value);
  if (!normalized) return '';

  const sanitized = DOMPurify.sanitize(normalized, {
    USE_PROFILES: { html: true },
    ADD_TAGS: ['iframe'],
    ADD_ATTR: [
      'allow',
      'allowfullscreen',
      'class',
      'frameborder',
      'height',
      'loading',
      'referrerpolicy',
      'rel',
      'src',
      'style',
      'target',
      'title',
      'width',
    ],
  });

  return keepOnlyAllowedIframes(sanitized);
}
