import type { SupabaseClient } from "@supabase/supabase-js";
export type ManagerStatus =
  "guest" | "pending" | "active" | "disabled" | "rejected";
export type Manager = {
  user_id: string;
  chat_id: string;
  name: string;
  username: string | null;
  status: ManagerStatus;
  requested_at?: string | null;
};
export interface ManagerStore {
  profile(p: Omit<Manager, "status">, owner: boolean): Promise<Manager>;
  get(id: string): Promise<Manager | null>;
  list(): Promise<Manager[]>;
  request(id: string): Promise<boolean>;
  change(
    id: string,
    from: ManagerStatus,
    to: ManagerStatus,
    owner: string,
  ): Promise<boolean>;
}
function checked<T>({ data, error }: { data: T; error: unknown }): T {
  if (error) throw new Error("Telegram database operation failed");
  return data;
}
export function managerStore(d: SupabaseClient): ManagerStore {
  return {
    async profile(p, owner) {
      checked(
        await d
          .from("vela_telegram_managers")
          .upsert(
            { ...p, status: owner ? "active" : "guest" },
            { onConflict: "user_id", ignoreDuplicates: true },
          ),
      );
      return checked(
        await d
          .from("vela_telegram_managers")
          .update({
            ...p,
            ...(owner ? { status: "active" } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", p.user_id)
          .select()
          .single(),
      ) as Manager;
    },
    async get(id) {
      return checked(
        await d
          .from("vela_telegram_managers")
          .select("*")
          .eq("user_id", id)
          .maybeSingle(),
      ) as Manager | null;
    },
    async list() {
      return checked(
        await d
          .from("vela_telegram_managers")
          .select("*")
          .in("status", ["active", "pending"])
          .order("created_at"),
      ) as Manager[];
    },
    async request(id) {
      const data = checked(
        await d
          .from("vela_telegram_managers")
          .update({
            status: "pending",
            requested_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", id)
          .in("status", ["guest", "disabled", "rejected"])
          .or(
            `requested_at.is.null,requested_at.lt.${new Date(Date.now() - 300000).toISOString()}`,
          )
          .select("user_id"),
      );
      return !!data?.length;
    },
    async change(id, from, to, owner) {
      if (id === owner) return false;
      const data = checked(
        await d
          .from("vela_telegram_managers")
          .update({
            status: to,
            approved_by: owner,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", id)
          .eq("status", from)
          .select("user_id"),
      );
      return !!data?.length;
    },
  };
}
