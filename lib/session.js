import { createHmac, timingSafeEqual } from "node:crypto";

const WEEK = 60 * 60 * 24 * 14;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET is not set");
  return value;
}

export function createToken(userId) {
  const payload = Buffer.from(JSON.stringify({
    uid: userId,
    exp: Date.now() + WEEK * 1000
  })).toString("base64url");
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function readToken(token) {
  if (!token || !token.includes(".")) return null;
  const [payload, signature] = token.split(".");
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  const data = JSON.parse(Buffer.from(payload, "base64url").toString());
  if (!data.uid || data.exp < Date.now()) return null;
  return data.uid;
}

export function cookieHeader(token) {
  const secure = process.env.VERCEL ? "; Secure" : "";
  return `session=${token}; HttpOnly; Path=/; Max-Age=${WEEK}; SameSite=Lax${secure}`;
}

export function clearCookie() {
  const secure = process.env.VERCEL ? "; Secure" : "";
  return `session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

export function userIdFromRequest(req) {
  const header = req.headers.cookie || "";
  const match = header.split(";").map((part) => part.trim()).find((part) => part.startsWith("session="));
  if (!match) return null;
  return readToken(decodeURIComponent(match.slice("session=".length)));
}
