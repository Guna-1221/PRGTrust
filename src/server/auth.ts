import { getEnv } from "./env";

const DEFAULT_SECRET = "prg-trust-default-dev-secret-key-2026";
const DEFAULT_PASSCODE = "prgtrust2026";
const TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function base64UrlEncode(str: string): string {
  const base64 = btoa(str);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createAdminToken(secret?: string): Promise<string> {
  const env = await getEnv();
  const signingSecret = secret || (env.JWT_SECRET as string) || DEFAULT_SECRET;

  const payload = {
    role: "admin",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + TOKEN_MAX_AGE_SECONDS,
  };

  const payloadString = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(payloadString);

  const key = await getHmacKey(signingSecret);
  const enc = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(encodedPayload));
  const signatureHex = bufferToHex(signatureBuffer);

  return `${encodedPayload}.${signatureHex}`;
}

export async function verifyAdminToken(token: string, secret?: string): Promise<boolean> {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return false;
  }

  const [encodedPayload, signatureHex] = token.split(".");
  if (!encodedPayload || !signatureHex) {
    return false;
  }

  try {
    const env = await getEnv();
    const signingSecret = secret || (env.JWT_SECRET as string) || DEFAULT_SECRET;

    const key = await getHmacKey(signingSecret);
    const enc = new TextEncoder();
    const expectedSignature = hexToBuffer(signatureHex);

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      expectedSignature,
      enc.encode(encodedPayload),
    );

    if (!valid) return false;

    const payloadJson = base64UrlDecode(encodedPayload);
    const payload = JSON.parse(payloadJson) as { role?: string; exp?: number };

    if (payload.role !== "admin") return false;
    if (typeof payload.exp === "number" && payload.exp < Math.floor(Date.now() / 1000)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function extractTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  const cookieHeader = request.headers.get("Cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";");
    for (const c of cookies) {
      const [name, ...valParts] = c.trim().split("=");
      if (name === "prg_admin_token") {
        return valParts.join("=");
      }
    }
  }

  return null;
}

export async function authenticateRequest(
  request: Request,
): Promise<{ authenticated: boolean; error?: string }> {
  const token = extractTokenFromRequest(request);
  if (!token) {
    return { authenticated: false, error: "Missing authorization token." };
  }

  const isValid = await verifyAdminToken(token);
  if (!isValid) {
    return { authenticated: false, error: "Invalid or expired session. Please log in again." };
  }

  return { authenticated: true };
}

export async function verifyPasscode(inputPasscode: string): Promise<boolean> {
  const env = await getEnv();
  const configured = ((env.ADMIN_PASSCODE as string) || DEFAULT_PASSCODE).trim();
  const input = (inputPasscode || "").trim();

  if (configured.length !== input.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < configured.length; i++) {
    result |= configured.charCodeAt(i) ^ input.charCodeAt(i);
  }
  return result === 0;
}

export function createAuthCookie(token: string, maxAge: number = TOKEN_MAX_AGE_SECONDS): string {
  return `prg_admin_token=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax; Secure`;
}

export function createLogoutCookie(): string {
  return `prg_admin_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure`;
}
