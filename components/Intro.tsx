"use client";
import { useEffect, useState } from "react";

const KEY = "vela_intro";
/* Выполняется до отрисовки: если заставку уже видели в этой сессии,
   помечаем документ, чтобы оверлей не мигал. */
const boot = `try{if(sessionStorage.getItem("${KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("intro-skip")}else{document.documentElement.classList.add("intro")}}catch(e){}`;

/**
 * Заставка при первом входе: монограмма прорисовывается штрихом,
 * буквы слетаются в слово VELA, проходит блик, затем тёмная шторка
 * уходит вверх и открывает главную страницу.
 */
export function Intro() {
  const [phase, setPhase] = useState<"play" | "out" | "done">("play");
  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains("intro-skip")) {
      setPhase("done");
      return;
    }
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
    const out = setTimeout(() => {
      setPhase("out");
      root.classList.add("intro-done");
    }, 2150);
    const done = setTimeout(() => setPhase("done"), 3100);
    return () => {
      clearTimeout(out);
      clearTimeout(done);
    };
  }, []);
  useEffect(() => {
    if (phase === "done") {
      document.documentElement.classList.remove("intro");
      document.documentElement.classList.add("intro-done");
    }
  }, [phase]);
  if (phase === "done") return null;
  return (
    <div
      className={"intro" + (phase === "out" ? " is-out" : "")}
      aria-hidden="true"
      onClick={() => {
        if (phase === "play") {
          setPhase("out");
          document.documentElement.classList.add("intro-done");
          setTimeout(() => setPhase("done"), 900);
        }
      }}
    >
      <script dangerouslySetInnerHTML={{ __html: boot }} />
      <div className="intro-inner">
        <svg
          className="intro-mark"
          viewBox="0 0 40 40"
          fill="none"
          width="72"
          height="72"
        >
          <path
            d="M4 9 L20 33 L36 9"
            pathLength={1}
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="miter"
            strokeLinecap="square"
          />
          <path
            d="M13 9 L20 19.5 L27 9"
            pathLength={1}
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M3 36.5 H37"
            pathLength={1}
            stroke="var(--accent)"
            strokeWidth="1.2"
          />
        </svg>
        <div className="intro-word">
          {["V", "E", "L", "A"].map((ch, i) => (
            <span key={ch} style={{ "--i": i } as React.CSSProperties}>
              {ch}
            </span>
          ))}
        </div>
        <p className="intro-tag">Строительство домов · с 2005</p>
      </div>
      <div className="intro-line" />
    </div>
  );
}
