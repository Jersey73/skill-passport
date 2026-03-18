/**
 * Encode a raw code string to Base64.
 * Uses btoa with URI encoding to safely handle all Unicode characters.
 */
export function encodeCode(rawCode: string): string {
  try {
    return btoa(unescape(encodeURIComponent(rawCode)))
  } catch {
    // Fallback for environments without btoa
    return Buffer.from(rawCode, 'utf-8').toString('base64')
  }
}

/**
 * Decode a Base64 code payload back to a raw string.
 * Safe for both browser and Node.js (API routes).
 */
export function decodeCode(encoded: string): string {
  try {
    // Browser
    if (typeof atob !== 'undefined') {
      return decodeURIComponent(escape(atob(encoded)))
    }
    // Node.js (API route)
    return Buffer.from(encoded, 'base64').toString('utf-8')
  } catch {
    throw new Error('Failed to decode code payload. Invalid Base64 string.')
  }
}

/**
 * Validate that a string is valid Base64.
 */
export function isValidBase64(str: string): boolean {
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
  return base64Regex.test(str) && str.length % 4 === 0
}
