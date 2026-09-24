// Run after deploying: node --env-file=.env.local scripts/telegram-setup.mjs
const {
  TELEGRAM_BOT_TOKEN: token,
  TELEGRAM_OWNER_ID: owner,
  TELEGRAM_WEBHOOK_SECRET: secret,
  NEXT_PUBLIC_SITE_URL: site,
} = process.env;
if (
  !token ||
  !/^[1-9]\d*$/.test(owner || "") ||
  !/^[a-zA-Z0-9_-]{32,256}$/.test(secret || "") ||
  !site?.startsWith("https://")
)
  throw new Error(
    "Configure Telegram token, numeric owner ID, random webhook secret and HTTPS site URL",
  );
async function call(method, body = {}) {
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const data = await r.json();
  if (!r.ok || !data.ok) throw new Error(`${method} failed (${r.status})`);
  return data.result;
}
const me = await call("getMe");
const url = new URL("/api/telegram/webhook", site).href;
await call("setWebhook", {
  url,
  secret_token: secret,
  allowed_updates: ["message", "callback_query"],
  max_connections: 1,
});
await call("setMyCommands", {
  commands: [
    { command: "start", description: "Открыть меню VELA" },
    { command: "test", description: "Проверить доставку уведомлений" },
  ],
});
await call("setMyCommands", {
  scope: { type: "chat", chat_id: owner },
  commands: [
    { command: "start", description: "Главное меню" },
    { command: "managers", description: "Менеджеры и запросы доступа" },
    { command: "add", description: "Как добавить менеджера" },
    { command: "test", description: "Проверить доставку уведомлений" },
  ],
});
const info = await call("getWebhookInfo");
console.log(
  JSON.stringify({
    bot: me.username,
    webhook: info.url,
    pendingUpdates: info.pending_update_count,
    configured: info.url === url,
  }),
);
