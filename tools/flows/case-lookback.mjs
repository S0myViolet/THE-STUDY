// A case: move past the entrance and the timed file, then look back.
// Enter must reopen read-only; the timed Notice stage must stay closed.
import { chromium } from "@playwright/test";
import fs from "node:fs";

fs.mkdirSync("/tmp/shots/rooms", { recursive: true });
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
await page.goto("http://localhost:3000/enter?skip=1&name=Ismail", { waitUntil: "networkidle" });
await page.goto("http://localhost:3000/casebook/case-baseline-lost-bag", { waitUntil: "networkidle" });
const out = {};

// 1. Skip straight through Enter without reading, then sit through the timed file.
await page.getByRole("button", { name: "Open the file" }).click();
await page.getByRole("button", { name: "Show it" }).click();
await page.waitForTimeout(500);
await page.keyboard.press("Space");
await page.getByRole("button", { name: "Check" }).waitFor();
out.onRecall = true;

// 2. The stage list: Enter opens, Notice is closed, Recall is current.
const nav = page.getByRole("list", { name: "Stages" }).first();
out.enterIsButton = (await nav.getByRole("button", { name: "Enter", exact: true }).count()) === 1;
out.noticeIsButton = (await nav.getByRole("button", { name: /Notice/ }).count()) > 0;
out.noticeClosedMark = (await nav.getByText("closed").count()) === 1;

// 3. Look back at Enter: narrative visible, no "Open the file", a way back.
await nav.getByRole("button", { name: "Enter", exact: true }).click();
await page.waitForTimeout(300);
out.reviewBanner = (await page.getByText(/Looking back at Enter/).count()) === 1;
out.narrativeVisible = (await page.getByText(/You are covering the front desk/).count()) >= 1;
out.openFileHidden = (await page.getByRole("button", { name: "Open the file" }).count()) === 0;
await page.screenshot({ path: "/tmp/shots/rooms/case-lookback.png" });

// 4. Return: the recall form is still there with its answers untouched.
await page.getByRole("button", { name: /Back to Recall/ }).first().click();
await page.waitForTimeout(300);
out.backOnRecall = (await page.getByRole("button", { name: "Check" }).count()) === 1;

// 5. Reload mid-recall: the attempt index persisted, Enter still reopens, Notice still closed.
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(500);
out.afterReloadOnRecall = (await page.getByRole("button", { name: "Check" }).count()) === 1;
out.afterReloadEnterOpens = (await nav.getByRole("button", { name: "Enter", exact: true }).count()) === 1;
out.afterReloadNoticeClosed = (await nav.getByText("closed").count()) === 1;

// 6. Mobile: the compact stage row appears with the same rules.
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(300);
const mobileNav = page.getByRole("list", { name: "Stages" }).last();
out.mobileEnterOpens = (await mobileNav.getByRole("button", { name: "Enter", exact: true }).count()) === 1;
await page.screenshot({ path: "/tmp/shots/rooms/case-lookback-mobile.png" });

out.errors = errors;
console.log(JSON.stringify(out, null, 1));
await browser.close();
