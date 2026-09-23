import { DirectionIcon } from "@/components/DirectionIcon";
import { Header, Footer } from "@/components/Chrome";
export default function NotFound() {
  return (
    <>
      <Header solid />
      <main className="section legal">
        <p className="eyebrow">404 / СТРАНИЦА НЕ НАЙДЕНА</p>
        <h1>
          Здесь пока
          <br />
          <span className="title-accent">ничего не построено.</span>
        </h1>
        <a className="button" href="/">
          На главную <DirectionIcon />
        </a>
      </main>
      <Footer />
    </>
  );
}
