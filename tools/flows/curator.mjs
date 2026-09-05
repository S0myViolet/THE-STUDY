// Drives the offline Curator: recommendation, due memory, an Archive explanation with
// Save/Test offers, and a reasoning question that triggers Think First. Asserts persistence.
//   node tools/flows/curator.mjs
import { chromium } from "@playwright/test";
const S = "/tmp/claude-0/-home-user-THE-STUDY/3ab2e634-fb47-534f-9fe7-c6bbbf105fc0/scratchpad";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
await page.goto("http://localhost:3000/enter?skip=1&name=Ismail", { waitUntil: "networkidle" });
await page.goto("http://localhost:3000/curator?mode=review", { waitUntil: "networkidle" });
await page.waitForSelector("textarea");
const ask = async (t, viaKeyboard = false) => {
  await page.fill("textarea", t);
  if (viaKeyboard) await page.keyboard.press("Control+Enter");
  else await page.click("button:has-text('Ask')");
  await page.waitForFunction(() => ![...document.querySelectorAll("button")].some((b) => b.textContent?.includes("Considering")), null, { timeout: 15000 });
  await page.waitForTimeout(400);
};
const out = {};
await ask("What should I work on?");
out.recommend = await page.locator("ol li").nth(1).innerText();
out.urlAfterFirst = page.url();
await ask("What's due?", true);
out.due = await page.locator("ol li").nth(3).innerText();
out.dueLink = await page.locator("ol li a[href^='/memory']").count();
await page.screenshot({ path: `${S}/curator-conv-review.png` });

// Teach mode: an Archive explanation with offers
await page.click("nav[aria-label='Curator mode'] button:has-text('Teach') >> nth=0");
await ask("Explain the Printing Press");
out.printing = (await page.locator("ol li").nth(5).innerText()).slice(0, 200);
out.offerButtons = await page.locator("button:has-text('Save to Archive'), button:has-text('Test me later')").count();
await page.click("button:has-text('Save to Archive')");
await page.waitForSelector("text=Saved to the Archive");
await page.click("button:has-text('Test me later')");
await page.waitForSelector("text=Scheduled for recall");
await page.screenshot({ path: `${S}/curator-conv-teach.png` });

// Think First: a reasoning question with no attempt
await page.click("nav[aria-label='Curator mode'] button:has-text('Reason') >> nth=0");
await ask("Two colleagues gave me different accounts of the meeting. Who is lying?");
out.thinkFirst = await page.locator("ol li").nth(7).innerText();
out.thinkFirstMark = await page.locator("text=Think first").count();
await ask("I think the second account is more reliable because it was more specific about times and it matched the calendar invite, while the first one changed when I asked a follow-up question.");
out.afterAttempt = (await page.locator("ol li").nth(9).innerText()).slice(0, 160);
await page.screenshot({ path: `${S}/curator-conv-think.png` });
out.url = page.url();

// Persistence: reload the conversation URL
await page.reload({ waitUntil: "networkidle" });
await page.waitForSelector("ol li");
out.messagesAfterReload = await page.locator("ol > li").count();
out.savedAfterReload = await page.locator("text=Saved to the Archive").count();
out.scheduledAfterReload = await page.locator("text=Scheduled for recall").count();
out.listEntries = await page.locator("section[aria-label='Previous consultations'] li").count();

// Data assertions through IndexedDB via the page
out.db = await page.evaluate(async () => {
  const open = (name) => new Promise((res, rej) => { const r = indexedDB.open(name); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const names = (await indexedDB.databases()).map((d) => d.name);
  const db = await open(names.find((n) => /study/i.test(n)) ?? names[0]);
  const all = (store) => new Promise((res) => { const t = db.transaction(store).objectStore(store).getAll(); t.onsuccess = () => res(t.result); t.onerror = () => res([]); });
  const convs = await all("curator_conversations");
  const notes = await all("archive_notes");
  const mem = await all("memory_items");
  const ev = await all("skill_evidence");
  return { conversations: convs.length, independentAttempts: convs[0]?.independentAttempts, messages: convs[0]?.messages.length, title: convs[0]?.title, archiveNotes: notes.filter((n) => n.entryId === "printing-press").length, memoryFromCurator: mem.filter((m) => m.sourceRef?.kind === "curator").length, curatorEvidence: ev.filter((e) => e.source?.kind === "curator").map((e) => [e.subskill, e.score, e.difficulty]), dbName: db.name };
});

// Dark mode rendering of the same consultation
await page.emulateMedia({ colorScheme: "dark" });
await page.reload({ waitUntil: "networkidle" });
await page.waitForSelector("ol li");
out.darkApplied = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
await page.screenshot({ path: `${S}/curator-conv-dark.png` });
await page.emulateMedia({ colorScheme: "light" });

// Query params: ?q prefills, ?mode preselects; mobile composition
await page.goto("http://localhost:3000/curator?mode=explore&q=Tell%20me%20something%20interesting", { waitUntil: "networkidle" });
out.prefill = await page.inputValue("textarea");
out.preselected = await page.locator("nav[aria-label='Curator mode'] button[aria-pressed='true']").first().innerText();
await ask("Tell me something interesting");
out.curiosity = (await page.locator("ol li").nth(1).innerText()).slice(0, 120);
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(400);
await page.screenshot({ path: `${S}/curator-conv-mobile.png` });
console.log(JSON.stringify({ ...out, errors }, null, 1));
await browser.close();
