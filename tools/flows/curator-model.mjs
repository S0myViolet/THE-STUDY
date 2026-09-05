// Exercises the model path without a key by intercepting /api/ai/*:
// streaming replies render progressively, knowledge questions use the structured call and get offers.
//   node tools/flows/curator-model.mjs
import { chromium } from "@playwright/test";
const S = "/tmp/claude-0/-home-user-THE-STUDY/3ab2e634-fb47-534f-9fe7-c6bbbf105fc0/scratchpad";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
const requests = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
await page.route("**/api/ai/status", (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ configured: true, model: "mock-model", provider: "mock" }) }));
await page.route("**/api/ai/curatorRespond", async (r) => {
  const body = r.request().postDataJSON();
  requests.push({ stream: !!body.stream, mode: body.input.mode, keys: Object.keys(body.input), ctxKeys: Object.keys(body.input.context ?? {}), messages: body.input.messages.length });
  if (body.stream) {
    return r.fulfill({ contentType: "text/plain; charset=utf-8", body: "Two accounts differ. Before deciding who is lying, ask which account is more specific and which changed under a follow-up.\n\nWhat did each say about the time?" });
  }
  return r.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data: { text: "Bayes' theorem is a rule for updating a probability when new evidence arrives. The posterior is proportional to the prior times the likelihood.\n\nIt matters because most intuitive errors are failures to weigh the prior.", thinkFirst: false, isKnowledgeAnswer: true, suggestedArchiveTitle: "Bayes' Theorem" } }) });
});
await page.goto("http://localhost:3000/enter?skip=1&name=Ismail", { waitUntil: "networkidle" });
await page.goto("http://localhost:3000/curator?mode=reason", { waitUntil: "networkidle" });
await page.waitForSelector("textarea");
const ask = async (t) => {
  await page.fill("textarea", t);
  await page.click("button:has-text('Ask')");
  await page.waitForFunction(() => ![...document.querySelectorAll("button")].some((b) => b.textContent?.includes("Considering")), null, { timeout: 15000 });
  await page.waitForTimeout(300);
};
const out = {};
out.status = await page.locator("text=Live · mock-model").count();
await page.evaluate(() => { const p = window.localStorage; p.setItem("x", "1"); });
// Streaming path: an attempt is included so Think First does not intercept
await ask("Two colleagues gave different accounts. I think the second is lying because his story changed twice when I asked about the timeline, but I am not certain.");
out.streamReply = await page.locator("ol li").nth(1).innerText();
// Structured path: a knowledge question
await ask("What is Bayes' theorem?");
out.knowledgeReply = (await page.locator("ol li").nth(3).innerText()).slice(0, 120);
out.offers = await page.locator("button:has-text('Save to Archive'), button:has-text('Test me later')").count();
await page.click("button:has-text('Save to Archive')");
await page.waitForSelector("text=Saved to the Archive");
await page.click("button:has-text('Test me later')");
await page.waitForSelector("text=Scheduled for recall");
await page.screenshot({ path: `${S}/curator-model.png` });
out.db = await page.evaluate(async () => {
  const open = (name) => new Promise((res, rej) => { const r = indexedDB.open(name); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const db = await open("the-study");
  const all = (store) => new Promise((res) => { const t = db.transaction(store).objectStore(store).getAll(); t.onsuccess = () => res(t.result); t.onerror = () => res([]); });
  const gen = await all("generated_content");
  const mem = await all("memory_items");
  const g = gen.find((x) => x.kind === "archive");
  return { generatedArchive: g ? { refId: g.refId, title: g.payload.title, origin: g.payload.origin, model: g.model } : null, memory: mem.filter((m) => m.sourceRef?.kind === "curator").map((m) => [m.prompt, m.answer.slice(0, 50), m.kind]) };
});
out.requests = requests;
console.log(JSON.stringify({ ...out, errors }, null, 1));
await browser.close();
