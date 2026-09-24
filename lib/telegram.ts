import "server-only";
import { db, ensure } from "./server";
import { calculatorText } from "./calculator";
import { telegramCall, telegramOwner } from "./telegram-api";

export async function sendTelegram(id: string) {
  const d = db(),
    owner = telegramOwner(),
    legacy = process.env.TELEGRAM_CHAT_ID;
  if (!process.env.TELEGRAM_BOT_TOKEN || (!owner && !legacy)) {
    ensure(
      await d
        .from("vela_leads")
        .update({ telegram_status: "not_configured" })
        .eq("id", id),
    );
    return { ok: false, status: "not_configured" };
  }
  const leads = ensure(await d.rpc("vela_claim_telegram_lead", { p_id: id }));
  const lead = leads?.[0];
  if (!lead) return { ok: false, status: "already_processing" };
  try {
    const managers = owner
      ? ensure(
          await d
            .from("vela_telegram_managers")
            .select("user_id,chat_id")
            .eq("status", "active"),
        ) || []
      : [];
    const previous =
      ensure(
        await d
          .from("vela_telegram_deliveries")
          .select("chat_id")
          .eq("lead_id", id),
      ) || [];
    const recipients = previous.length
      ? previous.map((x) => String(x.chat_id))
      : [
          ...new Set<string>([
            owner || legacy!,
            ...managers.map((m) => String(m.chat_id)),
          ]),
        ];
    ensure(
      await d.from("vela_telegram_deliveries").upsert(
        recipients.map((chat) => ({ lead_id: id, chat_id: chat })),
        { onConflict: "lead_id,chat_id", ignoreDuplicates: true },
      ),
    );
    const fileLines = await Promise.all(
      (lead.files || []).map(
        async (f: { path: string; name: string; size: number }) => {
          const data = ensure(
            await d.storage
              .from("vela-attachments")
              .createSignedUrl(f.path, 86400),
          );
          if (!data?.signedUrl) throw new Error("File link unavailable");
          return `${f.name} (${Math.ceil(f.size / 1024)} КБ)\n${data.signedUrl}`;
        },
      ),
    );
    const text = `VELA · новая заявка\n№ ${lead.id}\n${lead.name}\nТелефон: ${lead.phone}\nEmail: ${lead.email}\nРегион: ${lead.region}\nУслуги: ${lead.services.join(", ")}\nПлощадь: ${lead.area || "не указана"} м²\n${lead.calculator ? "\nРасчёт:\n" + calculatorText(lead.calculator) : ""}\nКомментарий: ${lead.comment || "—"}\nИсточник: ${lead.source}\nРеферальный код: ${lead.ref_code || "—"}\nUTM: ${JSON.stringify(lead.utm)}\nФайлы (${lead.files.length}; ссылки на 24 часа):\n${fileLines.join("\n")}\nАдмин-панель: ${process.env.NEXT_PUBLIC_SITE_URL}/admin`;
    const parts = text.match(/[\s\S]{1,3900}/gu) || [];
    let failed = 0,
      delivered = 0,
      firstMessageId: number | undefined;
    // Checkpoints skip delivered recipients and message parts on manual retry.
    await Promise.all(
      recipients.map(async (chat) => {
        try {
          if (owner && chat !== owner) {
            const active = ensure(
              await d
                .from("vela_telegram_managers")
                .select("user_id")
                .eq("chat_id", chat)
                .eq("status", "active")
                .maybeSingle(),
            );
            if (!active) return;
          }
          ensure(
            await d
              .from("vela_telegram_deliveries")
              .upsert(
                { lead_id: id, chat_id: chat },
                { onConflict: "lead_id,chat_id", ignoreDuplicates: true },
              ),
          );
          const progress = ensure(
            await d
              .from("vela_telegram_deliveries")
              .select("*")
              .eq("lead_id", id)
              .eq("chat_id", chat)
              .single(),
          );
          if (progress.status === "sent") {
            delivered++;
            firstMessageId ??= progress.message_id;
            return;
          }
          let first = progress.message_id;
          for (let part = progress.next_part; part < parts.length; part++) {
            const result = await telegramCall("sendMessage", {
              chat_id: chat,
              text: parts[part],
              link_preview_options: { is_disabled: true },
            });
            first ??= result.message_id;
            ensure(
              await d
                .from("vela_telegram_deliveries")
                .update({
                  next_part: part + 1,
                  message_id: first,
                  updated_at: new Date().toISOString(),
                })
                .eq("lead_id", id)
                .eq("chat_id", chat),
            );
          }
          ensure(
            await d
              .from("vela_telegram_deliveries")
              .update({ status: "sent", updated_at: new Date().toISOString() })
              .eq("lead_id", id)
              .eq("chat_id", chat),
          );
          delivered++;
          firstMessageId ??= first;
        } catch {
          failed++;
          await d
            .from("vela_telegram_deliveries")
            .update({ status: "failed", updated_at: new Date().toISOString() })
            .eq("lead_id", id)
            .eq("chat_id", chat);
        }
      }),
    );
    const status = failed ? "failed" : "sent";
    ensure(
      await d
        .from("vela_leads")
        .update({
          telegram_status: status,
          telegram_locked_until: null,
          telegram_message_id: firstMessageId,
          telegram_error: failed
            ? `Доставлено: ${delivered}. Не доставлено: ${failed}. Проверьте, не заблокирован ли бот получателем, и повторите отправку. Уже доставленные сообщения повторно не отправляются.`
            : null,
        })
        .eq("id", id),
    );
    return { ok: !failed, status };
  } catch {
    ensure(
      await d
        .from("vela_leads")
        .update({
          telegram_status: "failed",
          telegram_locked_until: null,
          telegram_error:
            "Ошибка доставки Telegram. Заявка сохранена. Повторите отправку.",
        })
        .eq("id", id),
    );
    return { ok: false, status: "failed" };
  }
}
