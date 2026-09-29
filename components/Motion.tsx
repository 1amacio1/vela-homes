"use client";
import { useEffect } from "react";

/**
 * Плавное появление блоков при прокрутке.
 * Любой элемент с атрибутом data-reveal получает класс is-in,
 * когда попадает в область видимости. Работает и для контента,
 * который появляется позже (фильтры каталога, смена отзыва).
 */
export function Reveal() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const all = () =>
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)");
    if (reduce.matches || !("IntersectionObserver" in window)) {
      all().forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const watch = () => all().forEach((el) => io.observe(el));
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}
