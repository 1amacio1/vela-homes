"use client";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { track, startMetrika } from "@/lib/tracking";
export function Header({ solid = false }: { solid?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <header className={"header " + (solid ? "solid" : "")}>
      <a className="logo" href="/" aria-label="VELA — главная">
        V<span>ELA</span>
        <i>АРХИТЕКТУРА ЖИЗНИ</i>
      </a>
      <nav
        className={open ? "mobile-open" : ""}
        aria-label="Основная навигация"
      >
        {[
          ["/projects", "Проекты"],
          ["/#services", "Услуги"],
          ["/#about", "О компании"],
          ["/#calculator", "Стоимость"],
          ["/#reviews", "Отзывы"],
          ["/#contact", "Контакты"],
        ].map(([href, title]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>
            {title}
          </a>
        ))}
      </nav>
      <a
        className="header-cta"
        href="/#contact"
        onClick={() => track("cta_click", "Обсудить проект")}
      >
        Обсудить проект ↗
      </a>
      <button
        className="menu-toggle"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Закрыть меню" : "Открыть меню"}
        aria-expanded={open}
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <a className="logo" href="/">
        V<span>ELA</span>
        <i>АРХИТЕКТУРА ЖИЗНИ</i>
      </a>
      <p>
        Дома для вашей жизни.
        <br />
        <span>С 2005 года. По всей России.</span>
      </p>
      <div>
        <a href="/privacy">Политика конфиденциальности</a>
        <a href="/credits">О демонстрационном проекте</a>
        <span>© VELA, {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
export function Analytics() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const value = localStorage.getItem("vela_analytics");
    setShow(!value);
    if (value === "yes") {
      startMetrika();
      track("page_view");
    }
  }, []);
  function choose(value: string) {
    localStorage.setItem("vela_analytics", value);
    setShow(false);
    if (value === "yes") {
      startMetrika();
      track("page_view");
    }
  }
  return show ? (
    <aside className="cookie">
      <p>
        Разрешите аналитику, чтобы помочь нам улучшать сайт.{" "}
        <a href="/privacy">Подробнее</a>
      </p>
      <div>
        <button onClick={() => choose("no")}>Только необходимые</button>
        <button className="button small" onClick={() => choose("yes")}>
          Разрешить
        </button>
      </div>
    </aside>
  ) : null;
}
