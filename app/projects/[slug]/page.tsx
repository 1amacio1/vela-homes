import { DirectionIcon } from "@/components/DirectionIcon";
import { notFound } from "next/navigation";
import { Header, Footer, Analytics } from "@/components/Chrome";
import { ProjectCard } from "@/components/Projects";
import Gallery from "@/components/Gallery";
import { projects, photo, gallery } from "@/lib/content";
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const item = projects.find((p) => p.slug === slug);
  return {
    title: item ? `${item.name} · ${item.area} м² — VELA` : "Проект не найден",
  };
}
const done = [
  "Строительство дома",
  "Внутренняя отделка",
  "Инженерные системы",
  "Дизайн интерьера",
  "Благоустройство",
  "Ландшафт",
];
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = projects.find((p) => p.slug === slug);
  if (!p) notFound();
  const index = projects.indexOf(p);
  const number = String(index + 1).padStart(2, "0");
  return (
    <>
      <Header />
      <main className="project-page">
        <section className="project-cover">
          <img
            src={photo(p.image)}
            alt={"Дом «" + p.name + "»"}
            fetchPriority="high"
            decoding="async"
          />
          <div className="project-cover-shade" />
          <div className="project-cover-inner">
            <a className="back-link" href="/projects">
              <DirectionIcon direction="left" size={16} /> Все проекты
            </a>
            <div className="project-cover-title">
              <p className="eyebrow light">
                Проект {number} · {p.location}
              </p>
              <h1>{p.name}</h1>
              <p className="project-desc">{p.description}</p>
            </div>
          </div>
        </section>
        <section className="project-specs">
          <div>
            <strong>{p.area} м²</strong>
            <span>площадь дома</span>
          </div>
          <div>
            <strong>{p.floors}</strong>
            <span>{p.floors === 1 ? "этаж" : "этажа"}</span>
          </div>
          <div>
            <strong>{p.material}</strong>
            <span>технология строительства</span>
          </div>
          <div>
            <strong>{p.tag}</strong>
            <span>характер дома</span>
          </div>
          <a className="button" href="/#contact">
            Хочу похожий дом <DirectionIcon />
          </a>
        </section>
        <section className="section project-body">
          <aside className="project-done" data-reveal>
            <div className="section-index">
              <span>В этом проекте</span>
              <i />
              <span>выполнено</span>
            </div>
            <ul>
              {done.map((s, i) => (
                <li key={s}>
                  <span>0{i + 1}</span>
                  {s}
                </li>
              ))}
            </ul>
            <p className="helper">
              Полный цикл: от проекта и строительства до интерьера и участка.
              Любой из этапов можно заказать отдельно.
            </p>
          </aside>
          <div className="project-gallery">
            <h2 data-reveal>
              Продуман <em>целиком.</em>
            </h2>
            <Gallery images={gallery(index)} />
            <p className="demo-note">
              Демонстрационная концепция. Фотографии в галерее — подборка
              референсов разных объектов, показывающая возможные решения.
            </p>
          </div>
        </section>
        <section className="section cta-band" data-reveal>
          <h2>
            Близко <em>по духу?</em>
          </h2>
          <a className="button large" href="/#calculator">
            Рассчитать свой дом <DirectionIcon />
          </a>
        </section>
        <section className="section related">
          <div className="section-head" data-reveal>
            <div className="section-index">
              <span>Далее</span>
              <i />
              <span>Другие истории</span>
            </div>
          </div>
          <div className="related-grid">
            {[projects[(index + 1) % 12], projects[(index + 2) % 12]].map(
              (p, i) => (
                <ProjectCard key={p.slug} project={p} index={i} />
              ),
            )}
          </div>
        </section>
      </main>
      <Footer />
      <Analytics />
    </>
  );
}
