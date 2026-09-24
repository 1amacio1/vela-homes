import { z } from "zod";
import type { Manager, ManagerStore } from "./telegram-managers";
import type { TelegramCall } from "./telegram-api";
const user = z.object({
  id: z.number().int().positive().safe(),
  is_bot: z.boolean().optional(),
  first_name: z.string().max(256),
  last_name: z.string().max(256).optional(),
  username: z.string().max(64).optional(),
});
const message = z.object({
  message_id: z.number().int(),
  from: user.optional(),
  chat: z.object({ id: z.number().int().safe(), type: z.string() }),
  text: z.string().max(10000).optional(),
});
export const telegramUpdateSchema = z.object({
  update_id: z.number().int().safe(),
  message: message.optional(),
  callback_query: z
    .object({
      id: z.string(),
      from: user,
      message: message.optional(),
      data: z.string().max(64).optional(),
    })
    .optional(),
});
export type BotUpdate = z.infer<typeof telegramUpdateSchema>;
type Button = { text: string; callback_data?: string; url?: string };
const keyboard = (rows: Button[][]) => ({ inline_keyboard: rows });
const label = (m: Manager) =>
  `${m.name}${m.username ? " (@" + m.username + ")" : ""} · ID ${m.user_id}`;
export function canManage(actor: string, owner: string) {
  return !!owner && actor === owner;
}
export async function handleBotUpdate(
  update: BotUpdate,
  deps: {
    store: ManagerStore;
    call: TelegramCall;
    ownerId: string;
    botUsername: string;
  },
) {
  const { store, call, ownerId, botUsername } = deps;
  const cb = update.callback_query,
    msg = cb?.message || update.message,
    person = cb?.from || msg?.from;
  if (
    !msg ||
    !person ||
    person.is_bot ||
    msg.chat.type !== "private" ||
    msg.chat.id !== person.id
  )
    return;
  const id = String(person.id),
    owner = canManage(id, ownerId);
  const send = (chat: string, text: string, buttons?: Button[][]) =>
    call("sendMessage", {
      chat_id: chat,
      text,
      link_preview_options: { is_disabled: true },
      ...(buttons ? { reply_markup: keyboard(buttons) } : {}),
    });
  if (cb)
    await call("answerCallbackQuery", { callback_query_id: cb.id }).catch(
      () => {},
    );
  const p = await store.profile(
    {
      user_id: id,
      chat_id: id,
      name: [person.first_name, person.last_name].filter(Boolean).join(" "),
      username: person.username || null,
    },
    owner,
  );
  const action =
    cb?.data || msg.text?.trim().split(/\s+/)[0].split("@")[0] || "";
  const menu: Button[][] = owner
    ? [
        [
          { text: "Менеджеры", callback_data: "managers" },
          { text: "Добавить менеджера", callback_data: "invite" },
        ],
        [{ text: "Тест уведомления", callback_data: "test" }],
      ]
    : p.status === "active"
      ? [[{ text: "Тест уведомления", callback_data: "test" }]]
      : [[{ text: "Запросить доступ", callback_data: "request" }]];
  if (action === "request") {
    if (owner || p.status === "active") {
      await send(id, "Вы уже получаете уведомления о новых заявках.", menu);
      return;
    }
    if (p.status === "pending") {
      await send(
        id,
        "Запрос уже отправлен главному менеджеру. Ожидайте подтверждения.",
      );
      return;
    }
    if (!(await store.request(id))) {
      await send(id, "Повторный запрос можно отправить через 5 минут.");
      return;
    }
    try {
      await send(
        ownerId,
        `Новый запрос на доступ к заявкам VELA\n${label(p)}\n\nДобавляйте только знакомого вам сотрудника. После подтверждения он будет получать контакты клиентов и файлы новых заявок.`,
        [
          [
            { text: "Добавить", callback_data: "approve:" + id },
            { text: "Отклонить", callback_data: "reject:" + id },
          ],
        ],
      );
    } catch (e) {
      await store.change(id, "pending", "guest", ownerId);
      throw e;
    }
    await send(
      id,
      "Запрос отправлен главному менеджеру. После подтверждения здесь будут появляться новые заявки.",
    );
    return;
  }
  const restricted =
    ["/managers", "managers", "/add", "invite"].includes(action) ||
    /^(approve|reject|remove|confirm_remove):/.test(action);
  if (restricted && !owner) {
    await send(
      id,
      "Управление менеджерами доступно только главному менеджеру.",
    );
    return;
  }
  if (action === "/add" || action === "invite") {
    await send(
      id,
      `Отправьте сотруднику ссылку:\nhttps://t.me/${botUsername}\n\nЕму нужно нажать «Старт», затем «Запросить доступ». Здесь появится запрос с именем и ID — подтвердите его кнопкой «Добавить».`,
      menu,
    );
    return;
  }
  if (action === "/managers" || action === "managers") {
    const rows = await store.list();
    await send(
      id,
      `Главный менеджер: ${label(p)}\nАктивных получателей: ${new Set([ownerId, ...rows.filter((x) => x.status === "active").map((x) => x.user_id)]).size}.\n\nТолько вы можете добавлять и отключать менеджеров.`,
      menu,
    );
    for (const m of rows.filter((x) => x.user_id !== ownerId))
      await send(
        id,
        `${m.status === "pending" ? "Ожидает подтверждения" : "Получает уведомления"}\n${label(m)}`,
        m.status === "pending"
          ? [
              [
                { text: "Добавить", callback_data: "approve:" + m.user_id },
                { text: "Отклонить", callback_data: "reject:" + m.user_id },
              ],
            ]
          : [
              [
                {
                  text: "Отключить уведомления",
                  callback_data: "remove:" + m.user_id,
                },
              ],
            ],
      );
    return;
  }
  if (/^(approve|reject|remove|confirm_remove):\d+$/.test(action)) {
    const [verb, target] = action.split(":");
    if (target === ownerId) {
      await send(id, "Главного менеджера нельзя отключить через бота.");
      return;
    }
    const m = await store.get(target);
    if (!m) {
      await send(id, "Запрос не найден. Откройте /managers.");
      return;
    }
    if (verb === "remove") {
      await send(id, `Отключить уведомления для ${label(m)}?`, [
        [
          { text: "Да, отключить", callback_data: "confirm_remove:" + target },
          { text: "Отмена", callback_data: "managers" },
        ],
      ]);
      return;
    }
    const next =
      verb === "approve"
        ? "active"
        : verb === "reject"
          ? "rejected"
          : "disabled";
    if (
      !(await store.change(
        target,
        verb === "confirm_remove" ? "active" : "pending",
        next,
        ownerId,
      ))
    ) {
      await send(
        id,
        "Этот запрос уже обработан или статус изменился. Откройте /managers.",
      );
      return;
    }
    const delivered = await send(
      target,
      next === "active"
        ? "Главный менеджер добавил вас в VELA. Теперь вы получаете все новые заявки с сайта. Управление другими менеджерами доступно только владельцу."
        : next === "rejected"
          ? "Главный менеджер отклонил запрос на доступ."
          : "Главный менеджер отключил вам уведомления о заявках.",
    ).then(
      () => true,
      () => false,
    );
    await send(
      id,
      `${next === "active" ? "Менеджер добавлен" : next === "rejected" ? "Запрос отклонён" : "Уведомления отключены"}: ${label(m)}.${delivered ? "" : " Личное уведомление не доставлено — возможно, пользователь заблокировал бота."}`,
      menu,
    );
    return;
  }
  if (action === "/test" || action === "test") {
    if (!owner && p.status !== "active") {
      await send(
        id,
        "Сначала запросите доступ и дождитесь подтверждения.",
        menu,
      );
      return;
    }
    await send(
      id,
      "VELA · тестовое уведомление\nДоставка в ваш чат работает. Это проверка связи, заявка на сайте не создавалась.",
      menu,
    );
    return;
  }
  await send(
    id,
    owner
      ? "Вы — главный менеджер VELA. Вы получаете новые заявки и управляете доступом команды."
      : p.status === "active"
        ? "Вы — менеджер VELA. Здесь будут появляться все новые заявки с сайта."
        : p.status === "pending"
          ? "Ваш запрос ожидает подтверждения главного менеджера."
          : "VELA · уведомления о заявках. Чтобы получать контакты клиентов и файлы проектов, запросите доступ у главного менеджера.",
    menu,
  );
}
