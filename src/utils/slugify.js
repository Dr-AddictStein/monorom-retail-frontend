/**
 * Turn free text into a URL-safe slug.
 * e.g. "32 Pcs Bdgl Dinner Set (25511)" → "32-pcs-bdgl-dinner-set-25511"
 */
export function toSlug(text) {
  return String(text ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Strip HTML tags for meta description fallbacks */
export function stripHtml(html) {
  return String(html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
