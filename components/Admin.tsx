"use client";
import { DirectionIcon } from "@/components/DirectionIcon";
import { useEffect, useState, useCallback } from "react";
import {
  Download,
  LogOut,
  ChartNoAxesCombined,
  Inbox,
  Link as LinkIcon,
  RefreshCw,
  FileText,
  Copy,
} from "lucide-react";
import { calculatorText, type Calculation } from "@/lib/calculator";
type Lead = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string;
  region: string;
  services: string[];
  area: number | null;
  comment: string;
  calculator: Calculation | null;
  files: { name: string; path: string; size: number }[];
  source: string;
  ref_code: string | null;
  utm: Record<string, string>;
  consent_at: string;
  telegram_status: string;
  telegram_error: string | null;
};
type Referral = {
  code: string;
  name: string;
  created_at: string;
  visits: number;
  visitors: number;
  leads: number;
  converted_sessions: number;
};
type Data = {
  leads: Lead[];
  total: number;
  referrals: Referral[];
  telegramConfigured: boolean;
  metrikaConfigured: boolean;
  siteUrl: string;
  analytics: {
    metrics: Record<string, number>;
    sources: {
      name: string;
      visits: number;
      visitors: number;
      leads: number;
    }[];
    weekly: { day: string; visits: number; leads: number }[];
    cohorts: {
      week: string;
      size: number;
      leads: number;
      retention: { week: number; visitors: number }[];
    }[];
  };
};
const periods = [
  ["today", "Сегодня"],
  ["yesterday", "Вчера"],
  ["7d", "Последние 7 дней"],
  ["30d", "Последние 30 дней"],
  ["month", "Текущий месяц"],
  ["year", "Текущий год"],
];
const date = (s: string) =>
  new Date(s).toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
const percent = (n: number, d: number) =>
  d ? ((n / d) * 100).toFixed(1) + "%" : "0%";
const status: Record<string, string> = {
  pending: "Ожидает отправки",
  sending: "Отправляется",
  sent: "Доставлено",
  failed: "Ошибка доставки",
  not_configured: "Ожидает настройки бота",
};
export default function Admin({ authenticated }: { authenticated: boolean }) {
  const [auth, setAuth] = useState(authenticated),
    [tab, setTab] = useState("analytics"),
    [period, setPeriod] = useState("7d"),
    [data, setData] = useState<Data | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [page, setPage] = useState(0),
    [notice, setNotice] = useState(""),
    [retrying, setRetrying] = useState("");
  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`/api/admin/data?period=${period}&page=${page}`);
      if (r.status === 401) {
        setAuth(false);
        return;
      }
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setBusy(false);
    }
  }, [period, page]);
  useEffect(() => {
    if (auth) void load();
  }, [auth, load]);
  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: f.get("email"),
          password: f.get("password"),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setAuth(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка входа");
    } finally {
      setBusy(false);
    }
  }
  async function referral(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const form = e.currentTarget;
    try {
      const r = await fetch("/api/admin/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: new FormData(form).get("name") }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      form.reset();
      setNotice("Ссылка создана");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка создания");
    } finally {
      setBusy(false);
    }
  }
  async function retry(id: string) {
    setRetrying(id);
    try {
      const r = await fetch("/api/admin/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const j = await r.json();
      setNotice(
        j.ok
          ? "Уведомление доставлено"
          : j.status === "not_configured"
            ? "Сначала добавьте токен и ID менеджера в окружение."
            : "Доставка не подтверждена. Проверьте настройки бота.",
      );
      await load();
    } catch {
      setError("Не удалось повторить отправку.");
    } finally {
      setRetrying("");
    }
  }
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice("Ссылка скопирована");
    } catch {
      setNotice("Скопируйте адрес из поля ссылки.");
    }
  }
  if (!auth)
    return (
      <main className="admin-login">
        <a className="logo" href="/">
          V<span>ELA</span>
          <i>АРХИТЕКТУРА ЖИЗНИ</i>
        </a>
        <form onSubmit={login}>
          <p className="eyebrow">ВХОД ДЛЯ КОМАНДЫ</p>
          <h1>
            Всё под
            <br />
            <span className="title-accent">контролем.</span>
          </h1>
          <label>
            Логин
            <input
              type="email"
              name="email"
              autoComplete="username"
              required
              placeholder="admin@vela.example"
            />
          </label>
          <label>
            Пароль
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              maxLength={200}
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="button" disabled={busy}>
            {busy ? "Проверяем…" : "Войти"} <DirectionIcon size={18} />
          </button>
          <a className="back-link" href="/">
            <DirectionIcon direction="left" /> Вернуться на сайт
          </a>
        </form>
        <span className="login-caption">VELA / УПРАВЛЕНИЕ САЙТОМ</span>
      </main>
    );
  const a = data?.analytics,
    m = a?.metrics;
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="logo" href="/">
          V<span>ELA</span>
          <i>УПРАВЛЕНИЕ САЙТОМ</i>
        </a>
        <nav>
          {[
            {
              id: "analytics",
              title: "Обзор и аналитика",
              icon: ChartNoAxesCombined,
            },
            { id: "leads", title: "Заявки", icon: Inbox },
            { id: "referrals", title: "Реферальные ссылки", icon: LinkIcon },
          ].map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? "active" : ""}
              onClick={() => {
                setTab(t.id);
                setNotice("");
              }}
            >
              <t.icon size={18} />
              {t.title}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <a href="/" target="_blank" rel="noreferrer">
            Открыть сайт <DirectionIcon />
          </a>
          <button
            onClick={async () => {
              await fetch("/api/logout", { method: "POST" });
              setAuth(false);
              setData(null);
            }}
          >
            <LogOut size={16} /> Выйти
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-heading">
          <div>
            <p className="eyebrow">
              VELA /{" "}
              {new Date().toLocaleDateString("ru-RU", {
                timeZone: "Europe/Moscow",
              })}
            </p>
            <h1>
              {tab === "analytics"
                ? "Обзор сайта"
                : tab === "leads"
                  ? "Заявки"
                  : "Реферальные ссылки"}
            </h1>
          </div>
          <button
            className="icon-button"
            aria-label="Обновить данные"
            onClick={load}
            disabled={busy}
          >
            <RefreshCw size={18} className={busy ? "spin" : ""} />
          </button>
        </header>
        <div className="admin-toolbar">
          {tab !== "referrals" ? (
            <>
              <label>
                Период
                <select
                  value={period}
                  onChange={(e) => {
                    setPeriod(e.target.value);
                    setPage(0);
                  }}
                >
                  {periods.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <span>Московское время · UTC+3</span>
            </>
          ) : (
            <span>
              За всё время · атрибуция последней реферальной ссылки, 30 дней
            </span>
          )}
          {tab === "leads" && (
            <a className="button small" href="/api/admin/export">
              <Download size={17} />
              Все заявки в Excel
            </a>
          )}
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {notice && (
          <p className="admin-notice" role="status">
            {notice}
            <button
              aria-label="Закрыть сообщение"
              onClick={() => setNotice("")}
            >
              ×
            </button>
          </p>
        )}
        {!data && busy && <div className="admin-empty">Загружаем данные…</div>}
        {tab === "analytics" && a && m && (
          <>
            <div className="metric-grid">
              {[
                ["Посещения", m.visits],
                ["Уникальные посетители", m.visitors],
                ["Заявки", m.leads],
                ["Конверсия сессий", percent(m.converted_sessions, m.visits)],
              ].map(([title, value]) => (
                <div className="metric" key={title}>
                  <span>{title}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <div className="event-metrics">
              {[
                ["Нажатия на телефон", m.phone],
                ["Нажатия на email", m.email],
                ["Ключевые CTA", m.cta],
                ["Изменения расчёта", m.calculator],
              ].map(([title, value]) => (
                <div key={title}>
                  <span>{title}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <section className="admin-panel">
              <div className="panel-heading">
                <h2>Неделя в цифрах</h2>
                <span>
                  <i className="chart-dot" />
                  Посещения <i className="chart-dot leads" />
                  Заявки
                </span>
              </div>
              <div className="bar-chart">
                {a.weekly.map((day) => (
                  <div className="bar-column" key={day.day}>
                    <div className="bar-numbers">
                      {day.visits} / {day.leads}
                    </div>
                    <div className="bars">
                      <div
                        style={{
                          height: Math.max(
                            2,
                            (day.visits /
                              Math.max(
                                1,
                                ...a.weekly.map((d) =>
                                  Math.max(d.visits, d.leads),
                                ),
                              )) *
                              140,
                          ),
                        }}
                      />
                      <div
                        style={{
                          height: Math.max(
                            2,
                            (day.leads /
                              Math.max(
                                1,
                                ...a.weekly.map((d) =>
                                  Math.max(d.visits, d.leads),
                                ),
                              )) *
                              140,
                          ),
                        }}
                      />
                    </div>
                    <span>
                      {new Date(day.day).toLocaleDateString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
              <p className="helper">
                Последние 7 календарных дней, независимо от выбранного периода.
              </p>
            </section>
            <section className="admin-panel">
              <h2>Источники переходов</h2>
              {a.sources.length ? (
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Источник</th>
                        <th>Посещения</th>
                        <th>Посетители</th>
                        <th>Заявки</th>
                      </tr>
                    </thead>
                    <tbody>
                      {a.sources.map((s) => (
                        <tr key={s.name}>
                          <td>{s.name}</td>
                          <td>{s.visits}</td>
                          <td>{s.visitors}</td>
                          <td>{s.leads}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="admin-empty">
                  За этот период пока нет посещений.
                </p>
              )}
            </section>
            <section className="admin-panel">
              <h2>Когортная аналитика</h2>
              <p className="helper">
                Посетители сгруппированы по неделе первого визита. В ячейках —
                доля вернувшихся в соответствующую неделю. Последние 8 недель;
                W0 — первая неделя.
              </p>
              {a.cohorts.length ? (
                <div className="table-scroll">
                  <table className="cohort-table">
                    <thead>
                      <tr>
                        <th>Неделя первого визита</th>
                        <th>Людей</th>
                        <th>Заявки*</th>
                        {[0, 1, 2, 3, 4].map((n) => (
                          <th key={n}>W{n}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {a.cohorts.map((c) => (
                        <tr key={c.week}>
                          <td>
                            {new Date(c.week).toLocaleDateString("ru-RU")}
                          </td>
                          <td>{c.size}</td>
                          <td>{c.leads}</td>
                          {c.retention.map((w) => {
                            const future =
                              new Date(c.week).getTime() +
                                w.week * 7 * 86400000 >
                              Date.now();
                            return (
                              <td
                                key={w.week}
                                style={{
                                  background: future
                                    ? "transparent"
                                    : `rgba(196,165,132,${0.04 + (0.45 * w.visitors) / c.size})`,
                                }}
                              >
                                {future ? "—" : percent(w.visitors, c.size)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="admin-empty">
                  Когорты появятся после первых посещений.
                </p>
              )}
              <p className="helper">
                * Уникальные посетители когорты, отправившие заявку за всё
                время.
              </p>
            </section>
            <section className="admin-panel integrations">
              <div>
                <h3>Telegram</h3>
                <p>
                  {data.telegramConfigured
                    ? "Настроен. Статус доставки показан в каждой заявке."
                    : "Ожидает подключения"}
                </p>
                {!data.telegramConfigured && (
                  <code>TELEGRAM_BOT_TOKEN · TELEGRAM_CHAT_ID</code>
                )}
              </div>
              <div>
                <h3>Яндекс Метрика</h3>
                <p>
                  {data.metrikaConfigured
                    ? "Счётчик подключён после согласия посетителя."
                    : "Ожидает номера счётчика"}
                </p>
                {!data.metrikaConfigured && (
                  <code>NEXT_PUBLIC_YANDEX_METRIKA_ID</code>
                )}
              </div>
            </section>
            <p className="admin-footnote">
              Статистика учитывает посетителей, разрешивших аналитику.
              Авторизованный администратор исключён из счётчиков. Посещение —
              сессия с тайм-аутом 30 минут. Конверсия — доля сессий периода с
              заявкой до конца периода.
            </p>
          </>
        )}
        {tab === "leads" && data && (
          <>
            <div className="panel-heading">
              <span>{data.total} заявок за выбранный период</span>
              <span>
                Страница {page + 1} / {Math.max(1, Math.ceil(data.total / 25))}
              </span>
            </div>
            {data.leads.length === 0 ? (
              <div className="admin-empty">
                <Inbox size={32} />
                <h2>Пока нет заявок</h2>
                <p>Новые обращения с сайта появятся здесь.</p>
                <a
                  className="text-link"
                  href="/#contact"
                  target="_blank"
                  rel="noreferrer"
                >
                  Открыть форму заявки <DirectionIcon />
                </a>
              </div>
            ) : (
              <div className="leads-list">
                {data.leads.map((l) => (
                  <details className="lead-row" key={l.id}>
                    <summary>
                      <span className="lead-date">
                        {date(l.created_at)}
                        <small>#{l.id.slice(0, 8).toUpperCase()}</small>
                      </span>
                      <span>
                        <strong>{l.name}</strong>
                        <small>{l.region}</small>
                      </span>
                      <span>
                        {l.phone}
                        <small>{l.email}</small>
                      </span>
                      <span
                        className={
                          "status " +
                          (l.telegram_status === "sent" ? "sent" : "")
                        }
                      >
                        {status[l.telegram_status] || l.telegram_status}
                      </span>
                      <span>＋</span>
                    </summary>
                    <div className="lead-detail">
                      <div className="lead-data">
                        <div>
                          <span>Услуги</span>
                          <p>{l.services.join(" · ")}</p>
                        </div>
                        <div>
                          <span>Площадь</span>
                          <p>{l.area ? l.area + " м²" : "Не указана"}</p>
                        </div>
                        <div>
                          <span>Комментарий</span>
                          <p>{l.comment || "Нет комментария"}</p>
                        </div>
                        <div>
                          <span>Источник / реферал</span>
                          <p>
                            {l.source}
                            {l.ref_code
                              ? " / " +
                                (data.referrals.find(
                                  (r) => r.code === l.ref_code,
                                )?.name || l.ref_code) +
                                " (" +
                                l.ref_code +
                                ")"
                              : ""}
                          </p>
                        </div>
                        <div>
                          <span>UTM</span>
                          <p>
                            {Object.entries(l.utm || {})
                              .map(([k, v]) => `${k}: ${v}`)
                              .join("\n") || "Нет меток"}
                          </p>
                        </div>
                        <div>
                          <span>Согласие на обработку</span>
                          <p>{date(l.consent_at)}</p>
                        </div>
                      </div>
                      {l.calculator && (
                        <div className="lead-calculation">
                          <span>Параметры калькулятора</span>
                          <pre>{calculatorText(l.calculator)}</pre>
                        </div>
                      )}
                      <div className="lead-files">
                        <span>Файлы: {l.files.length}</span>
                        {l.files.map((f) => (
                          <a
                            key={f.path}
                            href={`/api/admin/file?id=${l.id}&path=${encodeURIComponent(f.path)}`}
                          >
                            <FileText size={16} />
                            {f.name}
                            <small>{Math.ceil(f.size / 1024)} КБ</small>
                            <Download size={15} />
                          </a>
                        ))}
                      </div>
                      {l.telegram_status !== "sent" && (
                        <div className="telegram-retry">
                          <p>
                            {l.telegram_error ||
                              (!data.telegramConfigured
                                ? "Добавьте переменные Telegram и повторите отправку."
                                : "Заявка сохранена. Можно повторить доставку уведомления.")}
                          </p>
                          <button
                            disabled={
                              retrying === l.id ||
                              l.telegram_status === "sending"
                            }
                            className="button small"
                            onClick={() => retry(l.id)}
                          >
                            {retrying === l.id
                              ? "Отправляем…"
                              : "Отправить в Telegram"}
                          </button>
                        </div>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            )}
            <div className="pagination">
              <button disabled={page === 0} onClick={() => setPage(page - 1)}>
                <DirectionIcon direction="left" /> Назад
              </button>
              <button
                disabled={(page + 1) * 25 >= data.total}
                onClick={() => setPage(page + 1)}
              >
                Далее <DirectionIcon direction="right" />
              </button>
            </div>
          </>
        )}
        {tab === "referrals" && data && (
          <>
            <form className="referral-form admin-panel" onSubmit={referral}>
              <div>
                <h2>Новая ссылка</h2>
                <p>
                  Укажите понятное название источника. В адресе будет только
                  короткий код.
                </p>
              </div>
              <label>
                Название / источник
                <input
                  name="name"
                  placeholder="Например, партнёр Архитектура"
                  minLength={2}
                  maxLength={100}
                  required
                />
              </label>
              <button className="button" disabled={busy}>
                Создать ссылку <DirectionIcon size={18} />
              </button>
            </form>
            <div className="admin-panel">
              {data.referrals.length ? (
                <div className="table-scroll">
                  <table className="refs-table">
                    <thead>
                      <tr>
                        <th>Источник / ссылка</th>
                        <th>Создана</th>
                        <th>Переходы</th>
                        <th>Посетители</th>
                        <th>Заявки</th>
                        <th>Конверсия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.referrals.map((r) => (
                        <tr key={r.code}>
                          <td>
                            <strong>{r.name}</strong>
                            <div className="ref-url">
                              <input
                                aria-label={"Ссылка " + r.name}
                                readOnly
                                value={`${data.siteUrl}/r/${r.code}`}
                              />
                              <button
                                title="Скопировать"
                                aria-label={"Скопировать " + r.name}
                                onClick={() =>
                                  copy(`${data.siteUrl}/r/${r.code}`)
                                }
                              >
                                <Copy size={16} />
                              </button>
                            </div>
                          </td>
                          <td>{date(r.created_at)}</td>
                          <td>{r.visits}</td>
                          <td>{r.visitors}</td>
                          <td>{r.leads}</td>
                          <td>{percent(r.converted_sessions, r.visits)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="admin-empty">
                  Создайте первую ссылку для партнёра или рекламной площадки.
                </p>
              )}
              <p className="helper">
                Переходы — сессии с реферальным кодом при включённой аналитике.
                Заявки сохраняют реферальную информацию даже без согласия на
                аналитику. Конверсия — доля отслеживаемых сессий с заявкой.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
