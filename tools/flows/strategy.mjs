import { chromium } from "@playwright/test";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:3000/enter?skip=1&name=Ismail", { waitUntil: "networkidle" });
await page.goto("http://localhost:3000/strategy/st-society-sponsor", { waitUntil: "networkidle" });
await page.click("button:has-text('Skip to the table')");
for (let i = 0; i < 5; i++) {
  const choices = page.locator("button.choice");
  if ((await choices.count()) === 0) break;
  await choices.nth(1).click();
  await page.waitForTimeout(400);
  const next = page.locator("button:has-text('Then what?'), button:has-text('See how it ends')");
  if ((await next.count()) === 0) break;
  await next.first().click();
  await page.waitForTimeout(500);
}
const debrief = await page.locator("text=Debrief").count();
await page.screenshot({ path: "/tmp/claude-0/-home-user-THE-STUDY/3ab2e634-fb47-534f-9fe7-c6bbbf105fc0/scratchpad/strategy-debrief.png", fullPage: true });
await page.goto("http://localhost:3000/strategy", { waitUntil: "networkidle" });
const done = await page.locator("text=/\\d+ · /").count();
console.log(JSON.stringify({ debrief, listShowsScore: done, errors }));
await browser.close();
