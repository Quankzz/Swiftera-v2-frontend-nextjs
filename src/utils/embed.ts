/**
 * Build video embed iframe from URL
 * Supports YouTube and Vimeo
 * @param {string} url - Video URL
 * @returns {HTMLIFrameElement|null} iframe element or null if not supported
 */
export function buildVideoEmbed(url: string) {
  try {
    const u = new URL(url);

    const buildIframe = (src: string) => {
      const iframe = document.createElement("iframe");
      iframe.src = src;
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allowFullscreen = true;
      iframe.className = "rich-media aspect-video rounded-xl my-4";
      return iframe;
    };

    const normalizeYouTubeId = (value: string | null) => {
      if (!value) return null;
      const cleaned = value.trim().split(/[?&#]/)[0];
      return /^[A-Za-z0-9_-]{6,20}$/.test(cleaned) ? cleaned : null;
    };

    const hostname = u.hostname.toLowerCase();

    // YouTube support
    if (
      hostname.includes("youtube.com") ||
      hostname.includes("youtube-nocookie.com")
    ) {
      let id: string | null;
      if (u.pathname.startsWith("/embed/")) {
        id = normalizeYouTubeId(
          u.pathname.replace("/embed/", "").split("/")[0] ?? null,
        );
      } else if (u.pathname.startsWith("/shorts/")) {
        id = normalizeYouTubeId(
          u.pathname.replace("/shorts/", "").split("/")[0] ?? null,
        );
      } else if (u.pathname.startsWith("/live/")) {
        id = normalizeYouTubeId(
          u.pathname.replace("/live/", "").split("/")[0] ?? null,
        );
      } else {
        id = normalizeYouTubeId(u.searchParams.get("v"));
      }

      if (!id) return null;
      return buildIframe(`https://www.youtube.com/embed/${id}`);
    }

    // YouTube short URL support
    if (hostname.includes("youtu.be")) {
      const id = normalizeYouTubeId(
        u.pathname.split("/").filter(Boolean)[0] ?? null,
      );
      if (!id) return null;
      return buildIframe(`https://www.youtube.com/embed/${id}`);
    }

    // Vimeo support
    if (hostname.includes("vimeo.com")) {
      const id =
        u.pathname.split("/").filter(Boolean).pop()?.split(/[?&#]/)[0] ?? null;
      if (!id) return null;
      return buildIframe(`https://player.vimeo.com/video/${id}`);
    }

    return null;
  } catch {
    return null;
  }
}
