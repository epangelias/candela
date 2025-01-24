export async function hashText(text: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function generateCode(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charsLength = chars.length;

  const byteLength = Math.ceil(length / 2);
  const randomBytes = new Uint8Array(byteLength);
  crypto.getRandomValues(randomBytes);

  return Array.from(randomBytes).map((byte) => chars[byte % charsLength]).join('').slice(0, length);
}
