/**
 * Random, URL-safe id. Uses `crypto.getRandomValues`, which (unlike
 * `crypto.randomUUID`) also exists on plain-http pages such as a dev server
 * opened through its LAN address.
 */
export function createId(length = 20): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}
