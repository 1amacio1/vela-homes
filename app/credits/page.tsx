import { DirectionIcon } from "@/components/DirectionIcon";
import { Header, Footer } from "@/components/Chrome";
import credits from "@/PHOTO_CREDITS.json";
export const metadata = { title: "О демонстрационном проекте — VELA" };
export default function Page() {
  return (
    <>
      <Header solid />
      <main className="section legal">
        <p className="eyebrow">VELA / ДЕМОНСТРАЦИОННЫЙ ПРОЕКТ</p>
        <h1>
          Архитектура
          <br />
          <span className="title-accent">вдохновения.</span>
        </h1>
        <p>
          Сайт демонстрирует работу строительной компании по заданному сценарию.
          Названия проектов, регионы, характеристики, отзывы и имена клиентов
          вымышлены. Телефон и email тестовые. Фотографии представляют
          архитектурные референсы; они не подтверждают выполнение этих работ
          компанией VELA.
        </p>
        <p>
          Фотографии в галерее одного проекта могут относиться к разным зданиям.
          Их объединяет предлагаемое направление архитектуры, интерьера и
          благоустройства.
        </p>
        <h2>Фотографии</h2>
        <p>
          Изображения предоставлены авторами на Pexels и используются по{" "}
          <a
            href="https://www.pexels.com/license/"
            target="_blank"
            rel="noreferrer"
          >
            лицензии Pexels
          </a>
          . Авторы не связаны с VELA и не выступают её партнёрами.
        </p>
        <ul>
          {credits.map((p) => (
            <li key={p.id}>
              <a href={p.source} target="_blank" rel="noreferrer">
                {p.author} — фотография {p.id}
              </a>
            </li>
          ))}
        </ul>
        <h2>Стоимость</h2>
        <p>
          Все цены предварительные и заданы для демонстрации калькулятора.
          Окончательная цена зависит от проекта, материалов, региона и участка.
          Работы без заданных ставок вынесены на индивидуальный расчёт.
        </p>
        <a className="text-link" href="/">
          <DirectionIcon direction="left" /> Вернуться на сайт
        </a>
      </main>
      <Footer />
    </>
  );
}
