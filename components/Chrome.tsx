"use client";
import { DirectionIcon } from "@/components/DirectionIcon";
import { Logo } from "@/components/Logo";
import { useEffect, useState } from "react";
import { track, startMetrika } from "@/lib/tracking";

const links = [
  ["/projects", "Проекты"],
  ["/#services", "Услуги"],
  ["/#about", "О компании"],
  ["/#calculator", "Стоимость"],
  ["/#reviews", "Отзывы"],
  ["/#contact", "Контакты"],
] as const;

export function Header({ solid = false }: { solid?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);
  return (
    <>
      <header
        className={
          "header" +
          (solid ? " solid" : "") +
          (scrolled ? " scrolled" : "") +
          (open ? " open" : "")
        }
      >
        <div className="header-inner">
          <Logo compact />
          <nav className="header-nav" aria-label="Основная навигация">
            {links.map(([href, title]) => (
              <a key={href} href={href}>
                {title}
              </a>
            ))}
          </nav>
          <div className="header-side">
            <a
              className="header-phone"
              href="tel:+74950000005"
              onClick={() => track("phone_click")}
            >
              +7 495 000-00-05
            </a>
            <a
              className="header-cta"
              href="/#contact"
              onClick={() => track("cta_click", "Обсудить проект")}
            >
              Обсудить проект
            </a>
            <button
              className="menu-toggle"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
      <div
        id="mobile-menu"
        className={"menu" + (open ? " is-open" : "")}
        aria-hidden={!open}
      >
        <nav aria-label="Мобильная навигация">
          {links.map(([href, title], i) => (
            <a
              key={href}
              href={href}
              style={{ "--i": i } as React.CSSProperties}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
            >
              <small>0{i + 1}</small>
              {title}
            </a>
          ))}
        </nav>
        <div className="menu-foot">
          <a href="tel:+74950000005" onClick={() => track("phone_click")} tabIndex={open ? 0 : -1}>
            +7 (495) 000-00-05
          </a>
          <a href="mailto:hello@vela.example" onClick={() => track("email_click")} tabIndex={open ? 0 : -1}>
            hello@vela.example
          </a>
          <span>Москва, ул. Волхонка, 15</span>
        </div>
      </div>
    </>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Logo />
          <p>Строительство домов по всей России с 2005 года.</p>
        </div>
        <nav className="footer-nav" aria-label="Разделы сайта">
          {links.map(([href, title]) => (
            <a key={href} href={href}>
              {title}
            </a>
          ))}
        </nav>
        <div className="footer-contact">
          <a href="tel:+74950000005" onClick={() => track("phone_click")}>
            +7 (495) 000-00-05
          </a>
          <a href="mailto:hello@vela.example" onClick={() => track("email_click")}>
            hello@vela.example
          </a>
          <span>Москва, ул. Волхонка, 15</span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© VELA, 2005–{new Date().getFullYear()}</span>
        <a href="/privacy">Политика конфиденциальности</a>
        <a href="/credits">О демонстрационном проекте</a>
        <a href="#top" className="footer-up" aria-label="Наверх">
          Наверх <DirectionIcon direction="up" size={14} />
        </a>
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
    <aside className="cookie" role="dialog" aria-label="Аналитика">
      <p>
        Разрешите аналитику, чтобы помочь нам улучшать сайт.{" "}
        <a href="/privacy">Подробнее</a>
      </p>
      <div>
        <button className="text-button" onClick={() => choose("no")}>
          Только необходимые
        </button>
        <button className="button small" onClick={() => choose("yes")}>
          Разрешить
        </button>
      </div>
    </aside>
  ) : null;
}
