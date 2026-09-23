import { DirectionIcon } from "@/components/DirectionIcon";
import { Header, Footer, Analytics } from "@/components/Chrome";
import { Catalog } from "@/components/Projects";
export const metadata = { title: "Проекты домов — VELA" };
export default function Page() {
  return (
    <>
      <Header solid />
      <main className="inner-page section">
        <p className="eyebrow">ПОРТФОЛИО / 12 ИСТОРИЙ</p>
        <div className="section-heading">
          <h1>
            Найдите <span className="title-accent">свой характер.</span>
          </h1>
          <p>
            Современные дома, продуманные интерьеры
            <br />и жизнь на открытом воздухе.
          </p>
        </div>
        <Catalog />
        <p className="demo-note">
          Демонстрационный каталог. Названия, регионы и характеристики
          придуманы. Фотографии — архитектурные референсы, не реальные объекты
          VELA.
        </p>
        <div className="catalog-end">
          <h2>
            Спроектируем дом
            <br />
            <span className="title-accent">под ваш образ жизни.</span>
          </h2>
          <a className="button" href="/#contact">
            Обсудить индивидуальный проект <DirectionIcon />
          </a>
        </div>
      </main>
      <Footer />
      <Analytics />
    </>
  );
}
