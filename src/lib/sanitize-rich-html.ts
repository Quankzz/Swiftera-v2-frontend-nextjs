'use client';

import DOMPurify from 'dompurify';

import { normalizeRichTextToHtml } from '@/lib/rich-text';

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{6,20}$/;
const VIMEO_ID_PATTERN = /^\d+$/;

function normalizeYouTubeId(id: string | null): string | null {
  if (!id) return null;
  const cleaned = id.trim().split(/[?&#]/)[0];
  return YOUTUBE_ID_PATTERN.test(cleaned) ? cleaned : null;
}

function normalizeVimeoId(id: string | null): string | null {
  if (!id) return null;
  const cleaned = id.trim().split(/[?&#]/)[0];
  return VIMEO_ID_PATTERN.test(cleaned) ? cleaned : null;
}

function normalizeYoutubeEmbedUrl(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  let videoId: string | null = null;

  if (host.includes('youtu.be')) {
    videoId = normalizeYouTubeId(url.pathname.split('/').filter(Boolean)[0] ?? null);
  } else if (
    host.includes('youtube.com') ||
    host.includes('youtube-nocookie.com')
  ) {
    if (url.pathname.startsWith('/embed/')) {
      videoId = normalizeYouTubeId(
        url.pathname.replace('/embed/', '').split('/')[0] ?? null,
      );
    } else if (url.pathname.startsWith('/shorts/')) {
      videoId = normalizeYouTubeId(
        url.pathname.replace('/shorts/', '').split('/')[0] ?? null,
      );
    } else if (url.pathname.startsWith('/live/')) {
      videoId = normalizeYouTubeId(
        url.pathname.replace('/live/', '').split('/')[0] ?? null,
      );
    } else {
      videoId = normalizeYouTubeId(url.searchParams.get('v'));
    }
  }

  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
}

function normalizeVimeoEmbedUrl(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  if (!host.includes('vimeo.com')) return null;

  if (host.includes('player.vimeo.com') && url.pathname.startsWith('/video/')) {
    const idFromPlayer = normalizeVimeoId(
      url.pathname.replace('/video/', '').split('/')[0] ?? null,
    );
    return idFromPlayer ? `https://player.vimeo.com/video/${idFromPlayer}` : null;
  }

  const id = normalizeVimeoId(
    url.pathname
      .split('/')
      .filter(Boolean)
      .pop() ?? null,
  );
  return id ? `https://player.vimeo.com/video/${id}` : null;
}

function normalizeEmbedSrc(src: string): string | null {
  const raw = src.trim();
  if (!raw) return null;

  const normalizedRaw = raw.startsWith('//') ? `https:${raw}` : raw;

  try {
    const parsed = new URL(normalizedRaw);
    return normalizeYoutubeEmbedUrl(parsed) ?? normalizeVimeoEmbedUrl(parsed);
  } catch {
    return null;
  }
}

function keepOnlyAllowedIframes(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const iframes = Array.from(doc.querySelectorAll('iframe'));
  for (const iframe of iframes) {
    const src = iframe.getAttribute('src') ?? '';
    const normalizedSrc = normalizeEmbedSrc(src);
    if (!normalizedSrc) {
      iframe.remove();
      continue;
    }

    iframe.setAttribute('src', normalizedSrc);
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    iframe.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    );
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.classList.add('rich-media');
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
