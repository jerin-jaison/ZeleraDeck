import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'ZeleraDeck'
const DEFAULT_TITLE = 'ZeleraDeck — Where Growth Begins'
const DEFAULT_DESC =
  'ZeleraDeck is a mobile-first digital product catalogue SaaS for small shop owners in Kerala, India. Create your digital catalogue, share one link, and let customers browse and order on WhatsApp.'
const DEFAULT_IMAGE = 'https://zeleradeck.com/logo2.png'
const DEFAULT_URL = 'https://zeleradeck.com'

/**
 * SEOHead — drop this into any page to get full technical SEO coverage.
 *
 * Props:
 *  title       — page title (auto-appends "| ZeleraDeck")
 *  description — meta description
 *  url         — canonical URL for this page
 *  image       — OG / Twitter image URL
 *  keywords    — comma-separated keywords string
 *  schema      — JSON-LD object (or array of objects) for structured data
 *  noindex     — set true for private/auth pages
 */
export default function SEOHead({
  title,
  description = DEFAULT_DESC,
  url = DEFAULT_URL,
  image = DEFAULT_IMAGE,
  keywords,
  schema,
  noindex = false,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE

  // Support both a single schema object and an array
  const schemas = schema ? (Array.isArray(schema) ? schema : [schema]) : []

  return (
    <Helmet>
      {/* ── Primary ── */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* ── Open Graph ── */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_IN" />

      {/* ── Twitter Card ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@zeleradeck" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* ── JSON-LD Structured Data ── */}
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  )
}
