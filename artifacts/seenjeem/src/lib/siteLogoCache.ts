let _cachedLogoUrl: string | null | undefined = undefined;
let _cachePromise: Promise<string | null> | null = null;

export async function fetchSiteLogo(): Promise<string | null> {
  if (_cachedLogoUrl !== undefined) return _cachedLogoUrl;
  if (_cachePromise) return _cachePromise;
  _cachePromise = fetch("/api/site-settings")
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      _cachedLogoUrl = data?.siteLogoUrl ?? null;
      return _cachedLogoUrl;
    })
    .catch(() => {
      _cachedLogoUrl = null;
      return null;
    });
  return _cachePromise;
}

export function getCachedLogoUrl(): string | null | undefined {
  return _cachedLogoUrl;
}

export function invalidateSiteLogoCache() {
  _cachedLogoUrl = undefined;
  _cachePromise = null;
}
