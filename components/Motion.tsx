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
      document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])");
    if (reduce || !("IntersectionObserver" in window)) {
      revealAll().forEach((el) => (el.dataset.in = "1"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.in = "1";
            io.unobserve(e.target);
          }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.06 },
    );
    const watch = () => revealAll().forEach((el) => io.observe(el));
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(document.body, { childList: true, subtree: true });

    /* Передача вордмарка в шапку: слово VELA уменьшается и гаснет,
       логотип в шапке появляется, когда слово почти скрылось. */
    const word = document.querySelector<HTMLElement>("[data-handoff]");
    let wordEnd = 0;
    const measure = () => {
      if (!word) return;
      const r = word.getBoundingClientRect();
      wordEnd = r.top + window.scrollY + r.height * 0.9;
    };
    measure();
    window.addEventListener("resize", measure);
    const handoff = () => {
      if (!word) return;
      const y = window.scrollY;
      if (y <= 0) {
        word.style.transform = "";
        word.style.opacity = "";
        document.documentElement.dataset.brand = "off";
        return;
      }
      const end = Math.max(1, wordEnd);
      const p = Math.min(1, Math.max(0, y / end));
      word.style.transformOrigin = "left bottom";
      word.style.transform = `translateY(${(-p * 40).toFixed(1)}px) scale(${(1 - 0.25 * p).toFixed(3)})`;
      word.style.opacity = String(Math.max(0, 1 - p * 1.2).toFixed(3));
      document.documentElement.dataset.brand = p > 0.85 ? "on" : "off";
    };
    if (word) document.documentElement.dataset.brand = "off";

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
      handoff();
      const vh = window.innerHeight;
      /* Страховка для reveal: всё, что уже в кадре, показываем. */
      for (const el of revealAll()) {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) el.dataset.in = "1";
      }
      for (const { el, img, speed } of items) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) continue;
        const progress = (r.top + r.height / 2 - vh / 2) / vh; // -1..1
        img.style.transform = `translate3d(0, ${(-progress * speed * 100).toFixed(2)}px, 0)`;
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
      window.removeEventListener("resize", measure);
      delete document.documentElement.dataset.brand;
    };
  }, []);
  useEffect(() => {
    /* Перелёт фото проекта между страницами (cross-document View Transitions).
       Имя project-cover должно быть ровно у одного элемента на странице. */
    if (
      !("startViewTransition" in document) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const NAME = "project-cover";
    let named: HTMLElement | null = null;
    const clear = () => {
      if (named) named.style.viewTransitionName = "";
      named = null;
    };
    const name = (img: HTMLElement | null) => {
      clear();
      if (!img) return;
      const cover = document.querySelector<HTMLElement>(".cover-media img");
      if (cover && cover !== img) cover.style.viewTransitionName = "none";
      img.style.viewTransitionName = NAME;
      named = img;
    };
    const onDown = (e: Event) => {
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href^="/projects/"]',
      );
      if (!link) return;
      const img = link.querySelector<HTMLElement>("img");
      name(img);
    };
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("focusin", onDown, true);
    /* Предзагрузка страницы проекта при наведении: переход начинается
       сразу после клика, без паузы на загрузку. */
    const prefetched = new Set<string>();
    const onEnter = (e: Event) => {
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href^="/projects/"]',
      );
      if (!link) return;
      const href = link.getAttribute("href")!;
      if (prefetched.has(href)) return;
      prefetched.add(href);
      const l = document.createElement("link");
      l.rel = "prefetch";
      l.href = href;
      l.as = "document";
      document.head.appendChild(l);
    };
    document.addEventListener("pointerenter", onEnter, true);
    document.addEventListener("touchstart", onEnter, { capture: true, passive: true });
    type RevealEvent = Event & { viewTransition?: { finished: Promise<void> } };
    const onReveal = (e: RevealEvent) => {
      const nav = (window as unknown as { navigation?: { activation?: { from?: { url: string } } } }).navigation;
      const from = nav?.activation?.from?.url;
      if (!from || !e.viewTransition) return;
      const m = new URL(from).pathname.match(/^\/projects\/([^/]+)\/?$/);
      if (!m || document.querySelector(".cover-media img")) return;
      const link = document.querySelector<HTMLAnchorElement>(
        `a[href="/projects/${m[1]}"]`,
      );
      const img = link?.querySelector<HTMLElement>("img") ?? null;
      if (!img) return;
      link!.dataset.in = "1";
      name(img);
      e.viewTransition.finished.finally(clear);
    };
    window.addEventListener("pagereveal", onReveal as EventListener);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("focusin", onDown, true);
      document.removeEventListener("pointerenter", onEnter, true);
      document.removeEventListener("touchstart", onEnter, true);
      window.removeEventListener("pagereveal", onReveal as EventListener);
      clear();
    };
  }, []);
  return null;
}
