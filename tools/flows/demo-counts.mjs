// Seeds the demonstration profile in the browser and reports what was written.
import { chromium } from "@playwright/test";
import { idbCounts } from "./idb.mjs";

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message));
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(m.type() + ": " + m.text().slice(0, 300)); });
await page.goto("http://localhost:3000/enter?skip=1&name=Ismail", { waitUntil: "networkidle" });
await page.goto("http://localhost:3000/settings/data", { waitUntil: "networkidle" });
const t0 = Date.now();
await page.click("button:has-text('Load the demonstration profile')");
await page.waitForURL("**/desk", { timeout: 180000 });
await page.waitForTimeout(2500);
console.log("seeded in", Date.now() - t0, "ms");
const c = await idbCounts(page, ["skill_evidence", "error_events", "red_threads", "confidence_entries", "memory_items", "memory_reviews", "forecasts", "decision_entries", "daily_sessions", "after_actions", "case_attempts", "observation_attempts"]);
const summary = Object.fromEntries(Object.entries(c).map(([k, v]) => [k, Array.isArray(v) ? v.length : v]));
console.log(JSON.stringify(summary));
if (Array.isArray(c.error_events)) {
  const byType = {};
  for (const e of c.error_events) byType[e.type] = (byType[e.type] ?? 0) + 1;
  console.log("errors by type:", JSON.stringify(byType));
  const days = new Set(c.error_events.map((e) => e.createdAt.slice(0, 10)));
  console.log("error days:", days.size, [...days].sort().slice(0, 3), "...", [...days].sort().slice(-2));
}
if (Array.isArray(c.red_threads)) console.log("threads:", c.red_threads.map((t) => [t.patternKey, t.status, t.evidenceIds.length]));
console.log("page errors:", errors.slice(0, 10));
await browser.close();
