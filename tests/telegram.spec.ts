import { test, expect } from "@playwright/test";
import { handleBotUpdate, type BotUpdate } from "../lib/telegram-bot";
import type { Manager, ManagerStore } from "../lib/telegram-managers";
const owner = "111",
  staff = "222",
  outsider = "333";
function fixture() {
  const people = new Map<string, Manager>();
  const sent: { method: string; body: Record<string, unknown> }[] = [];
  const store: ManagerStore = {
    async profile(p, isOwner) {
      const m = {
        ...p,
        status: isOwner
          ? ("active" as const)
          : people.get(p.user_id)?.status || ("guest" as const),
      };
      people.set(p.user_id, m);
      return m;
    },
    async get(id) {
      return people.get(id) || null;
    },
    async list() {
      return [...people.values()].filter(
        (p) => p.status === "active" || p.status === "pending",
      );
    },
    async request(id) {
      const p = people.get(id)!;
      if (["active", "pending"].includes(p.status)) return false;
      p.status = "pending";
      return true;
    },
    async change(id, from, to, ownerId) {
      const p = people.get(id);
      if (!p || id === ownerId || p.status !== from) return false;
      p.status = to;
      return true;
    },
  };
  const deps = {
    store,
    ownerId: owner,
    botUsername: "vela_test_bot",
    call: async (method: string, body: Record<string, unknown>) => {
      sent.push({ method, body });
      return { message_id: sent.length };
    },
  };
  let seq = 1;
  const update = (id: string, action: string, callback = false): BotUpdate => {
    const from = { id: Number(id), first_name: "Test " + id };
    const msg = {
      message_id: seq,
      from,
      chat: { id: Number(id), type: "private" },
      text: action,
    };
    return callback
      ? {
          update_id: seq++,
          callback_query: { id: String(seq), from, message: msg, data: action },
        }
      : { update_id: seq++, message: msg };
  };
  return {
    people,
    sent,
    deps,
    update,
    run: async (id: string, action: string, callback = false) =>
      handleBotUpdate(update(id, action, callback), deps),
  };
}
test("a public /start never grants access; request awaits owner approval", async () => {
  const f = fixture();
  await f.run(staff, "/start");
  expect(f.people.get(staff)?.status).toBe("guest");
  await f.run(staff, "request", true);
  expect(f.people.get(staff)?.status).toBe("pending");
  expect(
    f.sent.some(
      (x) =>
        x.body.chat_id === owner &&
        String(x.body.text).includes("Новый запрос"),
    ),
  ).toBeTruthy();
  await f.run(owner, "approve:" + staff, true);
  expect(f.people.get(staff)?.status).toBe("active");
  await f.run(staff, "/start");
  expect(f.people.get(staff)?.status).toBe("active");
});
test("outsiders and regular managers cannot approve or list other managers", async () => {
  const f = fixture();
  await f.run(staff, "request", true);
  await f.run(outsider, "approve:" + staff, true);
  expect(f.people.get(staff)?.status).toBe("pending");
  await f.run(owner, "approve:" + staff, true);
  await f.run(outsider, "request", true);
  await f.run(staff, "approve:" + outsider, true);
  expect(f.people.get(outsider)?.status).toBe("pending");
  await f.run(staff, "/managers");
  expect(String(f.sent.at(-1)?.body.text)).toContain("только главному");
});
test("removal requires owner confirmation and stale approval cannot restore access", async () => {
  const f = fixture();
  await f.run(staff, "request", true);
  await f.run(owner, "approve:" + staff, true);
  await f.run(owner, "remove:" + staff, true);
  expect(f.people.get(staff)?.status).toBe("active");
  await f.run(owner, "confirm_remove:" + staff, true);
  expect(f.people.get(staff)?.status).toBe("disabled");
  await f.run(owner, "approve:" + staff, true);
  expect(f.people.get(staff)?.status).toBe("disabled");
  await f.run(staff, "/start");
  expect(f.people.get(staff)?.status).toBe("disabled");
});
test("owner cannot be removed; group updates cannot impersonate owner", async () => {
  const f = fixture();
  await f.run(owner, "/start");
  await f.run(owner, "confirm_remove:" + owner, true);
  expect(f.people.get(owner)?.status).toBe("active");
  const u = f.update(owner, "/managers");
  u.message!.chat = { id: -999, type: "group" };
  const before = f.sent.length;
  await handleBotUpdate(u, f.deps);
  expect(f.sent.length).toBe(before);
});
test("duplicate pending requests do not repeatedly notify owner", async () => {
  const f = fixture();
  await f.run(staff, "request", true);
  await f.run(staff, "request", true);
  expect(f.sent.filter((x) => x.body.chat_id === owner)).toHaveLength(1);
});
test("test notification is restricted to approved recipients", async () => {
  const f = fixture();
  await f.run(staff, "/test");
  expect(String(f.sent.at(-1)?.body.text)).toContain("Сначала запросите");
  await f.run(staff, "request", true);
  await f.run(owner, "approve:" + staff, true);
  await f.run(staff, "/test");
  expect(String(f.sent.at(-1)?.body.text)).toContain("тестовое уведомление");
});
