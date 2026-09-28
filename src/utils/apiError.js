export function slugConflictMessage(entityLabel, name, slug) {
  const who = name
    ? `A ${entityLabel} named "${name}"`
    : `Another ${entityLabel}`;
  return `${who} already uses the slug "${slug}". Please choose a different slug.`;
}

/** Look up an item by its public slug. Returns null when the slug is free. */
export async function findExistingBySlug(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data || typeof data !== "object" || !data._id) return null;
    return data;
  } catch {
    return null;
  }
}

/** Read a JSON error body from a failed fetch response. */
export async function readApiError(response, fallback = "Request failed") {
  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  return {
    message: payload.message || payload.error || fallback,
    code: payload.code || "",
    slug: payload.slug || "",
  };
}
