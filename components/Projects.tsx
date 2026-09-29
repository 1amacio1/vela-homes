"use client";
import { DirectionIcon } from "@/components/DirectionIcon";
import { useState } from "react";
import { projects, photo, Project } from "@/lib/content";
import { track } from "@/lib/tracking";

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
      className={"project-card " + variant}
      href={"/projects/" + project.slug}
      onClick={() => track("project_view", project.name)}
      data-reveal
      style={{ "--i": index % 4 } as React.CSSProperties}
    >
      <div className="project-photo">
        <img
          src={photo(project.image)}
          alt={"Дом «" + project.name + "» — архитектурная концепция"}
          loading="lazy"
          decoding="async"
        />
        <span className="project-tag">{project.tag}</span>
        <span className="project-area">
          {project.area}
          <small>м²</small>
        </span>
        <span className="circle-arrow">
          <DirectionIcon />
        </span>
      </div>
      <div className="project-caption">
        <h3>{project.name}</h3>
        <p>
          {project.location} · {project.floors}{" "}
          {project.floors === 1 ? "этаж" : "этажа"} · {project.material}
        </p>
      </div>
    </a>
  );
}

const filters = ["Все проекты", "Современный", "Одноэтажный", "Семейный"];

export function Catalog() {
  const [filter, setFilter] = useState("Все проекты");
  const filtered = projects.filter(
    (p) => filter === "Все проекты" || p.tag === filter,
  );
  return (
    <>
      <div className="catalog-filters" role="group" aria-label="Фильтр проектов">
        {filters.map((f) => {
          const count =
            f === "Все проекты"
              ? projects.length
              : projects.filter((p) => p.tag === f).length;
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
      <div className="catalog-grid" key={filter}>
        {filtered.map((p, i) => (
          <ProjectCard
            key={p.slug}
            project={p}
            index={i}
            variant={i % 4 === 1 || i % 4 === 2 ? "tall" : "wide"}
          />
        ))}
      </div>
    </>
  );
}
