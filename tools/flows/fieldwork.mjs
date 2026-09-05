// Drives the Fieldwork room end to end and leaves state in a persistent profile so
// tools/shot.mjs can screenshot it:
//   STUDY_PROFILE=/tmp/shots/profile-fieldwork node tools/flows/fieldwork.mjs
// Takes an assignment, writes and files a report (asserting the Saved mark, the debrief and the
// evidence rows), leaves a second assignment in progress with text, and sets a third aside then undoes it.
import { chromium } from "@playwright/test";
import fs from "node:fs";
import { idbCounts } from "./idb.mjs";

const profile = process.env.STUDY_PROFILE ?? "/tmp/shots/profile-fieldwork";
const shots = process.env.STUDY_SHOTS ?? "/tmp/shots";
fs.rmSync(profile, { recursive: true, force: true });
fs.mkdirSync(profile, { recursive: true });
fs.mkdirSync(shots, { recursive: true });

const ctx = await chromium.launchPersistentContext(profile, { executablePath: "/opt/pw-browsers/chromium", viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
const page = ctx.pages()[0] ?? (await ctx.newPage());
const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 300)); });
const base = "http://localhost:3000";
const out = {};
const settle = (ms = 400) => page.waitForTimeout(ms);

await page.goto(`${base}/enter?skip=1&name=Ismail`, { waitUntil: "networkidle" });
await settle();

// 1. Index, empty.
await page.goto(`${base}/fieldwork`, { waitUntil: "networkidle" });
await settle();
out.indexTitle = await page.locator("h1").first().textContent();
out.weeklyPick = await page.locator("section[aria-label=\"This week's assignment\"] h2").textContent();
out.assignmentRows = await page.locator("section[aria-label='Assignments'] li a").count();

// 2. Brief: take the observation walk.
await page.goto(`${base}/fieldwork/fw-observation-walk`, { waitUntil: "networkidle" });
await settle();
out.briefSteps = await page.locator("section[aria-label='Steps'] li").count();
out.briefEthics = await page.locator("section[aria-label='Before you begin'] li").count();
out.trains = await page.locator("section[aria-label='Details'] p").textContent();
await page.click("button:has-text('Take this assignment')");
await page.waitForSelector("a:has-text('Write the report')");
out.takenMark = await page.locator("text=Taken just now").count();
await page.screenshot({ path: `${shots}/fieldwork-brief-taken.png` });
await page.click("a:has-text('Write the report')");
await page.waitForURL("**/fieldwork/fw-observation-walk/report");
await settle(600);

// 3. Report: fill five prompts, blur each, expect the Saved mark.
const answers = [
  "I noticed a cast iron downpipe with a date stamp of 1887 on the hopper at number 14, a bricked-up window on the second floor of the corner house, and a cornice with egg-and-dart moulding above the pharmacy. The window was the one I had never noticed before; it is painted the same cream as the wall.",
  "I heard a compressor behind the bakery, which I think is the refrigeration unit, and a metallic ticking from the traffic light box on the corner. I was certain about the compressor. The ticking I am guessing at; probably the relay.",
  "The sign said 'J. Halloran & Sons, Est. 1952, Tel 3341'. The phone number has only four digits, and the typeface is a serif with very long serifs. There was a newer vinyl sign underneath advertising a nail bar.",
  "Every third house on the north side has a green door. I counted seven green doors. My guess is one landlord owns them, but an alternative is a conservation area colour rule, or simply one popular paint shop in the 1990s.",
  "The bench outside the library has gone. I am fairly sure it was there last week because I saw someone sitting on it on Tuesday. Around 70 percent confident it was removed rather than that I never noticed it.",
];
const areas = page.locator("textarea");
out.textareas = await areas.count();
let savedSeen = 0;
for (let i = 0; i < answers.length; i++) {
  await areas.nth(i).fill(answers[i]);
  await areas.nth(i).blur();
  try {
    await page.waitForSelector("text=Saved", { timeout: 3000 });
    savedSeen++;
  } catch {}
  await settle(200);
}
out.savedSeen = savedSeen;
await areas.nth(5).fill("A month ago I would have walked this street looking at the pavement. I now look up at the roofline first, and the dates on the gables are the thing I check.");
await areas.nth(5).blur();
await settle(400);
out.answeredLine = await page.locator("text=/\\d of 5 prompts answered/").first().textContent();
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: `${shots}/fieldwork-report-filled.png` });

// Reload: the saved text must survive.
await page.reload({ waitUntil: "networkidle" });
await settle(600);
out.persistedFirstAnswer = (await page.locator("textarea").first().inputValue()).slice(0, 40);

// 4. File the report; debrief.
await page.click("button:has-text('File the report')");
await page.waitForSelector("section[aria-label='Debrief']", { timeout: 15000 });
await page.waitForSelector("text=Evidence recorded for", { timeout: 15000 });
out.debrief = await page.locator("section[aria-label='Debrief'] p").allTextContents();
out.debriefStats = await page.locator("section[aria-label='Debrief'] dd").allTextContents();
await page.screenshot({ path: `${shots}/fieldwork-debrief.png` });
await page.setViewportSize({ width: 390, height: 844 });
await settle(300);
await page.screenshot({ path: `${shots}/fieldwork-debrief-mobile.png`, fullPage: true });
await page.setViewportSize({ width: 1280, height: 800 });

// Evidence and after action rows.
const c = await idbCounts(page, ["field_reports", "skill_evidence", "after_actions", "error_events"]);
out.db = {
  field_reports: c.field_reports?.map((r) => [r.assignmentId, r.status, Object.keys(r.responses).length, !!r.reflection]),
  fieldworkEvidence: c.skill_evidence?.filter((e) => e.source?.kind === "fieldwork").map((e) => [e.subskill, Math.round(e.score * 100) / 100, e.difficulty, e.format, e.transfer]),
  afterActions: c.after_actions?.filter((x) => x.source?.kind === "fieldwork").map((x) => ({ title: x.title, saw: x.saw.length, missed: x.missed, didWell: x.didWell, oneThing: x.oneThing, score: Math.round(x.score * 100) / 100 })),
  fieldworkErrors: c.error_events?.filter((e) => e.source?.kind === "fieldwork").map((e) => e.type),
};

// 5. Read the report.
await page.click("a:has-text('Read the report')");
await page.waitForURL("**/fieldwork/reports/**");
await settle(500);
out.detailEyebrow = await page.locator("article .eyebrow").first().textContent();
out.detailAnswers = await page.locator("article section p.serif").count();
out.detailHasDebrief = await page.locator("section[aria-label='Debrief']").count();

// 6. Second assignment left in progress with partial text.
await page.goto(`${base}/fieldwork/fw-conversation-follow-up`, { waitUntil: "networkidle" });
await settle();
await page.click("button:has-text('Take this assignment')");
await page.waitForSelector("a:has-text('Write the report')");
await page.click("a:has-text('Write the report')");
await page.waitForURL("**/fieldwork/fw-conversation-follow-up/report");
await settle(500);
await page.locator("textarea").nth(0).fill("Dana mentioned she had spent the weekend rebuilding a 1978 bicycle. I asked how she had got hold of the frame, and she said it came from her uncle's garage in Leeds, where it had hung for twenty years.");
await page.locator("textarea").nth(0).blur();
await settle(300);
await page.locator("textarea").nth(1).fill("That the uncle had raced it; that she had never learned to ride until she was fourteen. I would not have learned either if I had answered with my own cycling story.");
await page.locator("textarea").nth(1).blur();
await settle(400);

// 7. Third assignment: set aside, then undo.
await page.goto(`${base}/fieldwork/fw-news-one-headline`, { waitUntil: "networkidle" });
await settle();
await page.click("button:has-text('Take this assignment')");
await page.waitForSelector("button:has-text('Set aside')");
await page.click("button:has-text('Set aside')");
await page.waitForSelector("text=Set aside. It stays in your reports as skipped.");
out.setAsideShown = true;
await page.click("button:has-text('Undo')");
await page.waitForSelector("a:has-text('Write the report')");
out.undoRestored = true;
await page.click("button:has-text('Set aside')");
await page.waitForSelector("text=Set aside. It stays in your reports as skipped.");

// 8. Index with state; reports list.
await page.goto(`${base}/fieldwork`, { waitUntil: "networkidle" });
await settle(500);
out.inProgressRows = await page.locator("section[aria-label='In progress'] li").count();
out.inProgressText = await page.locator("section[aria-label='In progress'] li").first().textContent();
out.reportsRows = await page.locator("section[aria-label='Reports'] li a").count();
out.filedStatus = await page.locator("section[aria-label='Assignments'] li:has-text('The observation walk')").textContent();

await page.goto(`${base}/fieldwork/reports`, { waitUntil: "networkidle" });
await settle(400);
out.reportsList = { filed: await page.locator("section[aria-label='Filed'] li").count(), inProgress: await page.locator("section[aria-label='In progress'] li").count(), setAside: await page.locator("section[aria-label='Set aside'] li").count() };

// 9. Session mark appears with session params; links keep them.
await page.goto(`${base}/fieldwork?session=s_test&item=i_test`, { waitUntil: "networkidle" });
await settle(400);
out.sessionMark = await page.locator("text=Today's session").count();
out.sessionLinkKept = (await page.locator("section[aria-label='Assignments'] li a").first().getAttribute("href"))?.includes("session=s_test");

// 10. Unknown routes.
await page.goto(`${base}/fieldwork/no-such-thing`, { waitUntil: "networkidle" });
out.notFound = await page.locator("text=No such assignment.").count();

out.errors = errors;
console.log(JSON.stringify(out, null, 1));
await ctx.close();
