import { expect, test, type Page } from "@playwright/test";

/**
 * User journeys through THE STUDY. Every test starts in a fresh browser context
 * (a fresh local Study in IndexedDB) and needs no credentials or network.
 */

async function enter(page: Page, name = "Ismail") {
  await page.goto(`/enter?skip=1&name=${name}`);
  await page.waitForURL(/\/desk/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(name);
}

const noPageErrors = (page: Page) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
};

test("1. Entrance: goals, interests, length, baseline, first map, Desk", async ({ page }) => {
  const errors = noPageErrors(page);
  await page.goto("/enter");
  await page.getByRole("button", { name: "Enter" }).click();
  await page.getByPlaceholder("A first name is enough").fill("Ismail");
  await page.getByRole("button", { name: /Notice more/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "History", exact: true }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /Quick/ }).click();
  await page.getByRole("button", { name: "Begin the first case" }).click();
  await expect(page.getByText("The Bag That Was Not There")).toBeVisible();
  await page.getByRole("button", { name: "Skip the case for now" }).click();
  await expect(page.getByText("The baseline", { exact: true })).toBeVisible();
  // Glance
  await page.getByRole("button", { name: "Show it" }).click();
  await page.waitForTimeout(400);
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Check" }).waitFor();
  const idk = page.getByRole("button", { name: "I don't know" });
  for (let i = 0; i < (await idk.count()); i++) await idk.nth(i).click();
  const choices = page.locator("button.choice");
  const seen = new Set<number>();
  for (let i = 0; i < (await choices.count()); i++) {
    const y = Math.round(((await choices.nth(i).boundingBox())?.y ?? 0) / 200);
    if (!seen.has(y)) {
      seen.add(y);
      await choices.nth(i).click();
    }
  }
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByText(/of 5 from a twelve-second look/)).toBeVisible();
  // The rest of the baseline can be skipped; the map still renders.
  await page.getByRole("button", { name: "Skip the baseline for now" }).click();
  await expect(page.getByText("This is a starting estimate based on limited evidence. The Study will revise it as it learns how you think.")).toBeVisible();
  await page.getByRole("button", { name: "Enter the Study" }).click();
  await page.waitForURL(/\/desk/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Ismail");
  expect(errors).toEqual([]);
});

test("2. Casebook: open today's case and read the file", async ({ page }) => {
  await enter(page);
  await page.goto("/casebook");
  const first = page.locator("a[href^='/casebook/case-']").first();
  await expect(first).toBeVisible();
  await first.click();
  await page.getByRole("button", { name: "Open the file" }).click();
  await expect(page.getByRole("button", { name: "Show it" })).toBeVisible();
  // Stage progress persists across a reload.
  await page.reload();
  await expect(page.getByRole("button", { name: "Show it" })).toBeVisible();
});

test("3. Observation: the Glance records an attempt and shows precision", async ({ page }) => {
  const errors = noPageErrors(page);
  await enter(page);
  await page.goto("/observation/glance");
  await page.getByRole("button", { name: "Show it" }).click();
  await page.waitForTimeout(300);
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Submit" }).waitFor();
  const idk = page.getByRole("button", { name: "I don't know" });
  for (let i = 0; i < (await idk.count()); i++) await idk.nth(i).click();
  const choices = page.locator("button.choice");
  const seen = new Set<number>();
  for (let i = 0; i < (await choices.count()); i++) {
    const y = Math.round(((await choices.nth(i).boundingBox())?.y ?? 0) / 200);
    if (!seen.has(y)) {
      seen.add(y);
      await choices.nth(i).click();
    }
  }
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByRole("button", { name: "Another glance" })).toBeVisible();
  await page.goto("/profile");
  await expect(page.getByText(/Observation/).first()).toBeVisible();
  expect(errors).toEqual([]);
});

test("4. Inference: a Base Rate challenge takes a pick, a confidence and an estimate", async ({ page }) => {
  await enter(page);
  await page.goto("/inference/base_rate");
  await expect(page.locator("button.choice").first()).toBeVisible();
  await page.locator("button.choice").first().click();
  // Every inference commit asks how sure you are.
  const stop = page.getByRole("button", { name: "80", exact: true });
  if (await stop.count()) await stop.click();
  const estimate = page.getByLabel(/Your estimate/);
  if (await estimate.count()) await estimate.fill("0.1");
  await page.getByRole("button", { name: /Commit/ }).click();
  await expect(page.locator("button.choice[data-correct], button.choice[data-wrong]").first()).toBeVisible();
});

test("5. Salon: questions reveal facts, review persists", async ({ page }) => {
  await enter(page);
  await page.goto("/salon/sal-professor-print");
  await page.waitForSelector("textarea");
  const ask = async (t: string) => {
    await page.fill("textarea", t);
    await page.click("button:has-text('Say it')");
    await page.waitForTimeout(900);
  };
  await ask("What was literacy like around 1500? Who could actually read?");
  await ask("What about the Hussites in Bohemia, before printing existed?");
  await ask("Which counterexample do you personally find most awkward for the thesis?");
  expect(await page.locator("aside li.border-forest").count()).toBeGreaterThan(0);
  await page.click("button:has-text('End the conversation')");
  await page.click("button:has-text('Review the conversation')");
  await expect(page.getByText("Post-conversation review")).toBeVisible();
  // The review is kept: the Salon lists past conversations and reopens them read-only.
  await page.goto("/salon");
  await page.locator("a[href*='?past=']").first().click();
  await expect(page.getByText("Post-conversation review")).toBeVisible();
});

test("6. Strategy Table: a run reaches the debrief and the list shows it", async ({ page }) => {
  await enter(page);
  await page.goto("/strategy/st-society-sponsor");
  await page.click("button:has-text('Skip to the table')");
  for (let i = 0; i < 8; i++) {
    const choices = page.locator("button.choice");
    if ((await choices.count()) === 0) break;
    await choices.nth(1).click();
    await page.waitForTimeout(300);
    const next = page.locator("button:has-text('Then what?'), button:has-text('See how it ends')");
    if ((await next.count()) === 0) break;
    await next.first().click();
    await page.waitForTimeout(400);
  }
  await expect(page.getByText("Debrief").first()).toBeVisible();
});

test("7. Archive to Memory: read an entry, save it, review it", async ({ page }) => {
  await enter(page);
  await page.goto("/archive/printing-press");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Printing/i);
  await page.getByRole("button", { name: "Save to Memory" }).click();
  await expect(page.getByRole("button", { name: "Saved to Memory" })).toBeVisible();
  await page.goto("/memory/review");
  const reveal = page.getByRole("button", { name: "Reveal" });
  if (await reveal.count()) {
    await reveal.click();
    await page.getByRole("button", { name: "Recalled" }).click();
  }
  await page.goto("/memory");
  await expect(page.getByText(/item/i).first()).toBeVisible();
});

test("8. Forecasts: record, resolve, see a Brier score", async ({ page }) => {
  await enter(page);
  await page.goto("/forecasts/new");
  await page.getByPlaceholder(/Will X occur/).fill("Will the harbour bridge reopen to traffic before the end of the month?");
  await page.locator("input[type=range]").first().fill("70");
  const areas = page.locator("textarea");
  for (let i = 1; i < (await areas.count()); i++) await areas.nth(i).fill("Reasoning written for the test, specific enough to be wrong.");
  const date = page.locator("input[type=date]");
  if (await date.count()) await date.first().fill("2026-12-31");
  await page.getByRole("button", { name: "Record the forecast" }).click();
  await page.waitForURL(/\/forecasts\/(?!new)/);
  await page.getByRole("button", { name: "It happened" }).click();
  await expect(page.getByText(/Brier/).first()).toBeVisible();
});

test("9. Decisions: log one, review it early, decision and outcome quality are separate", async ({ page }) => {
  await enter(page);
  await page.goto("/decisions/new");
  await page.getByPlaceholder("Whether to take the Lisbon role").fill("Whether to take the Lisbon role");
  const option = page.getByPlaceholder("One option, then Enter");
  await option.fill("Take it");
  await option.press("Enter");
  await option.fill("Stay");
  await option.press("Enter");
  await page.getByPlaceholder("What you think is true about the situation.").fill("The team is strong and the city suits me.");
  await page.getByPlaceholder("Specific enough to be wrong.").fill("I will be glad in six months.");
  const range = page.locator("input[type=range]");
  if (await range.count()) await range.first().fill("70");
  const others = page.locator("textarea");
  for (let i = 0; i < (await others.count()); i++) if (!(await others.nth(i).inputValue())) await others.nth(i).fill("Written for the test.");
  const date = page.locator("input[type=date]");
  if (await date.count()) await date.first().fill("2026-12-31");
  await page.getByRole("button", { name: "Record the decision" }).click();
  await page.waitForURL(/\/decisions\/(?!new)/);
  await page.getByRole("button", { name: /Review (now|early)/ }).click();
  const reviewAreas = page.locator("textarea");
  for (let i = 0; i < (await reviewAreas.count()); i++) await reviewAreas.nth(i).fill("It went as expected; some luck in timing.");
  await page.getByRole("button", { name: "File the review" }).click();
  await expect(page.getByText("Decision quality")).toBeVisible();
});

test("10. Demonstration profile: thirty days of evidence, patterns and a labelled banner", async ({ page }) => {
  test.setTimeout(240_000);
  await enter(page);
  await page.goto("/settings/data");
  await page.click("button:has-text('Load the demonstration profile')");
  await page.waitForURL(/\/desk/, { timeout: 200_000 });
  await expect(page.getByText(/demonstration/i).first()).toBeVisible();
  await page.goto("/red-thread");
  await expect(page.locator("a[href^='/red-thread/rt_']").first()).toBeVisible();
  await page.goto("/profile");
  await expect(page.locator("svg[role=group]").first()).toBeVisible();
});

test("11. Command palette: search and jump to a room", async ({ page }) => {
  await enter(page);
  await page.keyboard.press("Control+k");
  const box = page.getByRole("combobox", { name: "Search" });
  await box.fill("Give me a Glance");
  await page.keyboard.press("Enter");
  await page.waitForURL(/\/observation\/glance/);
});

test("12. Settings: export produces a JSON file", async ({ page }) => {
  await enter(page);
  await page.goto("/settings/data");
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Export everything" }).click()]);
  expect(download.suggestedFilename()).toMatch(/\.json$/);
});
