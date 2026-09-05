import { chromium } from "@playwright/test";
const dir = process.argv[2];
const ctx = await chromium.launchPersistentContext(dir, { executablePath: "/opt/pw-browsers/chromium", viewport: { width: 1280, height: 900 } });
const page = ctx.pages()[0] ?? (await ctx.newPage());
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:3000/enter?skip=1&name=Ismail", { waitUntil: "networkidle" });
await page.goto("http://localhost:3000/settings/data", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const t0 = Date.now();
await page.click("button:has-text('Load the demonstration profile')");
await page.waitForURL("**/desk", { timeout: 180000 });
await page.waitForTimeout(1500);
console.log("seeded in", Date.now() - t0, "ms");
await page.screenshot({ path: "/tmp/claude-0/-home-user-THE-STUDY/3ab2e634-fb47-534f-9fe7-c6bbbf105fc0/scratchpad/demo-desk.png" });
for (const [path, name] of [["/profile", "demo-profile"], ["/profile/evidence", "demo-evidence"], ["/red-thread", "demo-redthread"], ["/memory", "demo-memory"], ["/forecasts", "demo-forecasts"], ["/decisions", "demo-decisions"], ["/after-action", "demo-aa"]]) {
  await page.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `/tmp/claude-0/-home-user-THE-STUDY/3ab2e634-fb47-534f-9fe7-c6bbbf105fc0/scratchpad/${name}.png` });
}
console.log(JSON.stringify({ errors }));
await ctx.close();
