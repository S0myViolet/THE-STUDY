import { chromium } from "@playwright/test";
import fs from "node:fs";
const files = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 960, height: 600 }, deviceScaleFactor: 1 });
for (const f of files) {
  const svg = fs.readFileSync(f, "utf8");
  await page.setContent(`<style>html,body{margin:0;background:#fff}svg{width:960px;height:600px;display:block}</style>${svg}`);
  await page.screenshot({ path: f.replace(/\.svg$/, ".png") });
}
await browser.close();
