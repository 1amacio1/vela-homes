// Снимки страниц для визуальной проверки: node scripts/shots.mjs [baseUrl]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
const base = process.argv[2] || "http://127.0.0.1:3077";
const out = process.argv[3] || "/tmp/vela-shots";
mkdirSync(out, { recursive: true });
const pages = [
  ["home", "/"],
  ["projects", "/projects"],
  ["project", "/projects/gorizont"],
];
const sizes = [
  ["desktop", 1440, 900],
  ["tablet", 820, 1180],
  ["mobile", 390, 844],
];
const browser = await chromium.launch();
for (const [sname, width, height] of sizes) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem("vela_analytics", "no"));
  for (const [pname, path] of pages) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    // Прокрутка для ленивых картинок и reveal
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    await page.screenshot({
      path: `${out}/${pname}-${sname}.png`,
      fullPage: true,
    });
    console.log(pname, sname, "overflow:", overflow);
  }
  await ctx.close();
}
await browser.close();
