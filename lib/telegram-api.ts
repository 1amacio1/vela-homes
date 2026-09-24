export type TelegramCall = (
  method: string,
  body: Record<string, unknown>,
) => Promise<{ message_id?: number; username?: string }>;

export const telegramCall: TelegramCall = async (method, body) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("Telegram is not configured");
  const response = await fetch(
    `https://api.telegram.org/bot${token}/${method}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    },
  );
  const result = await response.json();
  // Never log Telegram request URLs: they contain the bot token.
  if (!response.ok || !result.ok)
    throw new Error(`Telegram API error ${response.status}`);
  return result.result;
};

export function telegramOwner() {
  const id = process.env.TELEGRAM_OWNER_ID || "";
  return /^[1-9]\d*$/.test(id) ? id : "";
}
