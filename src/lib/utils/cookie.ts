/**
 * Parses a cookie string into an object.
 * @param str The cookie string (e.g., from document.cookie or a request header).
 * @returns An object of key-value pairs.
 */
export function parseCookies(str: string): Record<string, string> {
  if (!str) {
    return {}
  }

  return str
    .split(';')
    .map((v) => v.split('='))
    .reduce(
      (acc, v) => {
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1]?.trim() || '')
        return acc
      },
      {} as Record<string, string>
    )
}
