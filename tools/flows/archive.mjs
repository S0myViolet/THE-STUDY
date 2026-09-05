// Drives the Archive views (World, Timeline, Bookshelf, reading item) and leaves
// state in a persistent profile so tools/shot.mjs can screenshot it:
//   STUDY_PROFILE=/tmp/shots/profile-archive node tools/flows/archive.mjs
import { chromium } from "@playwright/test";
import fs from "node:fs";

const profile = process.env.STUDY_PROFILE ?? "/tmp/shots/profile-archive";
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

// Read two entries so the map and timeline have read/unread contrast.
for (const id of ["istanbul", "bretton-woods", "coffeehouses"]) {
  await page.goto(`${base}/archive/${id}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
}
out.readMark = await page.locator("text=Read").first().isVisible();

// World: select Istanbul, expect the side sheet with arcs.
await page.goto(`${base}/archive/world`, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.locator('[role="button"][aria-label^="Istanbul,"]').click();
await page.waitForTimeout(500);
out.worldSheetTitle = await page.locator("aside h2").textContent();
out.worldArcs = await page.locator("svg path.anim-draw").count();
out.worldConnectedOnMap = await page.locator("aside li button").count();
await page.screenshot({ path: `${shots}/archive-world-selected.png` });
await page.getByRole("group", { name: "Map view" }).getByText("Europe & Mediterranean").click();
await page.waitForTimeout(900);
await page.screenshot({ path: `${shots}/archive-world-europe.png` });

// Timeline: select The Printing Press, see contemporaries; second activation opens the entry.
await page.goto(`${base}/archive/timeline`, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.locator('a[aria-label^="The Printing Press,"]').click();
await page.waitForTimeout(700);
out.timelinePanel = await page.locator("aside h2").textContent();
out.timelineSame = await page.locator("aside ul li").count();
await page.screenshot({ path: `${shots}/archive-timeline-selected.png` });
await page.locator('a[aria-label^="The Printing Press,"]').click();
await page.waitForURL("**/archive/printing-press", { timeout: 10000 });
out.timelineOpened = page.url().endsWith("/archive/printing-press");

// Bookshelf: add two books.
await page.goto(`${base}/archive/reading`, { waitUntil: "networkidle" });
await page.waitForTimeout(300);
out.emptyCopy = await page.locator("text=No books yet. What are you reading, or pretending to read?").isVisible();
async function addBook({ kind, title, author, why, question, shelf }) {
  await page.getByRole("button", { name: "Add a book" }).first().click();
  await page.waitForSelector("dialog[open]");
  await page.getByLabel("Kind").selectOption(kind);
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Author").fill(author);
  if (shelf) await page.getByLabel("Shelf").selectOption(shelf);
  await page.getByLabel("Why this?").fill(why);
  await page.getByLabel("Your question").fill(question);
  await page.getByRole("button", { name: "Put it on the shelf" }).click();
  await page.waitForSelector("dialog[open]", { state: "detached" });
  await page.waitForTimeout(400);
}
await addBook({ kind: "book", title: "The Great Transformation", author: "Karl Polanyi", why: "Everyone in the money path cites it.", question: "Was the self-regulating market ever real, or always a project?" });
await addBook({ kind: "book", title: "Seeing Like a State", author: "James C. Scott", why: "Recommended twice in one week.", question: "When does legibility help and when does it destroy?", shelf: "up_next" });
await addBook({ kind: "paper", title: "Judgment under Uncertainty: Heuristics and Biases", author: "Tversky & Kahneman", why: "The source for two Archive entries.", question: "Which heuristics survive replication?", shelf: "reference" });
out.spines = await page.locator('[role="list"][aria-label="Spines"] a').count();
await page.screenshot({ path: `${shots}/archive-reading-shelf.png` });

// Open the first book and fill the notes; each field saves on blur.
await page.locator('[role="list"][aria-label="Spines"] a', { hasText: "The Great Transformation" }).click();
await page.waitForURL("**/archive/reading/read_*", { timeout: 10000 });
const itemUrl = page.url();
out.itemUrl = itemUrl;
async function note(label, text) {
  const ta = page.getByLabel(label, { exact: true });
  await ta.fill(text);
  await ta.blur();
  await page.waitForTimeout(250);
}
await note("Key idea", "Markets embedded in society were the norm; the self-regulating market of the nineteenth century was a political construction that society then moved to protect itself against.");
await note("Argument", "Land, labour and money are fictitious commodities. Treating them as real commodities strips them of social protection. The result is a double movement: laissez-faire is planned, and the countermovement of protection is spontaneous.");
await note("Evidence", "Speenhamland and the Poor Law reform of 1834 show the deliberate creation of a labour market. The gold standard and the collapse of the 1930s show the money fiction failing.");
await note("Surprise", "That Polanyi treats the gold standard as the central institution of the century.");
out.savedMark = await page.locator("text=Saved").first().isVisible().catch(() => false);
out.notesCount = await page.locator("text=/\\d \\/ 6 notes/").first().textContent();

// Connect it to an Archive entry.
await page.getByLabel("Search Archive entries").fill("gold");
await page.waitForTimeout(300);
await page.getByRole("option", { name: /The Gold Standard/ }).click();
await page.waitForTimeout(400);
out.connectionChip = await page.locator("aside li a", { hasText: "The Gold Standard" }).count();

// Reconstruct from memory (deterministic, no model).
await page.getByRole("button", { name: "Reconstruct from memory" }).click();
await page.waitForTimeout(300);
out.notesHidden = (await page.getByLabel("Key idea", { exact: true }).count()) === 0;
await page.getByRole("textbox", { name: "From memory" }).fill("Polanyi argues that the self-regulating market was a political construction of the nineteenth century, not a natural state. Land, labour and money are fictitious commodities, and treating them as commodities strips them of social protection, which produces a double movement of protection. His evidence includes Speenhamland and the Poor Law reform of 1834, which created a labour market, and the gold standard whose collapse in the 1930s showed the money fiction failing.");
await page.getByRole("button", { name: "Compare" }).click();
await page.waitForSelector("text=Points recovered", { timeout: 10000 });
out.recovered = await page.locator("text=Points recovered").locator("..").locator(".numeral").textContent();
await page.screenshot({ path: `${shots}/archive-reading-item-result.png` });
await page.getByRole("button", { name: "Back to the notes" }).click();
await page.waitForTimeout(300);

// Finish it and keep the key idea in Memory.
await page.getByRole("group", { name: "Status" }).getByText("Finished").click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: "Save the key idea to Memory" }).click();
await page.waitForTimeout(500);
out.keptLabel = await page.getByRole("button", { name: "Key idea in Memory" }).count();

// Reload: notes, reconstruction and status persist.
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(500);
out.persistedKeyIdea = (await page.getByLabel("Key idea", { exact: true }).inputValue()).slice(0, 40);
out.persistedReconstruction = await page.locator("text=/Last reconstruction/").count();
out.persistedFinished = await page.locator("text=/finished/").first().count();
await page.screenshot({ path: `${shots}/archive-reading-item.png` });

// Evidence rows written with source.kind === "reading".
out.db = await page.evaluate(async () => {
  const dbs = await indexedDB.databases();
  const result = {};
  for (const d of dbs) {
    if (!d.name) continue;
    const db = await new Promise((res, rej) => { const r = indexedDB.open(d.name); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    if (!db.objectStoreNames.contains("skill_evidence")) { db.close(); continue; }
    const all = (store) => new Promise((res) => { const r = db.transaction(store).objectStore(store).getAll(); r.onsuccess = () => res(r.result); });
    const ev = await all("skill_evidence");
    const mem = await all("memory_items");
    const items = await all("reading_items");
    const prog = await all("archive_progress");
    result[d.name] = {
      readingEvidence: ev.filter((e) => e.source?.kind === "reading").map((e) => `${e.subskill}:${Math.round(e.score * 100)}`),
      readingMemory: mem.filter((m) => m.sourceRef?.kind === "reading").length,
      readingItems: items.map((i) => `${i.title}:${i.status}:${i.connections.length}`),
      archiveRead: prog.map((p) => `${p.entryId}:${p.status}`),
    };
    db.close();
  }
  return result;
});

// Profile lists the reconstruction evidence? At least it renders with the new rows.
await page.goto(`${base}/profile`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
out.profileMentionsMemory = await page.locator("text=/Reconstruction|Memory/").first().count();

out.errors = errors.slice(0, 10);
console.log(JSON.stringify(out, null, 2));
await ctx.close();
