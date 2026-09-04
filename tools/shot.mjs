// Screenshot helper for visual QA.
//   node tools/shot.mjs <url> <out.png> [width] [height] [light|dark]
// Env: STUDY_PROFILE=<dir>  persistent browser profile (keeps IndexedDB between runs)
//      STUDY_NOSKIP=1       do not auto-complete onboarding first
//      STUDY_FULL=1         full-page screenshot
import { chromium } from "@playwright/test";
import fs from "node:fs";

const [, , url, out, w = "1280", h = "800", theme = ""] = process.argv;
if (!url || !out) {
  console.error("usage: node tools/shot.mjs <url> <out.png> [w] [h] [light|dark]");
  process.exit(2);
}
const origin = new URL(url).origin;
const profile = process.env.STUDY_PROFILE;
const opts = { viewport: { width: +w, height: +h }, deviceScaleFactor: 1, colorScheme: theme === "dark" ? "dark" : "light" };
let browser, ctx;
if (profile) {
  fs.mkdirSync(profile, { recursive: true });
  ctx = await chromium.launchPersistentContext(profile, { executablePath: "/opt/pw-browsers/chromium", ...opts });
} else {
  browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  ctx = await browser.newContext(opts);
}
const page = ctx.pages()[0] ?? (await ctx.newPage());
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message));
if (theme) await page.addInitScript((t) => localStorage.setItem("the-study:appearance", t), theme);
if (!process.env.STUDY_NOSKIP) {
  await page.goto(`${origin}/enter?skip=1&name=Ismail`, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(400);
}
await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(900);
await page.screenshot({ path: out, fullPage: !!process.env.STUDY_FULL });
console.log(JSON.stringify({ url, errors: errors.slice(0, 10), title: await page.title() }));
await ctx.close();
if (browser) await browser.close();
