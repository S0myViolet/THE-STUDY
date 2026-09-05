// Extra screenshots against the persistent fieldwork profile: report detail (desktop, mobile, dark),
// the set-aside report route, and the index in session mode.
import { chromium } from "@playwright/test";
const profile = "/tmp/shots/profile-fieldwork";
const shots = "/tmp/shots";
const base = "http://localhost:3000";
const errors = [];
async function run(theme, viewport, fn) {
  const ctx = await chromium.launchPersistentContext(profile, { executablePath: "/opt/pw-browsers/chromium", viewport, deviceScaleFactor: 1, colorScheme: theme === "dark" ? "dark" : "light" });
  const page = ctx.pages()[0] ?? (await ctx.newPage());
  page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
  await page.addInitScript((t) => localStorage.setItem("the-study:appearance", t), theme);
  await fn(page);
  await ctx.close();
}
const out = {};
await run("light", { width: 1280, height: 800 }, async (page) => {
  await page.goto(`${base}/fieldwork/reports`, { waitUntil: "networkidle" });
  await page.locator("section[aria-label='Filed'] li a").first().click();
  await page.waitForURL("**/fieldwork/reports/**");
  await page.waitForTimeout(600);
  out.detailUrl = page.url();
  await page.screenshot({ path: `${shots}/fw-detail-full.png`, fullPage: true });
  // set-aside report route
  await page.goto(`${base}/fieldwork/fw-news-one-headline/report`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  out.setAsideTitle = await page.locator("text=This assignment was set aside.").count();
  await page.screenshot({ path: `${shots}/fw-report-setaside.png` });
  // session mode index
  await page.goto(`${base}/fieldwork?session=s_test&item=i_test`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${shots}/fw-index-session.png` });
});
await run("light", { width: 390, height: 844 }, async (page) => {
  await page.goto(out.detailUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${shots}/fw-detail-mobile.png`, fullPage: true });
  await page.goto(`${base}/fieldwork`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${shots}/fw-index-mobile-2.png` });
});
await run("dark", { width: 1280, height: 800 }, async (page) => {
  await page.goto(`${base}/fieldwork/fw-conversation-follow-up/report`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${shots}/fw-report-dark.png` });
  await page.goto(out.detailUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${shots}/fw-detail-dark.png` });
});
out.errors = errors;
console.log(JSON.stringify(out));
