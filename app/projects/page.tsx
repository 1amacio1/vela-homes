import { DirectionIcon } from "@/components/DirectionIcon";
import { Header, Footer, Analytics } from "@/components/Chrome";
import { Catalog } from "@/components/Projects";
import { projects } from "@/lib/content";
export const metadata = { title: "Проекты домов — VELA" };
export default function Page() {
  return (
    <>
      <Header solid />
      <main className="inner-page" id="top">
        <section className="section page-head">
          <header className="sec-head" data-reveal>
            <span className="sec-no">Портфолио</span>
            <div>
              <h1>{projects.length} домов. Один подход к качеству.</h1>
              <p className="lead">
                Современные дома, продуманные интерьеры и жизнь на открытом воздухе. Разные
                материалы, регионы и площади.
              </p>
            </div>
          </header>
          <Catalog />
          <p className="demo-note">
            Демонстрационный каталог. Названия, регионы и характеристики придуманы. Фотографии —
            архитектурные референсы, не реальные объекты VELA.
          </p>
        </section>
        <section className="section cta-band" data-reveal>
          <h2>Спроектируем дом под ваш образ жизни</h2>
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
