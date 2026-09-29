"use client";
import { DirectionIcon } from "@/components/DirectionIcon";
import { useEffect, useState } from "react";

import { Header, Footer, Analytics } from "./Chrome";
import { Intro } from "./Intro";
import { ProjectRow } from "./Projects";
import Calculator from "./Calculator";
import LeadForm from "./LeadForm";
import { projects, photo, reviews, offerings, pictures } from "@/lib/content";
import { defaultCalculation, type Calculation } from "@/lib/calculator";
import { track } from "@/lib/tracking";

export default function Home() {
  const [calc, setCalc] = useState<Calculation>(defaultCalculation);
  const [attached, setAttached] = useState<Calculation | null>(null);
  const [service, setService] = useState<number | null>(null);
  return (
    <>
      <Intro />
      <Header />
      <main id="top">
        <Hero />
        <Portfolio />
        <Services onChoose={setService} />
        <About />
        <Calculator
          value={calc}
          onChange={(c) => {
            setCalc(c);
            if (attached) setAttached(c);
          }}
          onApply={() => {
            setAttached({ ...calc });
            document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
        <Reviews />
        <Contact
          attached={attached}
          clearAttached={() => setAttached(null)}
          service={service !== null ? offerings[service].title : undefined}
        />
      </main>
      <Footer />
      <Analytics />
    </>
  );
}

/* ---------- 01 · Первый экран: дом, вордмарк, две кнопки ---------- */
function Hero() {
  const featured = projects.find((p) => p.image === pictures.hero) ?? projects[0];
  return (
    <section className="hero" aria-label="VELA — строительство домов">
      <div className="hero-media" data-parallax="0.08">
        <img
          src={photo(pictures.hero)}
          alt="Современный дом с панорамным остеклением в сумерках"
          fetchPriority="high"
          decoding="async"
        />
      </div>
      <div className="hero-shade" />
      <div className="hero-top" data-hero-anim style={{ "--i": 0 } as React.CSSProperties}>
        <span>Частные дома · с 2005 года</span>
        <a href={"/projects/" + featured.slug} onClick={() => track("project_view", featured.name)}>
          На фото — дом «{featured.name}», {featured.area} м² <DirectionIcon size={14} />
        </a>
      </div>
      <div className="hero-bottom">
        <div className="hero-row">
          <h1 data-hero-anim style={{ "--i": 1 } as React.CSSProperties}>
            Строительство домов
            <br />
            по всей России
          </h1>
          <div className="hero-actions" data-hero-anim style={{ "--i": 2 } as React.CSSProperties}>
            <a className="button" href="#calculator" onClick={() => track("cta_click", "Рассчитать стоимость")}>
              Рассчитать стоимость
            </a>
            <a className="button ghost" href="#projects" onClick={() => track("cta_click", "Смотреть проекты")}>
              Смотреть проекты
            </a>
          </div>
        </div>
        <div className="hero-word" aria-hidden="true" data-hero-anim style={{ "--i": 3 } as React.CSSProperties}>
          {["V", "E", "L", "A"].map((c, i) => (
            <span key={c} style={{ "--i": i } as React.CSSProperties}>
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 02 · Проекты: архитектурное портфолио ---------- */
function Portfolio() {
  const lead = projects[0];
  const rows = [projects[1], projects[3], projects[4]];
  return (
    <section className="section portfolio" id="projects">
      <header className="sec-head" data-reveal>
        <span className="sec-no">01</span>
        <div>
          <h2>Разные дома. Один подход к качеству.</h2>
          <p className="lead">
            Газобетон, кирпич, керамика, дерево, каркас. Одноэтажные и семейные, в лесу и у воды —
            у каждого дома свой характер.
          </p>
        </div>
        <a className="text-link" href="/projects" onClick={() => track("cta_click", "Все проекты")}>
          Все 12 проектов <DirectionIcon />
        </a>
      </header>
      <a
        className="feature"
        href={"/projects/" + lead.slug}
        onClick={() => track("project_view", lead.name)}
        data-reveal
      >
        <div className="feature-media" data-parallax="0.06">
          <img src={photo(lead.image)} alt={"Дом «" + lead.name + "»"} loading="lazy" decoding="async" />
        </div>
        <div className="feature-copy">
          <span className="label">{lead.tag} · {lead.location}</span>
          <strong>{lead.name}</strong>
          <span className="feature-desc">{lead.description}</span>
        </div>
        <div className="feature-meta">
          <span>
            <b>{lead.area}</b> м²
          </span>
          <span>
            <b>{lead.floors}</b> этажа
          </span>
          <span>{lead.material}</span>
        </div>
      </a>
      <div className="rows">
        {rows.map((p, i) => (
          <ProjectRow key={p.slug} project={p} index={i} />
        ))}
      </div>
      <div className="portfolio-foot" data-reveal>
        <p className="lead">Ещё восемь домов — в каталоге: одноэтажные, семейные, современные.</p>
        <a className="button ghost large" href="/projects" onClick={() => track("cta_click", "Все проекты")}>
          Смотреть все проекты <DirectionIcon />
        </a>
      </div>
    </section>
  );
}

/* ---------- 03 · Услуги: список поверх меняющегося фото ---------- */
function Services({ onChoose }: { onChoose: (i: number | null) => void }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? open ?? active;
  return (
    <section className="services" id="services">
      <div className="services-bg" aria-hidden="true">
        {offerings.map((s, i) => (
          <img
            key={s.title}
            src={photo(s.image)}
            alt=""
            loading="lazy"
            decoding="async"
            className={(shown === i ? "is-shown" : "") + (hover === i ? " is-zoom" : "")}
          />
        ))}
      </div>
      <div className="section services-inner">
        <header className="sec-head" data-reveal>
          <span className="sec-no">02</span>
          <div>
            <h2>Пять направлений одной команды</h2>
            <p className="lead">
              Полный комплекс или отдельные работы — выбираете вы. Берём весь путь от эскиза до
              ключей или подключаемся на нужном этапе.
            </p>
          </div>
        </header>
        <ol className="service-list">
          {offerings.map((s, i) => (
            <li
              key={s.title}
              className={open === i ? "is-open" : ""}
              data-reveal
              style={{ "--i": i } as React.CSSProperties}
              onMouseEnter={() => {
                setActive(i);
                setHover(i);
              }}
              onMouseLeave={() => setHover(null)}
            >
              <button
                type="button"
                aria-expanded={open === i}
                onFocus={() => setActive(i)}
                onClick={() => {
                  setActive(i);
                  setOpen(open === i ? null : i);
                  track("cta_click", s.title);
                }}
              >
                <span className="service-no">0{i + 1}</span>
                <span className="service-title">{s.title}</span>
                <span className="service-sub">{s.sub}</span>
                <span className="service-plus" aria-hidden="true" />
              </button>
              <div className="service-body">
                <div>
                  <p>{s.text}</p>
                  <a
                    className="text-link"
                    href="#contact"
                    onClick={() => {
                      onChoose(i);
                      track("cta_click", "Обсудить услуги");
                    }}
                  >
                    Обсудить задачу <DirectionIcon />
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- 04 · О компании: заявление, факты, фотополоса, этапы ---------- */
function About() {
  const steps = [
    ["Знакомство", "Слушаем, смотрим участок, обсуждаем бюджет и сроки. Можно прийти с идеей, готовым проектом или своим архитектором."],
    ["Проект и смета", "Архитектура, инженерия, материалы. Смета и календарь работ фиксируются до начала стройки."],
    ["Строительство", "Свои бригады и технадзор на каждом этапе. Один ответственный человек на связи всё время."],
    ["Отделка и участок", "Интерьер, инженерные системы, ландшафт, террасы, освещение. Передаём готовый дом и гарантию по договору."],
  ];
  return (
    <section className="section about" id="about">
      <header className="sec-head" data-reveal>
        <span className="sec-no">03</span>
        <div>
          <h2>Строим так, как строили бы для себя</h2>
        </div>
      </header>
      <div className="about-grid">
        <p className="statement" data-reveal>
          Дом — это большое решение. Мы делаем путь к нему понятным: слушаем, обсуждаем варианты
          и объясняем, из чего складывается результат.
        </p>
        <div className="about-text" data-reveal>
          <p>
            С 2005 года VELA строит частные дома по всей России. Проектируем, строим, создаём
            интерьеры и обустраиваем участки. Работаем с газобетоном, кирпичом, керамическими
            блоками, деревом и каркасными технологиями.
          </p>
          <p>
            Можно прийти со своим архитектором, дизайнером или готовым проектом — либо доверить
            весь процесс нам. Сроки, стоимость и гарантийные обязательства фиксируем в договоре.
          </p>
        </div>
      </div>
      <dl className="facts" data-reveal>
        <div>
          <dt>2005</dt>
          <dd>год начала истории</dd>
        </div>
        <div>
          <dt>Вся Россия</dt>
          <dd>география строительства</dd>
        </div>
        <div>
          <dt>Полный цикл</dt>
          <dd>проект, стройка, интерьер, участок</dd>
        </div>
        <div>
          <dt>5</dt>
          <dd>технологий строительства</dd>
        </div>
      </dl>
      <div className="details">
        <figure className="details-main" data-parallax="0.08" data-reveal>
          <img src={photo(pictures.band)} alt="Терраса дома вечером" loading="lazy" decoding="async" />
        </figure>
        <div className="details-side">
          <figure className="details-small" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
            <img src={photo(pictures.detail)} alt="Фактура камня и дерева в интерьере" loading="lazy" decoding="async" />
          </figure>
          <div className="details-copy" data-reveal style={{ "--i": 2 } as React.CSSProperties}>
            <h3>Продумано до последней детали</h3>
            <p>
              Свет, материалы и пропорции подбираем вместе с вами: от фасада и кровли до фурнитуры,
              освещения участка и высоты ступени на террасе.
            </p>
            <ul>
              <li>Газобетон, кирпич, керамика, дерево, каркас</li>
              <li>Инженерные системы в одном проекте с домом</li>
              <li>Террасы, беседки, газон и освещение участка</li>
            </ul>
          </div>
        </div>
      </div>
      <ol className="steps">
        {steps.map(([title, text], i) => (
          <li key={title} data-reveal style={{ "--i": i } as React.CSSProperties}>
            <span>0{i + 1}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------- 06 · Отзывы ---------- */
function Reviews() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % reviews.length), 9000);
    return () => clearInterval(t);
  }, [paused]);
  const r = reviews[index];
  const project = projects.find((p) => p.slug === r.slug)!;
  return (
    <section
      className="section reviews"
      id="reviews"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <header className="sec-head" data-reveal>
        <span className="sec-no">05</span>
        <div>
          <h2>Главное — что остаётся после</h2>
        </div>
      </header>
      <div className="review-grid">
        <blockquote className="review" key={index} aria-live="polite" data-reveal>
          <p>{r.text}</p>
          <footer>
            <strong>{r.name}</strong>
            <a href={"/projects/" + r.slug}>
              Дом «{r.project}» <DirectionIcon size={14} />
            </a>
          </footer>
        </blockquote>
        <a className="review-photo" href={"/projects/" + r.slug} aria-label={"Проект «" + r.project + "»"} data-reveal>
          <img key={r.slug} src={photo(project.image)} alt="" loading="lazy" decoding="async" />
        </a>
        <div className="review-nav" data-reveal>
          <button aria-label="Предыдущий отзыв" onClick={() => setIndex((index + reviews.length - 1) % reviews.length)}>
            <DirectionIcon direction="left" size={18} />
          </button>
          <span>
            {String(index + 1).padStart(2, "0")} <i>/ {String(reviews.length).padStart(2, "0")}</i>
          </span>
          <button aria-label="Следующий отзыв" onClick={() => setIndex((index + 1) % reviews.length)}>
            <DirectionIcon direction="right" size={18} />
          </button>
          <p className="demo-note">Демонстрационные отзывы.</p>
        </div>
      </div>
    </section>
  );
}

/* ---------- 07 · Контакты и заявка ---------- */
function Contact({
  attached,
  clearAttached,
  service,
}: {
  attached: Calculation | null;
  clearAttached: () => void;
  service?: string;
}) {
  return (
    <section className="section contact" id="contact">
      <header className="sec-head" data-reveal>
        <span className="sec-no">06</span>
        <div>
          <h2>Расскажите о вашем доме</h2>
          <p className="lead">Даже если пока есть только идея. Поможем сделать следующий шаг.</p>
        </div>
      </header>
      <div className="contact-grid">
        <div className="contact-side" data-reveal>
          <a className="contact-phone" href="tel:+74950000005" onClick={() => track("phone_click")}>
            +7 (495) 000-00-05
          </a>
          <a className="contact-email" href="mailto:hello@vela.example" onClick={() => track("email_click")}>
            hello@vela.example <DirectionIcon />
          </a>
          <p className="helper">Телефон и email — демонстрационные.</p>
          <div className="address">
            <span className="label">Офис</span>
            <p>Москва, ул. Волхонка, 15</p>
            <a href="https://yandex.ru/maps/?text=Москва%2C%20Волхонка%2C%2015" target="_blank" rel="noreferrer">
              Открыть маршрут <DirectionIcon size={14} />
            </a>
          </div>
          <div className="map-wrap">
            <iframe
              className="map"
              title="Карта: Москва, Волхонка, 15"
              loading="lazy"
              src="https://yandex.ru/map-widget/v1/?ll=37.6051%2C55.7446&z=16&pt=37.6051%2C55.7446%2Cpm2rdm"
            />
          </div>
        </div>
        <div className="contact-form" data-reveal>
          <LeadForm calculation={attached} clearCalculation={clearAttached} initialService={service} />
        </div>
      </div>
    </section>
  );
}
