// Visual QA sweep: seeds the demonstration profile once, then screenshots every room
// in light desktop, dark desktop and light mobile.
//   node tools/flows/qa-shots.mjs [outDir]
import { chromium } from "@playwright/test";
import fs from "node:fs";

const out = process.argv[2] ?? "/tmp/shots/qa";
fs.mkdirSync(out, { recursive: true });
const profile = `${out}/profile`;
fs.rmSync(profile, { recursive: true, force: true });

const ROUTES = [
  "/desk", "/casebook", "/observation", "/observation/glance", "/inference", "/inference/three_stories", "/salon", "/strategy", "/memory", "/memory/palace",
  "/archive", "/archive/printing-press", "/archive/graph", "/archive/world", "/archive/timeline", "/archive/reading",
  "/rhetoric", "/rhetoric/voice", "/cabinet", "/investigations", "/fieldwork", "/forecasts", "/decisions", "/red-thread", "/after-action",
  "/profile", "/profile/evidence", "/curator", "/settings",
];

const variants = [
  { name: "light", width: 1280, height: 860, theme: "light" },
  { name: "dark", width: 1280, height: 860, theme: "dark" },
  { name: "mobile", width: 390, height: 844, theme: "light" },
];

const errors = {};
let ctx = await chromium.launchPersistentContext(profile, { executablePath: "/opt/pw-browsers/chromium", viewport: { width: 1280, height: 860 } });
let page = ctx.pages()[0] ?? (await ctx.newPage());
await page.goto("http://localhost:3000/enter?skip=1&name=Ismail", { waitUntil: "networkidle" });
await page.goto("http://localhost:3000/settings/data", { waitUntil: "networkidle" });
await page.click("button:has-text('Load the demonstration profile')");
await page.waitForURL("**/desk", { timeout: 180000 });
await page.waitForTimeout(1000);
await ctx.close();

for (const v of variants) {
  ctx = await chromium.launchPersistentContext(profile, { executablePath: "/opt/pw-browsers/chromium", viewport: { width: v.width, height: v.height }, colorScheme: v.theme === "dark" ? "dark" : "light" });
  page = ctx.pages()[0] ?? (await ctx.newPage());
  await page.addInitScript((t) => localStorage.setItem("the-study:appearance", t), v.theme);
  for (const route of ROUTES) {
    const key = `${v.name}:${route}`;
    errors[key] = [];
    page.removeAllListeners("pageerror");
    page.removeAllListeners("console");
    page.on("pageerror", (e) => errors[key].push("PAGEERROR " + e.message));
    page.on("console", (m) => { if (m.type() === "error") errors[key].push(m.text().slice(0, 160)); });
    try {
      await page.goto("http://localhost:3000" + route, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(700);
      const name = route.replace(/\//g, "_").replace(/^_/, "") || "root";
      await page.screenshot({ path: `${out}/${v.name}--${name}.png`, fullPage: v.name === "mobile" ? false : false });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      if (overflow) errors[key].push("HORIZONTAL OVERFLOW");
    } catch (e) {
      errors[key].push("NAV " + String(e).slice(0, 120));
    }
  }
  await ctx.close();
}
const bad = Object.entries(errors).filter(([, v]) => v.length);
console.log(JSON.stringify({ routes: ROUTES.length, variants: variants.length, problems: bad }, null, 1));
