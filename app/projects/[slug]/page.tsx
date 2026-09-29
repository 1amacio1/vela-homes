import { DirectionIcon } from "@/components/DirectionIcon";
import { notFound } from "next/navigation";
import { Header, Footer, Analytics } from "@/components/Chrome";
import { ProjectCard } from "@/components/Projects";
import Gallery from "@/components/Gallery";
import { projects, photo, gallery } from "@/lib/content";
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const item = projects.find((p) => p.slug === slug);
  return { title: item ? `${item.name} · ${item.area} м² — VELA` : "Проект не найден" };
}
const done = [
  "Строительство дома",
  "Внутренняя отделка",
  "Инженерные системы",
  "Дизайн интерьера",
  "Благоустройство",
  "Ландшафт",
];
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projects.find((p) => p.slug === slug);
  if (!p) notFound();
  const index = projects.indexOf(p);
  const next = projects[(index + 1) % projects.length];
  return (
    <>
      <Header />
      <main className="project-page" id="top">
        <section className="cover">
          <div className="cover-media" data-parallax="0.08">
            <img src={photo(p.image)} alt={"Дом «" + p.name + "»"} fetchPriority="high" decoding="async" />
          </div>
          <div className="cover-shade" />
          <div className="cover-top" data-hero-anim>
            <a className="back-link" href="/projects">
              <DirectionIcon direction="left" size={16} /> Все проекты
            </a>
            <span>
              {String(index + 1).padStart(2, "0")} / {projects.length}
            </span>
          </div>
          <div className="cover-bottom">
            <p className="label" data-hero-anim style={{ "--i": 0 } as React.CSSProperties}>
              {p.tag} · {p.location}
            </p>
            <h1 data-hero-anim style={{ "--i": 1 } as React.CSSProperties}>
              {p.name}
            </h1>
          </div>
        </section>
        <section className="specs">
          <p className="specs-desc">{p.description}</p>
          <dl>
            <div>
              <dt>Площадь</dt>
              <dd>{p.area} м²</dd>
            </div>
            <div>
              <dt>Этажей</dt>
              <dd>{p.floors}</dd>
            </div>
            <div>
              <dt>Материал</dt>
              <dd>{p.material}</dd>
            </div>
            <div>
              <dt>Характер</dt>
              <dd>{p.tag}</dd>
            </div>
          </dl>
          <a className="button" href="/#contact">
            Хочу похожий дом <DirectionIcon />
          </a>
        </section>
        <section className="section project-body">
          <div className="done" data-reveal>
            <span className="label">В этом проекте выполнено</span>
            <ul>
              {done.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <Gallery images={gallery(index)} />
          <p className="demo-note">
            Демонстрационная концепция. Фотографии в галерее — подборка референсов разных объектов,
            показывающая возможные решения.
          </p>
        </section>
        <section className="section cta-band" data-reveal>
          <h2>Близко по духу?</h2>
          <a className="button large" href="/#calculator">
            Рассчитать свой дом <DirectionIcon />
          </a>
        </section>
        <a className="next-project" href={"/projects/" + next.slug} data-reveal>
          <div className="next-media" data-parallax="0.06">
            <img src={photo(next.image)} alt="" loading="lazy" decoding="async" />
          </div>
          <div className="next-copy">
            <span className="label">Следующий проект</span>
            <strong>{next.name}</strong>
            <span>
              {next.area} м² · {next.location} <DirectionIcon />
            </span>
          </div>
        </a>
        <section className="section related">
          <header className="sec-head" data-reveal>
            <span className="sec-no">Ещё</span>
            <div>
              <h2>Другие истории</h2>
            </div>
          </header>
          <div className="catalog-grid">
            {[projects[(index + 2) % 12], projects[(index + 3) % 12], projects[(index + 4) % 12]].map((p, i) => (
              <ProjectCard key={p.slug} project={p} index={i} variant={i === 1 ? "tall" : "wide"} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <Analytics />
    </>
  );
}
