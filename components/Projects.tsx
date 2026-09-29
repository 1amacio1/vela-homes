"use client";
import { DirectionIcon } from "@/components/DirectionIcon";
import { useState } from "react";
import { projects, photo, Project } from "@/lib/content";
import { track } from "@/lib/tracking";

/** Строка портфолио: фото и компактные характеристики, чередование сторон. */
export function ProjectRow({ project, index = 0 }: { project: Project; index?: number }) {
  return (
    <a
      className={"project-card row" + (index % 2 ? " flip" : "")}
      href={"/projects/" + project.slug}
      onClick={() => track("project_view", project.name)}
      data-reveal
    >
      <div className="row-media" data-parallax="0.05">
        <img
          src={photo(project.image)}
          alt={"Дом «" + project.name + "» — архитектурная концепция"}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="row-copy">
        <span className="label">
          {String(projects.indexOf(project) + 1).padStart(2, "0")} · {project.tag}
        </span>
        <h3>{project.name}</h3>
        <p>{project.description}</p>
        <dl>
          <div>
            <dt>Площадь</dt>
            <dd>{project.area} м²</dd>
          </div>
          <div>
            <dt>Этажей</dt>
            <dd>{project.floors}</dd>
          </div>
          <div>
            <dt>Материал</dt>
            <dd>{project.material}</dd>
          </div>
          <div>
            <dt>Регион</dt>
            <dd>{project.location}</dd>
          </div>
        </dl>
        <span className="text-link">
          Смотреть проект <DirectionIcon />
        </span>
      </div>
    </a>
  );
}

/** Компактная карточка для сетки каталога и «других историй». */
export function ProjectCard({
  project,
  index = 0,
  variant = "wide",
}: {
  project: Project;
  index?: number;
  variant?: "wide" | "tall";
}) {
  return (
    <a
      className={"project-card tile " + variant}
      href={"/projects/" + project.slug}
      onClick={() => track("project_view", project.name)}
      data-reveal
      style={{ "--i": index % 3 } as React.CSSProperties}
    >
      <div className="tile-media">
        <img
          src={photo(project.image)}
          alt={"Дом «" + project.name + "» — архитектурная концепция"}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="tile-caption">
        <span className="tile-index">{String(projects.indexOf(project) + 1).padStart(2, "0")}</span>
        <h3>{project.name}</h3>
        <span className="tile-meta">
          {project.area} м² · {project.floors} {project.floors === 1 ? "этаж" : "этажа"} · {project.material}
        </span>
        <span className="tile-place">{project.location}</span>
      </div>
    </a>
  );
}

const filters = ["Все проекты", "Современный", "Одноэтажный", "Семейный"];

export function Catalog() {
  const [filter, setFilter] = useState("Все проекты");
  const filtered = projects.filter((p) => filter === "Все проекты" || p.tag === filter);
  return (
    <>
      <div className="catalog-bar" role="group" aria-label="Фильтр проектов">
        <div className="catalog-filters">
          {filters.map((f) => {
            const count = f === "Все проекты" ? projects.length : projects.filter((p) => p.tag === f).length;
            return (
              <button
                key={f}
                className={filter === f ? "active" : ""}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                {f}
                <sup aria-hidden="true">{count}</sup>
              </button>
            );
          })}
        </div>
        <span className="catalog-count">
          {filtered.length} {filtered.length === 1 ? "проект" : filtered.length < 5 ? "проекта" : "проектов"}
        </span>
      </div>
      <div className="catalog-grid" key={filter}>
        {filtered.map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={i} variant={i % 3 === 1 ? "tall" : "wide"} />
        ))}
      </div>
    </>
  );
}
