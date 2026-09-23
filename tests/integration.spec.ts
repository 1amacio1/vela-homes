import { test, expect } from "@playwright/test";
import ExcelJS from "exceljs";
test("заявка с PDF, реферал, аналитика и XLSX", async ({ page, request }) => {
  test.skip(
    !process.env.TEST_ADMIN_EMAIL || !process.env.TEST_ADMIN_PASSWORD,
    "Нужен тестовый доступ администратора",
  );
  const login = await request.post("/api/login", {
    data: {
      email: process.env.TEST_ADMIN_EMAIL,
      password: process.env.TEST_ADMIN_PASSWORD,
    },
  });
  expect(login.status()).toBe(200);
  const response = await request.post("/api/admin/referrals", {
    data: { name: "QA — сквозная проверка" },
  });
  expect(response.ok()).toBeTruthy();
  const { code } = await response.json();
  await page.goto("/r/" + code + "?utm_source=qa&utm_campaign=integration");
  await page.getByRole("button", { name: "Разрешить", exact: true }).click();
  await page.getByLabel("Площадь дома", { exact: true }).fill("200");
  await page.getByLabel("Дизайн интерьера", { exact: false }).first().check();
  await page.getByRole("button", { name: "Обсудить этот расчёт" }).click();
  await page
    .getByLabel("Ваше имя *", { exact: true })
    .fill("QA — тестовая заявка");
  await page.getByLabel("Телефон *", { exact: true }).fill("+7 999 000 00 00");
  await page.getByLabel("Email *", { exact: true }).fill("qa@example.com");
  await page
    .getByLabel("Город / регион строительства *")
    .fill("Тестовый регион");
  await page
    .getByLabel("Расскажите о проекте")
    .fill("Тестирование полного пути заявки. Вымышленные данные.");
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "test.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4\n%%EOF"),
    });
  await page.locator("input[name=consent]").check();
  const submitted = page.waitForResponse((r) => r.url().endsWith("/api/leads"));
  await page.getByRole("button", { name: "Обсудить мой проект" }).click();
  const result = await submitted;
  expect(result.status()).toBe(201);
  const { id } = await result.json();
  await expect(page.locator(".form-success")).toBeVisible();
  const data = await (await request.get("/api/admin/data")).json();
  const lead = data.leads.find((l: { id: string }) => l.id === id);
  expect(lead.calculator.area).toBe(200);
  expect(lead.calculator.design).toBe(true);
  expect(lead.ref_code).toBe(code);
  expect(lead.utm.utm_campaign).toBe("integration");
  expect(lead.files).toHaveLength(1);
  expect(data.analytics.metrics.leads).toBeGreaterThan(0);
  expect(data.analytics.cohorts.length).toBeGreaterThan(0);
  const file = await request.get(
    `/api/admin/file?id=${id}&path=${encodeURIComponent(lead.files[0].path)}`,
  );
  expect(file.ok()).toBeTruthy();
  expect((await file.body()).subarray(0, 4).toString()).toBe("%PDF");
  const exported = await request.get("/api/admin/export");
  expect(exported.ok()).toBeTruthy();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(new Uint8Array(await exported.body()).buffer);
  let found = false;
  workbook.worksheets[0].eachRow((row) => {
    if (row.getCell(1).value === id) found = true;
  });
  expect(found).toBe(true);
});
