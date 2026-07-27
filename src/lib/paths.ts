function basePath(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, "");
}

/** Prefix a site path with the configured Astro base URL. */
export function withBase(path: string): string {
  const base = basePath();
  if (path.startsWith("/#")) {
    return base ? `${base}${path}` : path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!base) return normalized;
  return `${base}${normalized}`;
}

/** Strip the Astro base prefix from a URL pathname for route matching. */
export function stripBase(pathname: string): string {
  const base = basePath();
  if (!base) return pathname;
  if (pathname === base) return "/";
  if (pathname.startsWith(`${base}/`)) {
    return pathname.slice(base.length);
  }
  return pathname;
}
