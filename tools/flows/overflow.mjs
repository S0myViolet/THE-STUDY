// Lists elements wider than the viewport on a mobile-sized page.
//   node tools/flows/overflow.mjs <path> [profileDir]
import { chromium } from "@playwright/test";
const [, , route = "/desk", profile] = process.argv;
const opts = { executablePath: "/opt/pw-browsers/chromium", viewport: { width: 390, height: 844 } };
const ctx = profile ? await chromium.launchPersistentContext(profile, opts) : await (await chromium.launch(opts)).newContext({ viewport: opts.viewport });
const page = ctx.pages()[0] ?? (await ctx.newPage());
if (!profile) await page.goto("http://localhost:3000/enter?skip=1&name=Ismail", { waitUntil: "networkidle" });
await page.goto("http://localhost:3000" + route, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const out = await page.evaluate(() => {
  const w = document.documentElement.clientWidth;
  const rows = [];
  const scrolls = (el) => { for (let p = el.parentElement; p; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o === "auto" || o === "scroll" || o === "hidden") return true; } return false; };
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.right > w + 1 && !scrolls(el)) {
      const cls = (el.getAttribute("class") ?? "").slice(0, 80);
      rows.push(`${el.tagName.toLowerCase()} .${cls} right=${Math.round(r.right)} w=${Math.round(r.width)} :: ${(el.textContent ?? "").trim().slice(0, 40)}`);
    }
  }
  return { viewport: w, scrollWidth: document.documentElement.scrollWidth, rows: rows.slice(0, 25) };
});
console.log(JSON.stringify(out, null, 1));
await ctx.close();
