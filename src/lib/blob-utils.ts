/**
 * Extracts the blob file path from an Azure Blob Storage URL.
 * Example:
 *   https://<account>.blob.core.windows.net/<container>/products/abc123.jpg
 *   → "products/abc123.jpg"
 *
 * Returns null if the URL is invalid or doesn't match the expected pattern.
 */
export function extractBlobPathFromUrl(url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    // First segment is the container name - skip it
    if (segments.length >= 2) {
      return segments.slice(1).join("/");
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Checks if a URL is from Azure Blob Storage (has the typical blob URL pattern).
 */
export function isAzureBlobUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes(".blob.core.windows.net");
  } catch {
    return false;
  }
}
