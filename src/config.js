/**
 * Shop API base URL.
 * On the deployed site we always use same-origin `/api` so the browser never
 * talks to api.deliymug.com (privacy extensions often block `api.*` hosts).
 * Netlify proxies `/api/*` to the Vercel backend.
 */
const fromEnv = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

const hostedShopHosts = new Set(["deliymug.com", "www.deliymug.com"]);

function resolveBackendUrl() {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (hostedShopHosts.has(host) || host.endsWith(".netlify.app")) {
      return "";
    }
  }
  return fromEnv;
}

export const BACKEND_URL = resolveBackendUrl();
