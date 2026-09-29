import { DirectionIcon } from "@/components/DirectionIcon";
import { Header, Footer } from "@/components/Chrome";
export default function NotFound() {
  return (
    <>
      <Header solid />
      <main className="inner-page section legal">
        <div className="section-index">
          <span>404</span>
          <i />
          <span>Страница не найдена</span>
        </div>
        <h1>
          Здесь пока
          <br />
          <em>ничего не построено.</em>
        </h1>
        <a className="button" href="/">
          На главную <DirectionIcon />
        </a>
      </main>
      <Footer />
    </>
  );
}
