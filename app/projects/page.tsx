import { DirectionIcon } from "@/components/DirectionIcon";
import { Header, Footer, Analytics } from "@/components/Chrome";
import { Catalog } from "@/components/Projects";
import { projects } from "@/lib/content";
export const metadata = { title: "Проекты домов — VELA" };
export default function Page() {
  return (
    <>
      <Header solid />
      <main className="inner-page">
        <section className="section page-head">
          <div className="section-index" data-reveal>
            <span>Портфолио</span>
            <i />
            <span>{projects.length} историй</span>
          </div>
          <div className="page-head-row" data-reveal>
            <h1>
              Найдите
              <br />
              <em>свой характер.</em>
            </h1>
            <p className="lead">
              Современные дома, продуманные интерьеры и жизнь на открытом
              воздухе. Разные материалы, регионы и площади — один подход к
              качеству.
            </p>
          </div>
          <Catalog />
          <p className="demo-note">
            Демонстрационный каталог. Названия, регионы и характеристики
            придуманы. Фотографии — архитектурные референсы, не реальные
            объекты VELA.
          </p>
        </section>
        <section className="section cta-band" data-reveal>
          <h2>
            Спроектируем дом
            <br />
            <em>под ваш образ жизни.</em>
          </h2>
          <a className="button large" href="/#contact">
            Обсудить индивидуальный проект <DirectionIcon />
          </a>
        </section>
      </main>
      <Footer />
      <Analytics />
    </>
  );
}
