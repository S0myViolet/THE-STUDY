// Drives the Rhetoric Room end to end against the running dev server.
//   STUDY_PROFILE=/tmp/shots/profile-rhetoric node tools/flows/rhetoric.mjs
// Writes screenshots to /tmp/shots and prints a JSON summary of what it verified.
import { chromium } from "@playwright/test";
import fs from "node:fs";

const base = "http://localhost:3000";
const profile = process.env.STUDY_PROFILE || "/tmp/shots/profile-rhetoric";
fs.mkdirSync(profile, { recursive: true });
fs.mkdirSync("/tmp/shots", { recursive: true });
const ctx = await chromium.launchPersistentContext(profile, { executablePath: "/opt/pw-browsers/chromium", viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
const page = ctx.pages()[0] ?? (await ctx.newPage());
const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
const out = {};
const go = (path) => page.goto(base + path, { waitUntil: "networkidle", timeout: 60000 });
const shot = (name, opts = {}) => page.screenshot({ path: `/tmp/shots/${name}.png`, ...opts });

await go("/enter?skip=1&name=Ismail");
await page.waitForTimeout(400);

// 1. One Sentence: type, review, result.
await go("/rhetoric/one_sentence/rh-one-sentence-central-bank");
await page.waitForSelector("textarea");
await page.fill("textarea", "A central bank sets the price of borrowing for a whole country, keeps prices roughly stable, and stands behind ordinary banks when they run out of money.");
await page.waitForTimeout(200);
out.oneSentenceLive = await page.locator("text=/\\d+ \\/ 35 words/").first().textContent();
await page.click("button:has-text('Review')");
await page.waitForSelector("text=deterministic read", { timeout: 15000 });
await page.waitForTimeout(700);
out.oneSentenceScore = await page.locator("section[aria-label='Review'] .numeral").first().textContent();
out.oneSentenceNotes = await page.locator("section[aria-label='Review'] .border-l-2").allTextContents();
out.savedLink = await page.locator("text=Saved to your history").count();
await shot("rh-result");
await page.setViewportSize({ width: 390, height: 844 });
await shot("rh-result-mobile");
await page.setViewportSize({ width: 1280, height: 900 });

// 2. Argument: mid-way screenshot with live structure marks, then review.
await go("/rhetoric/argument/rh-argument-gold-standard");
await page.waitForSelector("textarea");
await page.fill("textarea", "The gold standard should not be restored. First, because a fixed money supply turns every downturn into a deflation: between 1929 and 1933 prices in the United States fell by about a quarter, and the countries that left gold first, Britain in 1931, recovered first. Second, because the supply of money would depend on mining discoveries rather than on the needs of the economy; the gold rushes of the 1850s and 1890s were accidents, not policy. One might say that gold at least disciplines politicians who would otherwise print money. Yet that discipline is exactly the problem in a crisis: in 1907 and 1931 the inability to act as lender of last resort deepened the panic. Discipline can come from an independent central bank with a mandate; it does not require chaining the money supply to a metal.");
await page.waitForTimeout(300);
out.argumentStructure = await page.locator("ul[aria-label='Structure'] li").allTextContents();
await shot("rh-midway");
await page.setViewportSize({ width: 390, height: 844 });
await shot("rh-midway-mobile");
await page.setViewportSize({ width: 1280, height: 900 });
await page.click("button:has-text('Review')");
await page.waitForSelector("section[aria-label='Review']", { timeout: 15000 });
out.argumentScore = await page.locator("section[aria-label='Review'] .numeral").first().textContent();
out.argumentNotes = await page.locator("section[aria-label='Review'] .border-l-2").allTextContents();

// 3. Three People: three fields.
await go("/rhetoric/three_people/rh-three-people-inflation");
await page.waitForSelector("textarea");
const areas = page.locator("textarea");
out.threeFields = await areas.count();
await areas.nth(0).fill("Imagine your pocket money stays the same but sweets cost more every month. That is inflation: prices go up, so the same money buys less.");
await areas.nth(1).fill("Your flour, butter and wages all cost more this year, so your margins shrink unless you raise prices, and your customers feel the same squeeze.");
await areas.nth(2).fill("A sustained rise in the general price level, driven here by a supply shock feeding into expectations; the real question is whether interest rates can anchor expectations before wages follow.");
await page.click("button:has-text('Review')");
await page.waitForSelector("section[aria-label='Review']", { timeout: 15000 });
out.threePeopleScore = await page.locator("section[aria-label='Review'] .numeral").first().textContent();
out.threePeopleNotes = await page.locator("section[aria-label='Review'] .border-l-2").allTextContents();

// 4. Timed: Thirty Seconds. Begin, skip prep with Space, type, wait for the lock.
await go("/rhetoric/thirty_seconds/rh-thirty-seconds-suez");
await page.click("button:has-text('Begin')");
await page.waitForSelector("text=Think");
await page.keyboard.press("Space");
await page.waitForSelector("textarea:not([disabled])", { timeout: 5000 });
await page.fill("textarea", "The Suez Canal joins the Mediterranean to the Red Sea, so a ship from Rotterdam to Singapore avoids sailing around the Cape of Good Hope: about ten days and thousands of miles saved. Roughly twelve percent of world trade passes through it, which is why one grounded ship in 2021 stalled supply chains for weeks.");
await page.waitForTimeout(1500);
await shot("rh-timed");
await page.waitForSelector("text=The clock stopped", { timeout: 45000 });
out.timedLocked = await page.locator("textarea[disabled]").count();
await page.click("button:has-text('Review what is on the page')");
await page.waitForSelector("section[aria-label='Review']", { timeout: 15000 });
out.timedScore = await page.locator("section[aria-label='Review'] .numeral").first().textContent();

// 5. Generate a new prompt without a model (template bank) and play it.
await go("/rhetoric/analogy");
await page.click("button:has-text('New prompt')");
await page.waitForURL(/\/rhetoric\/analogy\/rh-gen-/, { timeout: 15000 });
await page.waitForSelector("textarea", { timeout: 15000 });
out.generatedUrl = page.url().replace(base, "");
out.generatedTitle = await page.locator("h1").first().textContent();
await go("/rhetoric/precision");
await page.click("button:has-text('New prompt')");
await page.waitForURL(/\/rhetoric\/precision\/rh-gen-/, { timeout: 15000 });
await page.waitForSelector("textarea", { timeout: 15000 });
out.generatedPrecisionSource = (await page.locator("text=The passage").count()) > 0;
await go("/rhetoric/analogy");
out.analogyCountAfterGenerate = await page.locator("h1 + p, .eyebrow").first().textContent();

// 6. Voice: timed speaking fallback, transcript, save.
await go("/rhetoric/voice");
await page.click("text=Use timed speaking instead");
await page.click("button:has-text('30s')");
await page.click("button:has-text('Start speaking')");
await page.waitForTimeout(6000);
await shot("rh-voice-recording");
await page.click("button:has-text('Stop')");
await page.waitForSelector("textarea");
await page.fill("textarea", "So um the thing about the Suez Canal is that it basically joins the Mediterranean to the Red Sea, which means ships from Europe to Asia do not have to go around Africa, and that saves about ten days.");
out.voiceLive = await page.locator("dl[aria-live='polite']").first().textContent();
await page.click("button:has-text('Save and review')");
await page.waitForSelector("section[aria-label='Review']", { timeout: 15000 });
await page.waitForTimeout(700);
out.voiceReview = await page.locator("section[aria-label='Review'] .border-l-2").allTextContents();
await shot("rh-voice-review");

// 7. History and one entry.
await go("/rhetoric/history");
out.historyRows = await page.locator("ul.divide-y > li").count();
out.historyVoice = await page.locator("aside li").count();
await shot("rh-history");
await page.locator("ul.divide-y > li a").first().click();
await page.waitForSelector("text=What you said");
out.entryUrl = page.url().replace(base, "");
out.entryHasReview = (await page.locator("section[aria-label='Review']").count()) > 0;
await shot("rh-entry");

// 8. Index shows recent work and the sparkline.
await go("/rhetoric");
out.recentRows = await page.locator("aside ul li").count();
out.sparkline = await page.locator("svg[role='img'][aria-label^='Hedges']").count();
await shot("rh-index-after");

// 9. Session mark on a session-style link.
await go("/rhetoric/rh-one-sentence-double-entry?session=s1&item=i1");
await page.waitForSelector("textarea");
out.sessionMark = await page.locator("text=Today's session").count();

// 10. Evidence reached the profile.
await go("/profile");
await page.waitForSelector("text=pieces of evidence", { timeout: 15000 });
out.profileEvidence = (await page.locator("text=pieces of evidence").first().textContent())?.trim();

console.log(JSON.stringify({ ...out, errors: errors.slice(0, 10) }, null, 1));
await ctx.close();
