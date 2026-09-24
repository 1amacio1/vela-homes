import { test, expect } from "@playwright/test";
test("каталог, калькулятор, адаптивность и защита администратора", async ({
  page,
  request,
}) => {
  expect((await request.get("/api/admin/data")).status()).toBe(401);
  expect((await request.get("/api/admin/export")).status()).toBe(401);
  await page.goto("/");
  await page.getByRole("button", { name: "Только необходимые" }).click();
  await page.getByLabel("Площадь дома", { exact: true }).fill("200");
  const trees = page.getByLabel("Посадка деревьев, шт.");
  await trees.fill("");
  await expect(trees).toHaveValue("");
  await trees.pressSequentially("20");
  await expect(trees).toHaveValue("20");
  await page.getByText("Дом и территория", { exact: true }).first().click();
  await trees.fill("0");
  await page.getByText("Дом и территория", { exact: true }).first().click();
  await trees.click();
  await trees.pressSequentially("15");
  await expect(trees).toHaveValue("15");
  await page.getByLabel("Дизайн интерьера", { exact: false }).first().check();
  expect(
    (await page.locator(".estimate-total strong").innerText()).replace(
      /\s/g,
      "",
    ),
  ).toContain("22600000");
  await page.getByRole("button", { name: "Обсудить этот расчёт" }).click();
  await expect(page.locator(".attached-calculation")).toContainText("200 м²");
  await page.goto("/projects");
  await expect(page.locator(".project-card")).toHaveCount(12);
  await page.getByRole("button", { name: "Одноэтажный", exact: true }).click();
  await expect(page.locator(".project-card")).toHaveCount(4);
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/projects", "/projects/gorizont"]) {
      await page.goto(path);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
  await page.locator(".gallery-grid button").first().click();
  await expect(page.locator("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).not.toBeVisible();
});
