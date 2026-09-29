"use client";
import { useEffect } from "react";

/**
 * Движение на странице.
 * 1. data-reveal — плавное появление при попадании в область видимости.
 * 2. data-parallax — деликатный параллакс изображения внутри контейнера
 *    (смещение по вертикали, считается в requestAnimationFrame).
 * Оба отключаются при prefers-reduced-motion.
 */
export function Motion() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealAll = () =>
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)");
    if (reduce || !("IntersectionObserver" in window)) {
      revealAll().forEach((el) => el.classList.add("is-in"));
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
      { rootMargin: "0px 0px -10% 0px", threshold: 0.06 },
    );
    const watch = () => revealAll().forEach((el) => io.observe(el));
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(document.body, { childList: true, subtree: true });

    /* Параллакс */
    let items: { el: HTMLElement; img: HTMLElement; speed: number }[] = [];
    const collect = () => {
      items = Array.from(
        document.querySelectorAll<HTMLElement>("[data-parallax]"),
      )
        .map((el) => ({
          el,
          img: el.querySelector<HTMLElement>("img, .parallax-layer")!,
          speed: Number(el.dataset.parallax || 0.12),
        }))
        .filter((x) => x.img);
    };
    let ticking = false;
    const frame = () => {
      ticking = false;
      const vh = window.innerHeight;
      /* Страховка для reveal: всё, что уже в кадре, показываем. */
      for (const el of revealAll()) {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add("is-in");
      }
      for (const { el, img, speed } of items) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) continue;
        const progress = (r.top + r.height / 2 - vh / 2) / vh; // -1..1
        img.style.transform = `translate3d(0, ${(-progress * speed * 100).toFixed(2)}px, 0) scale(${1 + speed * 1.6})`;
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(frame);
      }
    };
    collect();
    frame();
    const mo2 = new MutationObserver(() => {
      collect();
      onScroll();
    });
    mo2.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      mo.disconnect();
      mo2.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return null;
}
