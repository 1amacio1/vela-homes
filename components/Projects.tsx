"use client";
import { DirectionIcon } from "@/components/DirectionIcon";
import { useState } from "react";
import { projects, photo, Project } from "@/lib/content";
import { track } from "@/lib/tracking";
export function ProjectCard({
  project,
  index = 0,
}: {
  project: Project;
  index?: number;
}) {
  return (
    <a
      className="project-card"
      href={"/projects/" + project.slug}
      onClick={() => track("project_view", project.name)}
    >
      <div className="project-photo">
        <img
          src={photo(project.image)}
          alt={"Дом «" + project.name + "» — архитектурная концепция"}
          loading="lazy"
        />
        <span className="project-label">{project.tag}</span>
        <span className="circle-arrow">
          <DirectionIcon />
        </span>
      </div>
      <div className="project-title">
        <h3>{project.name}</h3>
        <span>{project.area} м²</span>
      </div>
      <div className="project-meta">
        <span>{project.location}</span>
        <span>
          {project.floors} {project.floors === 1 ? "этаж" : "этажа"} ·{" "}
          {project.material}
        </span>
      </div>
    </a>
  );
}
export function Catalog() {
  const [filter, setFilter] = useState("Все проекты");
  const filtered = projects.filter(
    (p) => filter === "Все проекты" || p.tag === filter,
  );
  return (
    <>
      <div className="catalog-filters" aria-label="Фильтр проектов">
        {["Все проекты", "Современный", "Одноэтажный", "Семейный"].map((f) => (
          <button
            key={f}
            className={filter === f ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {f}
            {f === "Все проекты" && <sup>12</sup>}
          </button>
        ))}
        <span>{filtered.length} проектов</span>
      </div>
      <div className="project-grid">
        {filtered.map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={i} />
        ))}
      </div>
    </>
  );
}
