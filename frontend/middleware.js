/**
 * Vercel Routing Middleware — Bot/Crawler Prerender Proxy
 *
 * For known crawlers (Googlebot, Bingbot, link-preview bots), intercept
 * single-segment shop slug paths and proxy to the backend og_store_view,
 * which returns fully server-rendered HTML with correct SEO tags.
 *
 * Normal visitors fall through to the React SPA (index.html).
 *
 * This is NOT cloaking: og_store_view serves the same title/description/
 * schema that the SPA fetches and renders — just pre-rendered for crawlers.
 *
 * Canonical URLs in the proxied HTML point to zeleradeck.com (the FRONTEND_URL
 * env var on Render), not to zeleradeck.onrender.com.
 */

// ─── Bot UA patterns ──────────────────────────────────────────────────────────
const BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /slurp/i,                    // Yahoo
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /facebookexternalhit/i,
  /facebot/i,
  /twitterbot/i,
  /linkedinbot/i,
  /telegrambot/i,
  /whatsapp/i,
  /slackbot/i,
  /discordbot/i,
  /applebot/i,
];

// ─── Reserved single-segment paths that must NOT be proxied ──────────────────
const RESERVED_EXACT = new Set([
  "/",
  "/about",
  "/contact",
  "/why-us",
  "/directory",
  "/shops",
  "/sitemap.xml",
  "/sitemap-stores.xml",
  "/login",
  "/signup",
  "/old-home",
  "/maintenance-preview",
  "/robots.txt",
  "/llms.txt",
  "/favicon.ico",
]);

// Prefixes: any path starting with these is not a shop slug
const RESERVED_PREFIXES = [
  "/admin",
  "/api",
  "/dashboard",
  "/pro-admin",
  "/pro/",
  "/store/",
  "/og/",
  "/static/",
  "/assets/",
  "/_vercel",
];

const BACKEND_ORIGIN = "https://zeleradeck.onrender.com";

export default async function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // ── 1. Skip reserved exact paths ─────────────────────────────────────────
  if (RESERVED_EXACT.has(pathname)) return;

  // ── 2. Skip reserved prefixes ────────────────────────────────────────────
  if (RESERVED_PREFIXES.some((p) => pathname.startsWith(p))) return;

  // ── 3. Only intercept single-segment paths: /{slug} ──────────────────────
  //    Split on "/" and discard empty strings from leading "/"
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length !== 1) return;

  const slug = parts[0];

  // ── 4. Skip file extensions (images, fonts, etc.) ────────────────────────
  if (/\.[a-z0-9]+$/i.test(slug)) return;

  // ── 5. Check User-Agent ───────────────────────────────────────────────────
  const ua = request.headers.get("user-agent") || "";
  const isBot = BOT_PATTERNS.some((p) => p.test(ua));
  if (!isBot) return;

  // ── 6. Proxy to backend og_store_view ────────────────────────────────────
  const backendUrl = `${BACKEND_ORIGIN}/og/store/${slug}/`;

  try {
    const backendRes = await fetch(backendUrl, {
      headers: {
        // Forward original User-Agent so the backend can log it
        "User-Agent": ua,
        // Tell the backend we want HTML
        Accept: "text/html",
      },
      // 5-second timeout — bots will wait, but don't stall the edge
      signal: AbortSignal.timeout(5000),
    });

    const html = await backendRes.text();

    return new Response(html, {
      status: backendRes.status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        // Don't cache error responses at the edge
        "Cache-Control":
          backendRes.ok
            ? "public, max-age=300, stale-while-revalidate=3600"
            : "no-store",
        // Let the bot know this is a proxied response (useful for debugging)
        "X-Robots-Source": "og-proxy",
      },
    });
  } catch (err) {
    // Network/timeout error — fall through to React SPA so normal visitors
    // are never affected, and bots get a soft-fail (SPA shell)
    console.error("[middleware] og-proxy fetch failed:", err?.message);
    return; // fall through
  }
}

// ─── Vercel matcher ──────────────────────────────────────────────────────────
// Match all paths; we filter internally (more precise than a regex matcher
// because we need to check both path shape AND User-Agent before proxying).
export const config = {
  matcher: "/:path*",
};
