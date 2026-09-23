"use client";
import { createId } from "./id";
declare global {
  interface Window {
    ym?: ((...args: unknown[]) => void) & { a?: unknown[]; l?: number };
  }
}
const uuid = createId;
export function identity() {
  try {
    if (localStorage.getItem("vela_analytics") !== "yes") return {};
    let visitorId = localStorage.getItem("vela_visitor");
    if (!visitorId) {
      visitorId = uuid();
      localStorage.setItem("vela_visitor", visitorId);
    }
    let raw = JSON.parse(localStorage.getItem("vela_session") || "null");
    if (
      !raw ||
      Date.now() - raw.time > 1800000 ||
      document.cookie.includes("vela_new_ref=1")
    ) {
      raw = { id: uuid(), time: Date.now() };
      document.cookie = "vela_new_ref=; Max-Age=0; Path=/";
    }
    raw.time = Date.now();
    localStorage.setItem("vela_session", JSON.stringify(raw));
    return { visitorId, sessionId: raw.id as string };
  } catch {
    return {};
  }
}
let sequence = Promise.resolve();
export function track(name: string, detail = "") {
  const ids = identity();
  if (!ids.visitorId) return;
  const q = new URLSearchParams(location.search);
  const utm = Object.fromEntries(
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]
      .filter((k) => q.has(k))
      .map((k) => [k, q.get(k)!.slice(0, 150)]),
  );
  let source = utm.utm_source || "Прямой переход";
  try {
    if (
      !utm.utm_source &&
      document.referrer &&
      new URL(document.referrer).hostname !== location.hostname
    )
      source = new URL(document.referrer).hostname;
  } catch {}
  sequence = sequence.then(async () => {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...ids,
        name,
        detail,
        source,
        utm,
        landing: location.pathname,
      }),
      keepalive: true,
    }).catch(() => {});
  });
  const id = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  if (id && window.ym) window.ym(Number(id), "reachGoal", name, { detail });
}
export async function flushTracking() {
  await sequence;
}
export function startMetrika() {
  const id = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  if (!id || !/^\d+$/.test(id) || document.getElementById("vela-metrika"))
    return;
  const ym: NonNullable<Window["ym"]> = function (...args: unknown[]) {
    (ym.a ??= []).push(args);
  };
  ym.l = Date.now();
  window.ym = ym;
  const script = document.createElement("script");
  script.id = "vela-metrika";
  script.async = true;
  script.src = "https://mc.yandex.ru/metrika/tag.js";
  document.head.appendChild(script);
  ym(Number(id), "init", {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
  });
}

export function sourceMetadata() {
  const q = new URLSearchParams(location.search);
  const utm = Object.fromEntries(
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]
      .filter((k) => q.has(k))
      .map((k) => [k, q.get(k)!.slice(0, 150)]),
  );
  let source = utm.utm_source || "Прямой переход";
  try {
    if (
      !utm.utm_source &&
      document.referrer &&
      new URL(document.referrer).hostname !== location.hostname
    )
      source = new URL(document.referrer).hostname;
  } catch {}
  return { source, utm };
}
