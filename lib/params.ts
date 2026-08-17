/** In production, dynamic route segments containing non-ASCII characters
 * (Korean slugs) arrive in `params` still percent-encoded instead of
 * decoded, so a raw `.eq("slug", slug)` lookup silently misses and the page
 * 404s — this doesn't reproduce locally, only on the deployed runtime.
 * Safe to call unconditionally: slugs never contain a literal "%", so this
 * is a no-op on an already-decoded value. */
export function decodeSlugParam(slug: string): string {
  return decodeURIComponent(slug);
}
