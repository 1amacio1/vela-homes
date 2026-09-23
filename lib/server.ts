import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SignJWT, jwtVerify } from "jose";
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
export function db() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    throw new Error("База данных не настроена");
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
function secret() {
  if (!process.env.SESSION_SECRET) throw new Error("Сессии не настроены");
  return new TextEncoder().encode(process.env.SESSION_SECRET);
}
export async function sign(
  payload: Record<string, unknown>,
  audience: string,
  ttl = "12h",
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(secret());
}
export async function verify(token: string, audience: string) {
  try {
    return (
      await jwtVerify(token, secret(), { audience, algorithms: ["HS256"] })
    ).payload;
  } catch {
    return null;
  }
}
export async function isAdmin() {
  const c = await cookies();
  return !!(await verify(c.get("vela_admin")?.value || "", "admin"));
}
export function validPassword(value: string) {
  const [salt, hash] = (process.env.ADMIN_PASSWORD_HASH || "").split(":");
  if (!salt || !hash) return false;
  const actual = scryptSync(value, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return expected.length === actual.length && timingSafeEqual(actual, expected);
}
export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export async function limit(
  req: NextRequest,
  kind: string,
  max: number,
  seconds: number,
) {
  const ip =
    req.headers.get("x-vercel-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    "local";
  const key = createHmac("sha256", process.env.SESSION_SECRET!)
    .update(kind + ":" + ip)
    .digest("hex");
  const { data, error } = await db().rpc("vela_rate_limit", {
    p_key: key,
    p_limit: max,
    p_seconds: seconds,
  });
  if (error)
    throw new ApiError("Сервис временно недоступен. Повторите позже.", 503);
  if (!data)
    throw new ApiError("Слишком много попыток. Попробуйте позже.", 429);
}
export function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  const allowed = [
    req.nextUrl.origin,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "",
  ].filter(Boolean);
  if (
    origin &&
    !allowed.includes(origin) &&
    new URL(origin).host !== req.headers.get("host")
  )
    throw new ApiError("Недопустимый источник запроса", 403);
}
export function ensure<T>(result: { data: T; error: unknown }) {
  if (result.error) {
    console.error("Database operation failed");
    throw new ApiError("Не удалось сохранить данные. Попробуйте ещё раз.", 503);
  }
  return result.data;
}
export async function attribution(sessionId?: string, visitorId?: string) {
  const d = db();
  if (sessionId && visitorId) {
    const { data } = await d
      .from("vela_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("visitor_id", visitorId)
      .maybeSingle();
    if (data)
      return {
        session_id: sessionId,
        visitor_id: visitorId,
        source: data.source,
        ref_code: data.ref_code,
        utm: data.utm,
      };
  }
  const c = await cookies();
  const code = c.get("vela_ref")?.value;
  const { data } = code
    ? await d
        .from("vela_referrals")
        .select("code")
        .eq("code", code)
        .maybeSingle()
    : { data: null };
  return {
    session_id: null,
    visitor_id: null,
    source: data ? "Реферальная ссылка" : "Прямой переход",
    ref_code: data?.code || null,
    utm: {},
  };
}
