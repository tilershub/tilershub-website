// Sponsor landing pages that actually exist under src/pages/sponsor/.
//
// `brands.dedicated_page_url` is free text in the database, so it can point at
// a route nobody ever built — and it did: /brands/luxehome was 301-redirecting
// to /sponsor/luxehome, which 404s. A redirect into a 404 is the worst of both
// worlds for a crawler. Every read of that column goes through here so an
// unbuilt page degrades to the normal brand page instead.
//
// Add the slug here when a new sponsor page is added under src/pages/sponsor/.
const BUILT_SPONSOR_PAGES = new Set(['/sponsor/megatile'])

/** The href a brand card should link to, guaranteed to resolve. */
export function brandHref(brand) {
  const dedicated = sponsorPage(brand)
  return dedicated || `/brands/${brand.slug}`
}

/** The sponsor page for this brand, or null if it hasn't been built. */
export function sponsorPage(brand) {
  const url = (brand?.dedicated_page_url || '').trim()
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url          // off-site sponsor page
  const path = url.replace(/\/+$/, '')
  return BUILT_SPONSOR_PAGES.has(path) ? path : null
}
