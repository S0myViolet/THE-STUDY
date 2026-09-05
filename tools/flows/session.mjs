// The daily session: start from the Desk, skip the arrival, walk items, reach the debrief.
import { chromium } from "@playwright/test";
import { idbCounts } from "./idb.mjs";

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
await page.goto("http://localhost:3000/enter?skip=1&name=Ismail", { waitUntil: "networkidle" });
await page.waitForSelector("text=Today's file");
await page.getByRole("button", { name: "Quick", exact: true }).click();
await page.getByRole("button", { name: /Session ·/ }).click();
await page.waitForURL(/arrival=1/);
await page.getByRole("button", { name: "Begin the minute" }).click();
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForURL(/\/desk\?session=/);
await page.waitForTimeout(600);
await page.screenshot({ path: "/tmp/shots/rooms/session-desk.png" });
const out = { items: [] };
out.progress = await page.locator("text=/\\d+ \\/ \\d+/").first().innerText();
// Walk the session: open each item, confirm the session mark, come back and skip it.
for (let i = 0; i < 12; i++) {
  const cont = page.getByRole("link", { name: /^Continue/ });
  if (!(await cont.count())) break;
  const href = await cont.getAttribute("href");
  out.items.push(href);
  await cont.click();
  await page.waitForTimeout(700);
  if (href.includes("debrief=1")) {
    await page.waitForSelector("text=Close the day");
    const areas = page.locator("textarea");
    for (let k = 0; k < (await areas.count()); k++) await areas.nth(k).fill("Written for the flow: notice before concluding.");
    await page.screenshot({ path: "/tmp/shots/rooms/session-debrief.png" });
    await page.getByRole("button", { name: "Close the day" }).click();
    await page.waitForURL(/\/desk$/);
    break;
  }
  const mark = await page.locator("text=/Today.s session/").count();
  if (!mark) out.missingMark = (out.missingMark ?? []).concat(href);
  await page.goto("http://localhost:3000/desk?session=" + new URL(href, "http://x").searchParams.get("session"), { waitUntil: "networkidle" });
  const skip = page.getByRole("button", { name: "Skip this" });
  if (await skip.count()) await skip.click();
  await page.waitForTimeout(400);
  if (page.url().includes("debrief=1")) break;
}
await page.waitForTimeout(500);
out.url = page.url();
out.debriefVisible = await page.locator("text=Close the day").count();
if (out.debriefVisible) {
  const areas = page.locator("textarea");
  for (let i = 0; i < (await areas.count()); i++) await areas.nth(i).fill("Written for the flow: notice before concluding.");
  await page.screenshot({ path: "/tmp/shots/rooms/session-debrief.png" });
  await page.getByRole("button", { name: "Close the day" }).click();
  await page.waitForURL(/\/desk$/);
}
const c = await idbCounts(page, ["daily_sessions", "after_actions"]);
out.sessions = c.daily_sessions.map((s) => [s.status, s.items.length, s.items.filter((i) => i.status !== "pending").length]);
out.afterActions = c.after_actions.length;
out.errors = errors;
console.log(JSON.stringify(out, null, 1));
await browser.close();
