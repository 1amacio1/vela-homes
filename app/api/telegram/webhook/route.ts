import { timingSafeEqual } from "node:crypto";
import { db, ensure } from "@/lib/server";
import { handleBotUpdate, telegramUpdateSchema } from "@/lib/telegram-bot";
import { managerStore } from "@/lib/telegram-managers";
import { telegramCall, telegramOwner } from "@/lib/telegram-api";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET,
    owner = telegramOwner();
  if (!secret || !owner) return new Response("Not configured", { status: 503 });
  const provided = Buffer.from(
      req.headers.get("x-telegram-bot-api-secret-token") || "",
    ),
    expected = Buffer.from(secret);
  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  )
    return new Response("Unauthorized", { status: 401 });
  const text = await req.text();
  if (text.length > 50000) return new Response("Too large", { status: 413 });
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  const parsed = telegramUpdateSchema.safeParse(raw);
  if (!parsed.success) return Response.json({ ok: true });
  const d = db(),
    id = parsed.data.update_id;
  try {
    const claim = ensure(
      await d.rpc("vela_claim_telegram_update", { p_id: id }),
    );
    if (claim === "done") return Response.json({ ok: true });
    if (claim !== "claimed") return new Response("Processing", { status: 503 });
    const self = await telegramCall("getMe", {});
    if (!self.username) throw new Error("Missing bot username");
    await handleBotUpdate(parsed.data, {
      store: managerStore(d),
      call: telegramCall,
      ownerId: owner,
      botUsername: self.username,
    });
    ensure(
      await d
        .from("vela_telegram_updates")
        .update({ status: "done" })
        .eq("id", id),
    );
    return Response.json({ ok: true });
  } catch {
    await d
      .from("vela_telegram_updates")
      .update({ locked_until: new Date(0).toISOString() })
      .eq("id", id)
      .eq("status", "processing");
    console.error("Telegram webhook processing failed");
    return new Response("Retry later", { status: 500 });
  }
}
