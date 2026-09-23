import "server-only";
import { db } from "./server";
import { calculatorText } from "./calculator";
export async function sendTelegram(id: string) {
  const d = db();
  const token = process.env.TELEGRAM_BOT_TOKEN,
    chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) {
    await d
      .from("vela_leads")
      .update({ telegram_status: "not_configured" })
      .eq("id", id);
    return { ok: false, status: "not_configured" };
  }
  const { data: lead, error } = await d
    .from("vela_leads")
    .update({ telegram_status: "sending" })
    .eq("id", id)
    .in("telegram_status", ["pending", "failed", "not_configured"])
    .select()
    .maybeSingle();
  if (error || !lead) return { ok: false, status: "already_processing" };
  try {
    const fileLines = await Promise.all(
      (lead.files || []).map(
        async (f: { path: string; name: string; size: number }) => {
          const { data } = await d.storage
            .from("vela-attachments")
            .createSignedUrl(f.path, 86400);
          return `${f.name} (${Math.ceil(f.size / 1024)} КБ)\n${data?.signedUrl || "См. админ-панель"}`;
        },
      ),
    );
    const text = `VELA · новая заявка\n№ ${lead.id}\n${lead.name}\nТелефон: ${lead.phone}\nEmail: ${lead.email}\nРегион: ${lead.region}\nУслуги: ${lead.services.join(", ")}\nПлощадь: ${lead.area || "не указана"} м²\n${lead.calculator ? "\nРасчёт:\n" + calculatorText(lead.calculator) : ""}\nКомментарий: ${lead.comment || "—"}\nИсточник: ${lead.source}\nРеферальный код: ${lead.ref_code || "—"}\nUTM: ${JSON.stringify(lead.utm)}\nФайлы (${lead.files.length}; ссылки на 24 часа):\n${fileLines.join("\n")}\nАдмин-панель: ${process.env.NEXT_PUBLIC_SITE_URL}/admin`;
    let firstMessageId: number | undefined;
    for (let pos = 0; pos < text.length; pos += 3900) {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chat,
            text: text.slice(pos, pos + 3900),
            link_preview_options: { is_disabled: true },
          }),
          signal: AbortSignal.timeout(12000),
        },
      );
      const result = await response.json();
      if (!response.ok || !result.ok)
        throw new Error("Telegram API error " + response.status);
      firstMessageId ??= result.result.message_id;
    }
    await d
      .from("vela_leads")
      .update({
        telegram_status: "sent",
        telegram_error: null,
        telegram_message_id: firstMessageId,
      })
      .eq("id", id);
    return { ok: true, status: "sent" };
  } catch {
    await d
      .from("vela_leads")
      .update({
        telegram_status: "failed",
        telegram_error:
          "Ошибка доставки. Проверьте токен, ID получателя и доступ бота к чату.",
      })
      .eq("id", id);
    return { ok: false, status: "failed" };
  }
}
