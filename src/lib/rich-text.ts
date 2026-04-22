const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*>/i;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function hasHtmlMarkup(value: string): boolean {
  return HTML_TAG_PATTERN.test(value);
}

export function normalizeRichTextToHtml(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (hasHtmlMarkup(trimmed)) {
    return trimmed;
  }

  return escapeHtml(trimmed).replace(/\r\n?/g, "\n").replace(/\n/g, "<br />");
}

export function stripHtml(value: string): string {
  return value
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
