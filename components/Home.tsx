"use client";
import { DirectionIcon } from "@/components/DirectionIcon";
import { useState } from "react";

import { Header, Footer, Analytics } from "./Chrome";
import { ProjectCard } from "./Projects";
import Calculator from "./Calculator";
import LeadForm from "./LeadForm";
import { projects, photo, reviews } from "@/lib/content";
import { defaultCalculation, type Calculation } from "@/lib/calculator";
import { track } from "@/lib/tracking";
const offerings = [
  {
    title: "Строительство домов",
    sub: "От фундамента до готового дома",
    image: 7598378,
    text: "Газобетон, кирпич, керамические блоки, дерево и каркас. Подбираем технологию под ваш проект и бюджет.",
  },
  {
    title: "Архитектура и проектирование",
    sub: "Дом, который начинается с вас",
    image: 8134820,
    text: "Создадим индивидуальный проект или построим по вашему. Работаем вместе с вашим архитектором.",
  },
  {
    title: "Отделка и интерьер",
    sub: "Пространство для вашей жизни",
    image: 12998902,
    text: "От планировки и выбора материалов до финишной отделки. Воплотим проект нашего или вашего дизайнера.",
  },
  {
    title: "Инженерные системы",
    sub: "Комфорт, который не на виду",
    image: 7546713,
    text: "Отопление, вентиляция, электрика, водоснабжение и канализация. Единая система для комфортной жизни.",
  },
  {
    title: "Благоустройство",
    sub: "Дом продолжается за его стенами",
    image: 5563466,
    text: "Ландшафт, газон, деревья, дорожки и освещение. Террасы и беседки для жизни на открытом воздухе.",
  },
];
export default function Home() {
  const [calc, setCalc] = useState<Calculation>(defaultCalculation);
  const [attached, setAttached] = useState<Calculation | null>(null);
  const [review, setReview] = useState(0);
  const [service, setService] = useState<number | null>(null);
  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="eyebrow">С 2005 ГОДА · ПО ВСЕЙ РОССИИ</p>
            <h1>
              Место, где
              <br />
              начинается <span className="title-accent">ваша жизнь.</span>
            </h1>
            <p className="hero-sub">
              VELA. Строительство домов по всей России.
              <br />
              От первого эскиза до ключей в ваших руках.
            </p>
            <div className="hero-actions">
              <a
                className="button"
                href="#calculator"
                onClick={() => track("cta_click", "Рассчитать стоимость")}
              >
                Рассчитать стоимость <DirectionIcon />
              </a>
              <a
                className="text-link"
                href="#projects"
                onClick={() => track("cta_click", "Смотреть проекты")}
              >
                Смотреть проекты <DirectionIcon size={18} />
              </a>
            </div>
          </div>
          <div className="hero-bottom">
            <span>VELA / СТРОИТЕЛЬСТВО ЧАСТНЫХ ДОМОВ</span>
            <span>
              АРХИТЕКТУРА &nbsp; · &nbsp; ИНТЕРЬЕР &nbsp; · &nbsp; ЛАНДШАФТ
            </span>
            <a href="#projects">
              ЛИСТАЙТЕ ВНИЗ <DirectionIcon direction="down" />
            </a>
          </div>
          <a className="hero-project" href="/projects/gorizont">
            Горизонт{" "}
            <span>
              280 м² / Смотреть проект <DirectionIcon />
            </span>
          </a>
        </section>
        <section className="section" id="projects">
          <div className="section-top">
            <p className="eyebrow">01 / ПРОЕКТЫ</p>
            <span className="meta">РАЗНЫЕ ДОМА. ОДИН ПОДХОД К КАЧЕСТВУ.</span>
          </div>
          <div className="section-heading">
            <h2>
              Архитектура.
              <br />
              <span className="title-accent">С характером.</span>
            </h2>
            <div>
              <p>
                У каждого дома — своя история.
                <br />
                Следующая может стать вашей.
              </p>
              <a className="text-link" href="/projects">
                Все проекты{" "}
                <span>
                  12 <DirectionIcon />
                </span>
              </a>
            </div>
          </div>
          <div className="project-grid home-grid">
            {projects.slice(0, 4).map((p, i) => (
              <ProjectCard key={p.slug} project={p} index={i} />
            ))}
          </div>
          <p className="demo-note">
            Демонстрационное портфолио. Проекты и характеристики вымышлены;
            фотографии показывают архитектурные референсы.
          </p>
        </section>
        <section className="section services-section" id="services">
          <div className="section-top">
            <p className="eyebrow">02 / ЧТО МЫ ДЕЛАЕМ</p>
            <span className="meta">ОДНА КОМАНДА. ВЕСЬ ПУТЬ.</span>
          </div>
          <div className="section-heading">
            <h2>
              От идеи
              <br />
              <span className="title-accent">до ощущения дома.</span>
            </h2>
            <p>
              Берём на себя весь процесс
              <br />
              или подключаемся на нужном этапе.
            </p>
          </div>
          <div className="service-grid">
            {offerings.map((s, i) => (
              <button
                className={"service-card service-" + i}
                key={s.title}
                onClick={() => {
                  setService(service === i ? null : i);
                  track("cta_click", s.title);
                }}
                aria-expanded={service === i}
              >
                <img src={photo(s.image)} loading="lazy" alt={s.title} />
                <div className="service-overlay" />
                <span className="service-number">0{i + 1}</span>
                <div className="service-body">
                  <span>{s.sub}</span>
                  <h3>{s.title}</h3>
                  {service === i && <p>{s.text}</p>}
                </div>
                <DirectionIcon className="service-arrow" size={25} />
              </button>
            ))}
          </div>
          <div className="service-detail">
            <p>
              {service !== null
                ? offerings[service].text
                : "Ваш проект, ваш архитектор или наша команда — найдём удобный формат сотрудничества."}
            </p>
            <a
              className="text-link"
              href="#contact"
              onClick={() => track("cta_click", "Обсудить услуги")}
            >
              Обсудить задачу <DirectionIcon />
            </a>
          </div>
        </section>
        <section className="section about-section" id="about">
          <div className="about-photo">
            <img
              src={photo(7166931)}
              loading="lazy"
              alt="Светлый интерьер с натуральными материалами"
            />
            <span>ПРОДУМАНО ДО ПОСЛЕДНЕЙ ДЕТАЛИ</span>
          </div>
          <div className="about-copy">
            <p className="eyebrow">03 / О КОМПАНИИ</p>
            <h2>
              Строим так,
              <br />
              как строили бы{" "}
              <br />
              <span className="title-accent">для себя.</span>
            </h2>
            <p>
              Дом — это большое решение. Мы делаем путь к нему понятным:
              слушаем, обсуждаем варианты и объясняем, из чего складывается
              результат.
            </p>
            <p>
              С 2005 года VELA занимается частными домами по всей России.
              Проектируем, строим, создаём интерьеры и обустраиваем участки.
              Можно прийти с идеей, готовым проектом или своим специалистом.
            </p>
            <div className="about-facts">
              <div>
                <strong>2005</strong>
                <span>год начала нашей истории</span>
              </div>
              <div>
                <strong>Вся Россия</strong>
                <span>география строительства</span>
              </div>
            </div>
            <div className="approach">
              <p>
                <span>01</span>Смета и этапы — до начала работ
              </p>
              <p>
                <span>02</span>Контроль качества и связь с командой
              </p>
              <p>
                <span>03</span>Гарантийные обязательства — в договоре
              </p>
            </div>
          </div>
        </section>
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
        <section className="section reviews-section" id="reviews">
          <div className="section-top">
            <p className="eyebrow">05 / ИСТОРИИ КЛИЕНТОВ</p>
            <span className="meta">ДЕМОНСТРАЦИОННЫЕ ОТЗЫВЫ</span>
          </div>
          <div className="review-layout">
            <div>
              <h2>
                Главное —<br />
                <span className="title-accent">что остаётся после.</span>
              </h2>
              <div className="review-controls">
                <button
                  aria-label="Предыдущий отзыв"
                  onClick={() => setReview((review + 5) % 6)}
                >
                  <DirectionIcon direction="left" size={20} />
                </button>
                <span>0{review + 1} / 06</span>
                <button
                  aria-label="Следующий отзыв"
                  onClick={() => setReview((review + 1) % 6)}
                >
                  <DirectionIcon direction="right" size={20} />
                </button>
              </div>
            </div>
            <div className="review" aria-live="polite">
              <span className="quote-mark">“</span>
              <blockquote>{reviews[review].text}</blockquote>
              <div className="review-person">
                <span className="avatar">{reviews[review].name[0]}</span>
                <div>
                  <strong>{reviews[review].name}</strong>
                  <a href={"/projects/" + reviews[review].slug}>
                    Дом «{reviews[review].project}» <DirectionIcon />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="section contact-section" id="contact">
          <div className="section-top">
            <p className="eyebrow">06 / ДАВАЙТЕ ЗНАКОМИТЬСЯ</p>
            <span className="meta">У КАЖДОГО ДОМА ЕСТЬ НАЧАЛО</span>
          </div>
          <div className="contact-grid">
            <div className="contact-copy">
              <h2>
                Расскажите
                <br />
                <span className="title-accent">о вашем доме.</span>
              </h2>
              <p>
                Даже если пока есть только идея.
                <br />
                Поможем сделать следующий шаг.
              </p>
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
                <span>МОСКВА</span>
                <p>ул. Волхонка, 15</p>
                <a
                  href="https://yandex.ru/maps/?text=Москва%2C%20Волхонка%2C%2015"
                  target="_blank"
                  rel="noreferrer"
                >
                  Открыть маршрут <DirectionIcon />
                </a>
              </div>
              <iframe
                className="map"
                title="Карта: Москва, Волхонка, 15"
                loading="lazy"
                src="https://yandex.ru/map-widget/v1/?ll=37.6051%2C55.7446&z=16&pt=37.6051%2C55.7446%2Cpm2rdm"
              />
            </div>
            <LeadForm
              calculation={attached}
              clearCalculation={() => setAttached(null)}
              initialService={
                service !== null ? offerings[service].title : undefined
              }
            />
          </div>
        </section>
      </main>
      <Footer />
      <Analytics />
    </>
  );
}
