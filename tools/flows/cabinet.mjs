// Drives the Cabinet of Curiosities and leaves state in a persistent profile so
// tools/shot.mjs can screenshot it:
//   STUDY_PROFILE=/tmp/shots/profile-cabinet node tools/flows/cabinet.mjs
import { chromium } from "@playwright/test";
import fs from "node:fs";

const profile = process.env.STUDY_PROFILE ?? "/tmp/shots/profile-cabinet";
const shots = process.env.STUDY_SHOTS ?? "/tmp/shots";
fs.rmSync(profile, { recursive: true, force: true });
fs.mkdirSync(profile, { recursive: true });
fs.mkdirSync(shots, { recursive: true });

const ctx = await chromium.launchPersistentContext(profile, { executablePath: "/opt/pw-browsers/chromium", viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
const page = ctx.pages()[0] ?? (await ctx.newPage());
const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
const base = "http://localhost:3000";
const out = {};

await page.goto(`${base}/enter?skip=1&name=Ismail`, { waitUntil: "networkidle" });
await page.waitForTimeout(400);

// Index: today's curiosity, drawers, counts.
await page.goto(`${base}/cabinet`, { waitUntil: "networkidle" });
await page.waitForSelector("#today-eyebrow");
out.eyebrowBefore = (await page.locator("header .eyebrow").first().textContent())?.replace(/\s+/g, " ").trim();
out.todayTitle = await page.locator("#today-eyebrow ~ a h2").first().textContent();
out.drawerCount = await page.locator('section[aria-label$=" drawer"]').count();
out.rowsVisible = await page.locator('section[aria-label$=" drawer"] ul li a').count();

// Drawer collapses and reopens.
const firstDrawer = page.locator('section[aria-label$=" drawer"] > button').first();
await firstDrawer.click();
out.collapsedExpanded = await firstDrawer.getAttribute("aria-expanded");
await firstDrawer.click();
out.reopenedExpanded = await firstDrawer.getAttribute("aria-expanded");

// "Something strange" opens a curiosity page.
await page.getByRole("button", { name: "Something strange" }).click();
await page.waitForURL("**/cabinet/cur-*", { timeout: 10000 });
out.strangeUrl = page.url();
await page.waitForSelector("article h1");
await page.waitForLoadState("networkidle");
await page.waitForTimeout(600); // let the view be recorded before leaving

// Read a specific one: Michelin. Connect it, note it, answer why, keep it.
await page.goto(`${base}/cabinet/cur-michelin-and-the-tyre`, { waitUntil: "networkidle" });
await page.waitForSelector("article h1");
out.title = await page.locator("article h1").textContent();
out.paragraphs = await page.locator("article .prose-study p").count();
out.connectedBefore = await page.locator('aside section[aria-labelledby="connects-eyebrow"] ul li a').count();

await page.getByRole("textbox", { name: "Connect this to something you know" }).fill("auction");
await page.waitForTimeout(300);
await page.getByRole("option", { name: /English Auction/ }).click();
await page.waitForTimeout(500);
out.connectedAfter = await page.locator('aside section[aria-labelledby="connects-eyebrow"] ul li a').count();
out.yoursMark = await page.locator('aside section[aria-labelledby="connects-eyebrow"]', { hasText: "yours" }).count();

// Why does this matter? Names a connected entry → 0.7.
await page.getByRole("textbox", { name: /^Why does this matter/ }).fill("Because the Michelin guide shows how an incentive to sell tyres created an institution that now shapes restaurants worldwide.");
await page.getByRole("button", { name: "Record", exact: true }).click();
await page.waitForSelector("text=Recorded.", { timeout: 10000 });
out.whyFeedback = await page.locator("text=/^Recorded\\./").first().textContent();
out.earlierAnswers = await page.locator('ul[aria-label="Earlier answers"] li').count();

// Personal note, saved on blur.
const note = page.getByRole("textbox", { name: /^Your note/ });
await note.fill("Compare with the Baedeker and the coffeehouse: each sold a reason to go somewhere.");
await note.blur();
await page.waitForSelector("text=Saved", { timeout: 5000 });
out.noteSaved = true;

// Save to Memory.
await page.getByRole("button", { name: "Save to Memory" }).click();
await page.waitForSelector("text=A recall prompt is due tomorrow.", { timeout: 5000 });
out.inMemory = await page.getByRole("button", { name: "In Memory" }).count();
await page.screenshot({ path: `${shots}/cabinet-curiosity-after.png` });

// Reload: the connection, note and memory state persist.
await page.reload({ waitUntil: "networkidle" });
await page.waitForSelector("article h1");
out.persistedConnected = await page.locator('aside section[aria-labelledby="connects-eyebrow"] ul li a').count();
out.persistedNote = (await page.getByRole("textbox", { name: /^Your note/ }).inputValue()).slice(0, 30);
out.persistedInMemory = await page.getByRole("button", { name: "In Memory" }).count();
out.persistedEarlierAnswers = await page.locator('ul[aria-label="Earlier answers"] li').count();

// Michelin is alone in Food: the nav says so instead of linking.
out.onlyOne = await page.locator('nav[aria-label="Neighbours"]', { hasText: "The only one in Food so far." }).count();

// Neighbour navigation stays in the domain (History has several).
await page.goto(`${base}/cabinet/cur-the-first-deadline`, { waitUntil: "networkidle" });
await page.waitForSelector("article h1");
const nextLink = page.locator('nav[aria-label="Neighbours"] a').first();
out.neighbourLabel = (await nextLink.locator(".eyebrow").textContent())?.trim();
await nextLink.click();
await page.waitForURL((u) => u.pathname.startsWith("/cabinet/cur-") && !u.pathname.endsWith("cur-the-first-deadline"), { timeout: 10000 });
out.neighbourUrl = page.url();

// Session mode: Done hands back to the desk.
await page.goto(`${base}/cabinet/cur-bank-run?session=s-test&item=i-test`, { waitUntil: "networkidle" });
await page.waitForSelector("article h1");
out.sessionMark = await page.locator("text=Today's session").count();
out.doneButton = await page.getByRole("button", { name: /^Done/ }).count();

// Ask for a new one without a model: offers the least-recently-seen curiosity.
await page.goto(`${base}/cabinet`, { waitUntil: "networkidle" });
await page.waitForSelector("#today-eyebrow");
await page.getByRole("button", { name: "Ask for a new one" }).click();
await page.waitForSelector('[role="status"]', { timeout: 10000 });
out.askOffer = (await page.locator('section[aria-labelledby="ask-eyebrow"] [role="status"]').textContent())?.replace(/\s+/g, " ").trim();
out.eyebrowAfter = (await page.locator("header .eyebrow").first().textContent())?.replace(/\s+/g, " ").trim();
out.recentlyOpened = await page.locator('section[aria-labelledby="recent-eyebrow"] ul li').count();
out.connectedMarks = await page.locator('section[aria-label$=" drawer"] [aria-label="Connected"]').count();
out.seenMarks = await page.locator('section[aria-label$=" drawer"] [aria-label="Seen"]').count();

// ?random=1 redirects to an unseen curiosity.
await page.goto(`${base}/cabinet?random=1`, { waitUntil: "networkidle" });
await page.waitForURL("**/cabinet/cur-*", { timeout: 10000 });
out.randomUrl = page.url();

// Rows written to IndexedDB.
out.db = await page.evaluate(async () => {
  const dbs = await indexedDB.databases();
  const result = {};
  for (const d of dbs) {
    if (!d.name) continue;
    const db = await new Promise((res, rej) => { const r = indexedDB.open(d.name); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    if (!db.objectStoreNames.contains("curiosity_views")) { db.close(); continue; }
    const all = (store) => new Promise((res) => { const r = db.transaction(store).objectStore(store).getAll(); r.onsuccess = () => res(r.result); });
    const views = await all("curiosity_views");
    const ev = await all("skill_evidence");
    const mem = await all("memory_items");
    result[d.name] = {
      views: views.map((v) => `${v.curiosityId}:${v.connectedTo.length}${v.note ? ":note" : ""}`),
      cabinetEvidence: ev.filter((e) => e.source?.kind === "cabinet").map((e) => `${e.subskill}:${e.score}:${e.difficulty}:${e.format}`),
      cabinetMemory: mem.filter((m) => m.sourceRef?.kind === "cabinet").map((m) => `${m.kind} | ${m.prompt} | ${m.answer.slice(0, 60)}`),
    };
    db.close();
  }
  return result;
});

out.errors = errors.slice(0, 10);
console.log(JSON.stringify(out, null, 2));
await ctx.close();
