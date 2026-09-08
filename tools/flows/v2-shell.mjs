// The V2 shell: entrance skip, the rail and its links, section pages, the
// palette, keyboard chords, the V1 archive under /v1, redirects from the old
// top-level V1 addresses, the mobile bar and the Settings archive section.
//   node tools/flows/v2-shell.mjs [outDir]
// Exits non-zero when a check fails or the browser reports an error.
import { chromium } from "@playwright/test";
import fs from "node:fs";

const base = process.env.STUDY_URL ?? "http://localhost:3000";
const out = process.argv[2] ?? "/tmp/shots/v2-shell";
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text().slice(0, 240));
});
const checks = {};
const shot = (name) => page.screenshot({ path: `${out}/${name}.png` });
const goto = async (path) => {
  await page.goto(base + path, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(300);
};
const pathOf = () => new URL(page.url()).pathname + new URL(page.url()).search;

// 1. The entrance skip completes a V2 profile and lands on Today.
await goto("/enter?skip=1&name=Ismail");
await page.waitForURL(/\/today$/, { timeout: 20000 });
checks.skipLandsOnToday = pathOf() === "/today";
checks.todayHeader = (await page.getByRole("heading", { level: 1, name: "The plan for today" }).count()) === 1;
checks.todayEyebrow = (await page.locator("main").getByText("Today", { exact: true }).count()) >= 1;

// 2. The rail: six sections, a hairline, the rooms, search and settings at the bottom.
const rail = page.getByRole("navigation", { name: "Sections and rooms" });
const railHrefs = await rail.locator("a[href]").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
const expectedRail = ["/today", "/learn", "/train", "/build", "/prove", "/review", "/library", "/knowledge", "/memory", "/writing", "/speaking", "/forecasts", "/decisions", "/curator", "/settings"];
checks.railLinks = expectedRail.every((h) => railHrefs.includes(h));
checks.railHidesArchive = railHrefs.every((h) => !h.startsWith("/v1/"));
checks.railSearchButton = (await rail.getByRole("button", { name: /Search/ }).count()) === 1;
checks.railActiveToday = (await rail.locator('a[href="/today"][aria-current="page"]').count()) === 1;
checks.sectionsThenRooms = (await rail.getByRole("list", { name: "Sections" }).locator("a").count()) === 6 && (await rail.getByRole("list", { name: "Rooms" }).locator("a").count()) === 8;
await shot("1-today");

// 3. Section pages render the shell with their own header.
await goto("/learn");
checks.learnHeader = (await page.getByRole("heading", { level: 1, name: "The curriculum" }).count()) === 1;
checks.learnActive = (await rail.locator('a[href="/learn"][aria-current="page"]').count()) === 1;
await goto("/prove");
checks.proveHeader = (await page.getByRole("heading", { level: 1, name: "Proof" }).count()) === 1;
checks.proveActive = (await rail.locator('a[href="/prove"][aria-current="page"]').count()) === 1;
await shot("2-prove");
await goto("/learn/concept/base-rates");
checks.deepLinkAcknowledged = (await page.getByText("/learn/concept/base-rates").count()) >= 1;

// 4. The palette: opens on Ctrl/Cmd+K, lists the V2 commands first, finds a concept, closes on Escape.
await goto("/today");
await page.keyboard.press("Control+k");
const palette = page.getByRole("dialog", { name: "Search" });
await palette.waitFor({ timeout: 5000 });
const firstOption = palette.getByRole("option").first();
checks.paletteCommandsFirst = (await firstOption.textContent())?.includes("Continue today's work") ?? false;
await palette.getByRole("combobox").fill("base rate");
await page.waitForTimeout(200);
const top = palette.getByRole("option").first();
checks.paletteFindsConcept = ((await top.textContent()) ?? "").includes("Concept");
await palette.getByRole("combobox").fill("casebook");
await page.waitForTimeout(200);
checks.paletteLabelsArchive = (await palette.getByRole("option").filter({ hasText: "V1 · " }).count()) >= 1;
await shot("3-palette");
await page.keyboard.press("Escape");
await page.waitForTimeout(200);
checks.paletteCloses = (await palette.count()) === 0;

// 5. Chords: g then l → Learn; g then t → Today. The ? key opens the reference.
await page.keyboard.press("g");
await page.keyboard.press("l");
await page.waitForURL(/\/learn$/, { timeout: 10000 });
checks.chordLearn = pathOf() === "/learn";
await page.keyboard.press("g");
await page.keyboard.press("t");
await page.waitForURL(/\/today$/, { timeout: 10000 });
checks.chordToday = pathOf() === "/today";
await page.keyboard.press("?");
const help = page.getByRole("dialog", { name: "Keyboard" });
await help.waitFor({ timeout: 5000 });
checks.helpLists = (await help.getByText("Search and commands").count()) === 1;
await page.keyboard.press("Escape");

// 6. The V1 archive still works under /v1, with its banner, and the archive rooms link inside /v1.
await goto("/v1/desk");
checks.v1DeskLoads = pathOf() === "/v1/desk" && (await page.locator("main h1").count()) >= 1;
checks.v1Banner = (await page.getByText("V1 archive · evidence here does not change V2 mastery").count()) === 1;
checks.v1RailMarker = (await rail.getByText("V1 archive").count()) === 1;
await shot("4-v1-desk");
await goto("/v1/casebook");
checks.v1CasebookLoads = pathOf() === "/v1/casebook" && (await page.getByRole("heading", { level: 1, name: "Cases" }).count()) === 1;
const caseHrefs = await page.locator("main a[href^='/']").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
checks.v1LinksStayInArchive = caseHrefs.filter((h) => /^\/(casebook|desk)/.test(h)).length === 0 && caseHrefs.some((h) => h.startsWith("/v1/casebook/"));
await shot("5-v1-casebook");

// 7. Old addresses redirect: /desk → /today, the moved rooms → /v1/<room> with segments and query kept.
await goto("/desk");
checks.deskRedirects = pathOf() === "/today";
await goto("/casebook");
checks.casebookRedirects = pathOf() === "/v1/casebook";
await goto("/archive/graph?focus=x");
checks.archiveRedirectKeepsPath = pathOf() === "/v1/archive/graph?focus=x";
await goto("/enter");
await page.waitForURL(/\/today$/, { timeout: 10000 });
checks.enterWhenOnboardedGoesToToday = pathOf() === "/today";

// 8. Settings: the V2 study block and the V1 archive section with every room.
await goto("/settings/v1");
checks.settingsV1Section = (await page.getByRole("heading", { level: 2, name: "V1 archive" }).count()) === 1;
checks.settingsV1Links = (await page.locator('#v1 a[href="/v1/desk"]').count()) === 1 && (await page.locator('#v1 a[href="/v1/enter"]').count()) === 1;
checks.settingsV2Study = (await page.getByText("Daily plan", { exact: true }).count()) === 1 && (await page.getByText("Lesson depth", { exact: true }).count()) === 1;
await shot("6-settings-v1");

// 9. Mobile: Today, Learn, Train, Prove, More; the sheet holds Build, Review, the rooms and search.
await page.setViewportSize({ width: 390, height: 844 });
await goto("/today");
const bar = page.getByRole("navigation", { name: "Primary" });
const tabs = (await bar.locator("a, button").allTextContents()).map((t) => t.trim());
checks.mobileTabs = JSON.stringify(tabs) === JSON.stringify(["Today", "Learn", "Train", "Prove", "More"]);
checks.railHiddenOnMobile = !(await rail.isVisible());
await bar.getByRole("button", { name: "More" }).click();
const sheet = page.getByRole("dialog", { name: "More" });
await sheet.waitFor({ timeout: 5000 });
checks.sheetContents = (await Promise.all(["Build", "Review", "Library", "Knowledge", "Memory", "Curator", "Settings"].map((l) => sheet.getByRole("link", { name: l, exact: true }).count()))).every((n) => n === 1);
checks.sheetSearch = (await sheet.getByRole("button", { name: "Search" }).count()) === 1;
await shot("7-mobile-sheet");
await sheet.getByRole("link", { name: "Build", exact: true }).click();
await page.waitForURL(/\/build$/, { timeout: 10000 });
checks.sheetNavigates = pathOf() === "/build";
checks.noHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

const failed = Object.entries(checks).filter(([, v]) => v !== true).map(([k]) => k);
console.log(JSON.stringify({ checks, failed, errors }, null, 1));
await browser.close();
process.exit(failed.length || errors.length ? 1 : 0);
