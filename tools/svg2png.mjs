// node tools/svg2png.mjs <in.svg> <out.png>
import { chromium } from "@playwright/test";
import fs from "node:fs";
const [, , inp, out] = process.argv;
const svg = fs.readFileSync(inp, "utf8");
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 960, height: 600 } });
await page.setContent(`<html><head><style>@font-face{font-family:Newsreader;src:url(file:///home/user/THE-STUDY/public/fonts/Newsreader-normal.woff2)}@font-face{font-family:Geist;src:url(file:///home/user/THE-STUDY/public/fonts/Geist-normal.woff2)}:root{--font-serif:Newsreader,serif;--font-sans:Geist,sans-serif;--font-mono:monospace}body{margin:0;background:#f4f1ea}svg{width:960px;height:600px;display:block}</style></head><body>${svg}</body></html>`);
await page.waitForTimeout(300);
await page.screenshot({ path: out });
await browser.close();
console.log("wrote", out);
