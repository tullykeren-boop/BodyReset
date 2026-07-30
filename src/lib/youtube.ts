/**
 * Extracts an 11-character YouTube video ID from a watch/share/embed URL and
 * returns a privacy-enhanced embed URL, or null if the input doesn't look
 * like a valid YouTube video URL.
 */
export function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    let videoId: string | null = null;

    if (host === "youtu.be") {
      videoId = parsed.pathname.slice(1);
    } else if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v");
      } else if (parsed.pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.slice("/embed/".length);
      } else if (parsed.pathname.startsWith("/shorts/")) {
        videoId = parsed.pathname.slice("/shorts/".length);
      }
    }

    videoId = videoId?.split(/[?&]/)[0] ?? null;
    if (!videoId || !/^[\w-]{11}$/.test(videoId)) return null;

    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
  } catch {
    return null;
  }
}
