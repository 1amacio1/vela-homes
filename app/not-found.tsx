import { DirectionIcon } from "@/components/DirectionIcon";
import { Header, Footer } from "@/components/Chrome";
export default function NotFound() {
  return (
    <>
      <Header solid />
      <main className="inner-page section legal" id="top">
        <span className="sec-no">404 · Страница не найдена</span>
        <h1>
          Здесь пока
                    ничего не построено.
        </h1>
        <a className="button" href="/">
          На главную <DirectionIcon />
        </a>
      </main>
      <Footer />
    </>
  );
}
