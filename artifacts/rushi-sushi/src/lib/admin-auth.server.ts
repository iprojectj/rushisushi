import { createHmac, createHash, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "rushi_admin_session";
const SESSION_TTL_SECONDS = 12 * 60 * 60;

function sessionKey() {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET não está configurada.");
  return value;
}

function signature(expiresAt: string) {
  return createHmac("sha256", sessionKey()).update(`admin:${expiresAt}`).digest("base64url");
}

export function passwordMatches(candidate: unknown) {
  const expected = process.env.ADMIN_PASSWORD;
  if (typeof candidate !== "string" || candidate.length > 256 || !expected) return false;
  const submittedHash = createHash("sha256").update(candidate).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(submittedHash, expectedHash);
}

export function makeAdminCookie() {
  const expiresAt = String(Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS);
  return `${expiresAt}.${signature(expiresAt)}`;
}

export function verifyAdminCookie(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const raw = cookieHeader.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_COOKIE}=`))?.slice(ADMIN_COOKIE.length + 1);
  if (!raw) return false;
  const [expiresAt, supplied] = raw.split(".");
  if (!expiresAt || !supplied || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) < Math.floor(Date.now() / 1000)) return false;
  try {
    const expected = Buffer.from(signature(expiresAt));
    const actual = Buffer.from(supplied);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export const adminCookieOptions = "HttpOnly; Secure; SameSite=Lax; Path=/";
export const adminSessionMaxAge = SESSION_TTL_SECONDS;
