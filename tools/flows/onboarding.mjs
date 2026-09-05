// Drives the entrance end to end on a fresh profile and screenshots each screen.
//   node tools/flows/onboarding.mjs [outDir]
import { chromium } from "@playwright/test";
import fs from "node:fs";

const out = process.argv[2] ?? "/tmp/shots/onboarding";
fs.mkdirSync(out, { recursive: true });
const profile = `${out}/profile-${Date.now()}`;
const ctx = await chromium.launchPersistentContext(profile, { executablePath: "/opt/pw-browsers/chromium", viewport: { width: 1280, height: 860 } });
const page = ctx.pages()[0] ?? (await ctx.newPage());
const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
const shot = (name) => page.screenshot({ path: `${out}/${name}.png` });
const click = async (text, opts = {}) => { await page.getByRole("button", { name: text, ...opts }).first().click(); };

await page.goto("http://localhost:3000/enter");
await page.getByRole("button", { name: "Enter" }).waitFor();
await shot("1-enter");
await click("Enter");
await page.getByPlaceholder("A first name is enough").fill("Ismail");
await page.getByRole("button", { name: /Notice more/ }).click();
await page.getByRole("button", { name: /Reason more carefully/ }).click();
await page.getByRole("button", { name: /Know how the world works/ }).click();
await shot("2-goals");
await click("Continue");
for (const t of ["History", "Economics", "Psychology", "Travel"]) await page.getByRole("button", { name: t, exact: true }).click();
await shot("3-interests");
await click("Continue");
await page.getByRole("button", { name: /Deep/ }).click();
await shot("4-length");
await click("Begin the first case");
await page.waitForTimeout(800);
await shot("5-case");
// The case player is exercised elsewhere; skip it here to keep the flow short.
await page.getByRole("button", { name: "Skip the case for now" }).click();
await page.getByText("The baseline", { exact: true }).waitFor();
await shot("6a-glance-intro");
await click("Show it");
await page.waitForTimeout(600);
await shot("6b-glance-scene");
await page.keyboard.press("Space"); // close early
await page.getByRole("button", { name: "Check" }).waitFor();
// Answer: pick first option for mcq, "I don't know" for the rest.
const choices = page.locator("button.choice");
const n = await choices.count();
const seenGroups = new Set();
for (let i = 0; i < n; i++) {
  const c = choices.nth(i);
  const groupTop = Math.round((await c.boundingBox())?.y / 200);
  if (!seenGroups.has(groupTop)) { seenGroups.add(groupTop); await c.click(); }
}
const idk = page.getByRole("button", { name: "I don't know" });
const idkN = await idk.count();
for (let i = 0; i < idkN; i++) await idk.nth(i).click();
await shot("6c-glance-answers");
await click("Check");
await page.waitForTimeout(500);
await shot("6d-glance-result");
await click("Continue");
// Inference
await page.getByText("Which explanation is most likely").waitFor();
await page.locator("button.choice").nth(0).click();
await page.waitForTimeout(300);
await shot("7-inference");
await click("Next");
await page.locator("button.choice").nth(1).click();
await click("Continue");
// Question
await page.getByText("Which question is most useful").waitFor();
await page.locator("button.choice").nth(0).click();
await click("Continue");
// Memory study
await click("Meet them");
await page.waitForTimeout(500);
await shot("8-memory-study");
await click("I have them");
// Strategy
await page.getByText("What is your first move").waitFor();
await page.locator("button.choice").nth(1).click();
await click("Next");
await page.locator("button.choice").nth(0).click();
await click("Continue");
// Knowledge: six questions
for (let i = 0; i < 6; i++) {
  await page.locator("button.choice").first().waitFor();
  await page.locator("button.choice").nth(1).click();
  await page.waitForTimeout(200);
  if (i === 0) await shot("9-knowledge");
  const label = i < 5 ? "Next" : "Continue";
  await click(label);
}
// Wrap-up screen of knowledge shows Continue again
if (await page.getByRole("button", { name: "Continue" }).count()) await click("Continue");
// Memory recall
await page.getByText("The four people from earlier").waitFor();
const groups = page.locator("div.serif.text-\\[20px\\]");
const g = await groups.count();
for (let i = 0; i < g; i++) {
  const row = groups.nth(i).locator("xpath=following-sibling::div[1]");
  await row.locator("button.choice").nth(i).click();
}
await page.getByPlaceholder("Anything else: where from, an interest, a detail").first().fill("Beirut, diving watch on the right wrist");
await shot("10-memory-recall");
await click("Check");
await page.waitForTimeout(300);
await shot("10b-memory-result");
await click("Continue");
// Explanation
await page.getByPlaceholder("Write it as you would say it.").fill("Opportunity cost is what you give up when you choose one thing over the next best option. If you spend the afternoon gaming, the cost is the football match you could have played instead. The real price of any choice is the best alternative you did not pick.");
await click("Submit");
await page.waitForTimeout(300);
await shot("11-explanation");
await click("Continue");
// Calibration
for (let i = 0; i < 6; i++) {
  await page.getByRole("button", { name: i % 2 ? "False" : "True", exact: true }).click();
  await page.getByRole("button", { name: i < 3 ? "80" : "65", exact: true }).click();
  if (i === 0) await shot("12-calibration");
  await click(i < 5 ? "Next" : "Finish");
}
await page.waitForTimeout(300);
await shot("12b-calibration-result");
await click("See the first map");
await page.getByText("This is a starting estimate").waitFor();
await page.waitForTimeout(600);
await shot("13-first-map");
await click("Enter the Study");
await page.waitForURL(/\/desk/);
await page.waitForTimeout(1200);
await shot("14-desk");
console.log("done; errors:", errors.length ? errors : "none");
await ctx.close();
