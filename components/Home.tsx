"use client";
import { DirectionIcon } from "@/components/DirectionIcon";
import { useEffect, useState } from "react";

import { Header, Footer, Analytics } from "./Chrome";
import { ProjectCard } from "./Projects";
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
      <Header />
      <main>
        <Hero />
        <Showcase />
        <Services active={service} onSelect={setService} />
        <About />
        <Calculator
          value={calc}
          onChange={(c) => {
            setCalc(c);
            if (attached) setAttached(c);
          }}
          onApply={() => {
            setAttached({ ...calc });
            document
              .getElementById("contact")
              ?.scrollIntoView({ behavior: "smooth" });
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

function Hero() {
  const featured = projects[0];
  return (
    <section className="hero" aria-label="VELA — строительство домов">
      <div className="hero-media">
        <img
          src={photo(pictures.hero)}
          alt="Современный дом с панорамным остеклением в сумерках"
          fetchPriority="high"
          decoding="async"
        />
      </div>
      <div className="hero-shade" />
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="eyebrow light" style={{ "--i": 0 } as React.CSSProperties}>
            Строительство домов по всей России · с 2005 года
          </p>
          <h1 style={{ "--i": 1 } as React.CSSProperties}>
            Место, где
            <br />
            начинается <em>ваша жизнь</em>
          </h1>
          <p className="hero-sub" style={{ "--i": 2 } as React.CSSProperties}>
            VELA. Строительство домов по всей России —
            <br />
            от первого эскиза до ключей в ваших руках.
          </p>
          <div className="hero-actions" style={{ "--i": 3 } as React.CSSProperties}>
            <a
              className="button"
              href="#calculator"
              onClick={() => track("cta_click", "Рассчитать стоимость")}
            >
              Рассчитать стоимость
            </a>
            <a
              className="text-link"
              href="#projects"
              onClick={() => track("cta_click", "Смотреть проекты")}
            >
              Смотреть проекты <DirectionIcon />
            </a>
          </div>
        </div>
        <a
          className="hero-featured"
          href={"/projects/" + featured.slug}
          onClick={() => track("project_view", featured.name)}
          style={{ "--i": 4 } as React.CSSProperties}
        >
          <span className="hero-featured-label">На фото</span>
          <span className="hero-featured-name">
            {featured.name}
            <DirectionIcon size={16} />
          </span>
          <span className="hero-featured-meta">
            {featured.area} м² · {featured.location}
          </span>
        </a>
      </div>
      <div className="hero-foot">
        <span>Архитектура</span>
        <span>Строительство</span>
        <span>Интерьер</span>
        <span>Ландшафт</span>
        <a href="#projects" className="hero-scroll" aria-label="Листайте вниз">
          <i />
        </a>
      </div>
    </section>
  );
}

function Showcase() {
  const featured = projects.slice(0, 4);
  return (
    <section className="section showcase" id="projects">
      <div className="section-head" data-reveal>
        <div className="section-index">
          <span>01</span>
          <i />
          <span>Проекты</span>
        </div>
        <h2>
          Разные дома.
          <br />
          <em>Один подход к качеству.</em>
        </h2>
        <p className="lead">
          У каждого дома — своя история и свой характер.
          <br />
          Следующая может стать вашей.
        </p>
      </div>
      <div className="showcase-grid">
        {featured.map((p, i) => (
          <ProjectCard
            key={p.slug}
            project={p}
            index={i}
            variant={i === 1 || i === 2 ? "tall" : "wide"}
          />
        ))}
      </div>
      <div className="showcase-more" data-reveal>
        <a
          className="button ghost large"
          href="/projects"
          onClick={() => track("cta_click", "Все проекты")}
        >
          Все 12 проектов <DirectionIcon />
        </a>
        <p className="demo-note">
          Демонстрационное портфолио: проекты и характеристики вымышлены,
          фотографии показывают архитектурные референсы.
        </p>
      </div>
    </section>
  );
}

function Services({
  active,
  onSelect,
}: {
  active: number | null;
  onSelect: (i: number | null) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? active ?? 0;
  return (
    <section className="section services" id="services">
      <div className="section-head" data-reveal>
        <div className="section-index">
          <span>02</span>
          <i />
          <span>Услуги</span>
        </div>
        <h2>
          От идеи
          <br />
          <em>до ощущения дома.</em>
        </h2>
        <p className="lead">
          Пять направлений одной команды. Берём на себя весь процесс
          или подключаемся на нужном этапе — полный комплекс или отдельные
          работы.
        </p>
      </div>
      <div className="services-layout">
        <div className="services-stage" aria-hidden="true" data-reveal>
          {offerings.map((s, i) => (
            <img
              key={s.title}
              src={photo(s.image)}
              alt=""
              loading="lazy"
              decoding="async"
              className={shown === i ? "is-shown" : ""}
            />
          ))}
          <span className="services-stage-index">
            0{shown + 1} <i>/ 05</i>
          </span>
          <span className="services-stage-title">{offerings[shown].sub}</span>
        </div>
        <ol className="services-list">
          {offerings.map((s, i) => (
            <li
              key={s.title}
              className={active === i ? "is-active" : ""}
              data-reveal
              style={{ "--i": i } as React.CSSProperties}
            >
              <button
                type="button"
                aria-expanded={active === i}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                onClick={() => {
                  onSelect(active === i ? null : i);
                  track("cta_click", s.title);
                }}
              >
                <span className="service-no">0{i + 1}</span>
                <span className="service-name">
                  <h3>{s.title}</h3>
                  <small>{s.sub}</small>
                </span>
                <span className="service-plus" />
              </button>
              <div className="service-body">
                <div>
                  <img
                    src={photo(s.image)}
                    alt={s.title}
                    loading="lazy"
                    decoding="async"
                  />
                  <p>{s.text}</p>
                  <a
                    className="text-link"
                    href="#contact"
                    onClick={() => track("cta_click", "Обсудить услуги")}
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

function About() {
  return (
    <section className="section about" id="about">
      <div className="about-grid">
        <div className="about-copy" data-reveal>
          <div className="section-index">
            <span>03</span>
            <i />
            <span>О компании</span>
          </div>
          <h2>
            Строим так,
            <br />
            как строили бы <em>для себя.</em>
          </h2>
          <p className="lead">
            Дом — это большое решение. Мы делаем путь к нему понятным:
            слушаем, обсуждаем варианты и объясняем, из чего складывается
            результат.
          </p>
          <p>
            С 2005 года VELA занимается частными домами по всей России.
            Проектируем, строим, создаём интерьеры и обустраиваем участки.
            Работаем с газобетоном, кирпичом, керамическими блоками, деревом
            и каркасными технологиями. Можно прийти с идеей, готовым проектом
            или своим архитектором — либо доверить весь процесс нам.
          </p>
          <dl className="about-facts">
            <div>
              <dt>2005</dt>
              <dd>год начала нашей истории</dd>
            </div>
            <div>
              <dt>Вся Россия</dt>
              <dd>география строительства</dd>
            </div>
            <div>
              <dt>Полный цикл</dt>
              <dd>проект, стройка, интерьер, участок</dd>
            </div>
          </dl>
        </div>
        <div className="about-media" data-reveal>
          <figure className="about-main">
            <img
              src={photo(pictures.aboutMain)}
              alt="Дом с тёплым светом в окнах вечером"
              loading="lazy"
              decoding="async"
            />
            <figcaption>Продумано до последней детали</figcaption>
          </figure>
          <figure className="about-small">
            <img
              src={photo(pictures.aboutSmall)}
              alt="Внутренний двор с водой и озеленением"
              loading="lazy"
              decoding="async"
            />
          </figure>
        </div>
      </div>
      <ol className="approach">
        {[
          ["Смета и этапы — до начала работ", "Прозрачный бюджет и понятный календарь: вы знаете, что и когда происходит."],
          ["Контроль качества и связь с командой", "Технадзор на каждом этапе и один ответственный человек на связи."],
          ["Гарантийные обязательства — в договоре", "Фиксируем сроки, стоимость и гарантию письменно."],
        ].map(([title, text], i) => (
          <li key={title} data-reveal style={{ "--i": i } as React.CSSProperties}>
            <span>0{i + 1}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ol>
      <div className="photo-band" aria-label="Детали реализованных объектов">
        {pictures.band.map((p, i) => (
          <figure key={p.id} data-reveal style={{ "--i": i } as React.CSSProperties}>
            <img src={photo(p.id)} alt={p.label} loading="lazy" decoding="async" />
            <figcaption>{p.label}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

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
      <div className="section-head" data-reveal>
        <div className="section-index">
          <span>05</span>
          <i />
          <span>Отзывы</span>
        </div>
        <h2>
          Главное —<br />
          <em>что остаётся после.</em>
        </h2>
      </div>
      <div className="reviews-layout">
        <a
          className="review-photo"
          href={"/projects/" + r.slug}
          aria-label={"Проект «" + r.project + "»"}
          data-reveal
        >
          <img key={r.slug} src={photo(project.image)} alt="" loading="lazy" decoding="async" />
          <span>
            Дом «{r.project}» · {project.area} м²
          </span>
        </a>
        <div className="review" aria-live="polite" data-reveal>
          <blockquote key={index}>
            <p>{r.text}</p>
            <footer>
              <strong>{r.name}</strong>
              <a href={"/projects/" + r.slug}>
                Дом «{r.project}» <DirectionIcon size={14} />
              </a>
            </footer>
          </blockquote>
          <div className="review-controls">
            <button
              aria-label="Предыдущий отзыв"
              onClick={() => setIndex((index + reviews.length - 1) % reviews.length)}
            >
              <DirectionIcon direction="left" size={18} />
            </button>
            <span className="review-count">
              0{index + 1} <i>/ 0{reviews.length}</i>
            </span>
            <button
              aria-label="Следующий отзыв"
              onClick={() => setIndex((index + 1) % reviews.length)}
            >
              <DirectionIcon direction="right" size={18} />
            </button>
            <div className="review-dots" role="tablist" aria-label="Отзывы">
              {reviews.map((x, i) => (
                <button
                  key={x.name}
                  role="tab"
                  aria-selected={i === index}
                  aria-label={"Отзыв " + (i + 1)}
                  className={i === index ? "is-active" : ""}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          </div>
          <p className="demo-note">Демонстрационные отзывы.</p>
        </div>
      </div>
    </section>
  );
}

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
      <div className="section-head" data-reveal>
        <div className="section-index">
          <span>06</span>
          <i />
          <span>Контакты</span>
        </div>
        <h2>
          Расскажите
          <br />
          <em>о вашем доме.</em>
        </h2>
        <p className="lead">
          Даже если пока есть только идея. Поможем сделать следующий шаг.
        </p>
      </div>
      <div className="contact-grid">
        <div className="contact-side" data-reveal>
          <a
            className="contact-phone"
            href="tel:+74950000005"
            onClick={() => track("phone_click")}
          >
            +7 (495) 000-00-05
          </a>
          <a
            className="contact-email"
            href="mailto:hello@vela.example"
            onClick={() => track("email_click")}
          >
            hello@vela.example <DirectionIcon />
          </a>
          <p className="helper">Телефон и email — демонстрационные.</p>
          <div className="address">
            <span className="label">Офис</span>
            <p>Москва, ул. Волхонка, 15</p>
            <a
              href="https://yandex.ru/maps/?text=Москва%2C%20Волхонка%2C%2015"
              target="_blank"
              rel="noreferrer"
            >
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
          <LeadForm
            calculation={attached}
            clearCalculation={clearAttached}
            initialService={service}
          />
        </div>
      </div>
    </section>
  );
}
