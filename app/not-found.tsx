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
          <em>ничего не построено.</em>
        </h1>
        <a className="button" href="/">
          На главную ↗
        </a>
      </main>
      <Footer />
    </>
  );
}
