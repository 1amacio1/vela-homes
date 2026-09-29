import { chromium } from "@playwright/test";
const [,, url="http://127.0.0.1:3077/", width="1440", prefix="/tmp/vela-shots/sec"] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +width, height: 900 }, reducedMotion: "reduce" });
await page.addInitScript(() => { localStorage.setItem("vela_analytics", "no"); sessionStorage.setItem("vela_intro", "1"); });
await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } window.scrollTo(0,0); });
await page.addStyleTag({ content: ".header{display:none!important}" }); await page.waitForTimeout(800);
const sections = await page.$$("main > section, footer");
let i = 0;
for (const s of sections) {
  const box = await s.boundingBox();
  if (!box || box.height < 10) continue;
  await s.screenshot({ path: `${prefix}-${String(i++).padStart(2,"0")}.png` });
}
console.log("sections", i);
await browser.close();
